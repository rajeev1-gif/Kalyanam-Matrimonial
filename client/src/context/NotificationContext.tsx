import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { notificationService } from '../services/notificationService';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { Notification } from '../types';

interface Toast {
  id: number;
  message: string;
  type: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadNotificationCount: number;
  unreadMessageCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  showToast: (message: string, type?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  const fetchNotificationData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [notifRes, msgRes] = await Promise.all([
        notificationService.getNotifications(),
        chatService.getUnreadCount(),
      ]);

      if (notifRes.success && notifRes.data) {
        setNotifications((notifRes.data as any).notifications || []);
        setUnreadNotificationCount((notifRes.data as any).unreadCount || 0);
      }
      if (msgRes.success && msgRes.data) {
        setUnreadMessageCount((msgRes.data as any).unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotificationData();
  }, [fetchNotificationData]);

  // Socket listener for real-time alerts
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (msg: any) => {
      setUnreadMessageCount((prev) => prev + 1);
      showToast(`New message from ${msg.senderName || 'a connection'}: ${(msg.content || '').slice(0, 40)}`, 'info');
    });

    socket.on('notification', (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadNotificationCount((prev) => prev + 1);
      showToast(notif.title, 'success');
    });

    return () => {
      socket.off('receive_message');
      socket.off('notification');
    };
  }, [socket, showToast]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadNotificationCount,
        unreadMessageCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotificationData,
        showToast,
      }}
    >
      {children}
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div className="bg-charcoal-900 border border-gold-400 text-ivory-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 max-w-md">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-ping"></span>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
