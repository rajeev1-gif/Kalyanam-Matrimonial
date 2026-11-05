import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Inbox, Heart, MessageSquare, Eye, Crown, Info } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationsPage() {
  const { markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success) setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'INTEREST_RECEIVED':
      case 'INTEREST_ACCEPTED':
        return <Heart className="w-5 h-5 text-rose-600" />;
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'PROFILE_VIEW':
        return <Eye className="w-5 h-5 text-gold-600" />;
      case 'SUBSCRIPTION_UPDATED':
        return <Crown className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-primary-700" />;
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
      fetchNotifs();
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    fetchNotifs();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-gold-200/80 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-800" />
            Activity & Notifications
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Stay updated with interest responses, messages, and profile views
          </p>
        </div>
        <button
          onClick={handleMarkAll}
          className="text-xs font-semibold text-primary-800 hover:text-primary-950 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gold-300 hover:bg-gold-50 transition"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gold-200 text-center space-y-2">
          <p className="text-xs text-gray-500">No notifications to display.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gold-200 overflow-hidden divide-y divide-gold-50 shadow-sm">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer hover:bg-gold-50/50 transition ${
                !n.isRead ? 'bg-primary-50/40 font-medium' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-ivory-200 border border-gold-200 flex items-center justify-center shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs text-charcoal-900">{n.title}</h4>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

