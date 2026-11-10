import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  User,
  Check,
  CheckCheck,
  Circle,
  Clock,
  Sparkles,
  ChevronLeft,
  Crown,
  AlertCircle,
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import { useDailyMessageUsage } from '../../hooks/useDailyMessageUsage';
import UpgradeMembershipModal from '../../components/common/UpgradeMembershipModal';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { refreshNotifications } = useNotifications();
  const { usage, countdown, refreshUsage } = useDailyMessageUsage();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [partnerInfo, setPartnerInfo] = useState<any | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Load conversation list
  const fetchConversations = async () => {
    try {
      const res = await chatService.getConversations();
      if (res.success) {
        setConversations(res.data || []);
        if (res.data?.length > 0 && !activeConversation) {
          setActiveConversation(res.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    refreshUsage();

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const res = await chatService.getMessages(activeConversation.id);
        if (res.success) {
          setMessages(res.data.messages || []);
          setPartnerInfo(res.data.partner || null);
          refreshNotifications();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();

    // Join room in socket
    if (socket) {
      socket.emit('join_conversation', activeConversation.id);
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', activeConversation.id);
      }
    };
  }, [activeConversation, socket, refreshNotifications]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      if (activeConversation && msg.conversationId === activeConversation.id) {
        setMessages((prev) => [...prev, msg]);
      }
      fetchConversations();
    };

    const handlePartnerTyping = ({ conversationId }: { conversationId: string }) => {
      if (activeConversation && conversationId === activeConversation.id) {
        setIsTyping(true);
      }
    };

    const handlePartnerStoppedTyping = ({ conversationId }: { conversationId: string }) => {
      if (activeConversation && conversationId === activeConversation.id) {
        setIsTyping(false);
      }
    };

    const handleMessageError = (payload: any) => {
      if (payload && payload.code === 'DAILY_MESSAGE_LIMIT_REACHED') {
        setShowUpgradeModal(true);
        refreshUsage();
      }
    };

    socket.on('new_conversation_message', handleNewMessage);
    socket.on('partner_typing', handlePartnerTyping);
    socket.on('partner_stopped_typing', handlePartnerStoppedTyping);
    socket.on('message_error', handleMessageError);

    return () => {
      socket.off('new_conversation_message', handleNewMessage);
      socket.off('partner_typing', handlePartnerTyping);
      socket.off('partner_stopped_typing', handlePartnerStoppedTyping);
      socket.off('message_error', handleMessageError);
    };
  }, [socket, activeConversation, refreshUsage]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !activeConversation) return;

    socket.emit('typing_start', {
      conversationId: activeConversation.id,
      receiverId: activeConversation.partnerId,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        conversationId: activeConversation.id,
        receiverId: activeConversation.partnerId,
      });
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const res = await chatService.sendMessage({
        conversationId: activeConversation.id,
        content: text,
      });

      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        fetchConversations();
        refreshUsage();
      }
    } catch (err: any) {
      console.error(err);
      const isLimit =
        err?.response?.status === 403 &&
        (err?.response?.data?.code === 'DAILY_MESSAGE_LIMIT_REACHED' ||
         err?.response?.data?.message?.includes('daily messaging limit'));

      if (isLimit || err?.code === 'DAILY_MESSAGE_LIMIT_REACHED') {
        setShowUpgradeModal(true);
        refreshUsage();
      }
    }
  };

  const isPartnerOnline = activeConversation && onlineUsers.has(activeConversation.partnerId);

  return (
    <div className="bg-white rounded-3xl border border-gold-200/90 shadow-xl overflow-hidden h-[calc(100vh-140px)] flex flex-col md:flex-row">
      
      {/* LEFT: CONVERSATION LIST */}
      <div
        className={`w-full md:w-80 border-r border-gold-200/80 flex flex-col shrink-0 bg-ivory-50/50 ${
          activeConversation ? 'hidden md:flex' : 'flex'
        } flex-1 md:flex-initial h-full`}
      >
        <div className="p-4 border-b border-gold-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-800" />
            <h2 className="font-serif font-bold text-base text-charcoal-900">Conversations</h2>
          </div>
          <span className="text-[10px] font-bold bg-gold-200/80 text-gold-900 px-2 py-0.5 rounded-full">
            {conversations.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gold-100">
          {loading ? (
            <div className="text-center py-12 text-xs text-gray-500">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <p className="text-xs text-gray-500">No active conversations.</p>
              <p className="text-[11px] text-gray-400">
                Connect with profiles or accept interest requests to begin conversations.
              </p>
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = activeConversation?.id === c.id;
              const online = onlineUsers.has(c.partnerId);

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConversation(c)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition ${
                    isSelected ? 'bg-primary-50/80 border-l-4 border-primary-800' : 'hover:bg-gold-50/60'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-ivory-200 border border-gold-300 shrink-0">
                    {c.partnerPhoto ? (
                      <img src={c.partnerPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-primary-800 text-xs">
                        {c.partnerName?.[0] || 'M'}
                      </div>
                    )}
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-xs text-charcoal-900 truncate">
                        {c.partnerName}
                      </h4>
                      {c.lastMessageAt && (
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{c.lastMessage || 'Connected! Say Namaste.'}</p>
                  </div>

                  {c.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: CHAT WINDOW */}
      <div
        className={`flex-1 flex flex-col justify-between bg-white ${
          !activeConversation ? 'hidden md:flex' : 'flex'
        } h-full`}
      >
        {activeConversation ? (
          <>
            {/* Chat Top Header */}
            <div className="p-4 px-4 sm:px-6 border-b border-gold-200/80 flex items-center justify-between bg-white shadow-xs">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden -ml-1 p-1.5 rounded-xl border border-gold-300/80 text-charcoal-700 hover:bg-gold-50 flex items-center justify-center transition"
                  title="Back to conversations"
                >
                  <ChevronLeft className="w-5 h-5 text-primary-800" />
                </button>

                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-ivory-200 border border-gold-300 shrink-0">
                  {partnerInfo?.photo ? (
                    <img src={partnerInfo.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-primary-800 text-xs">
                      {partnerInfo?.fullName?.[0] || activeConversation.partnerName?.[0] || 'M'}
                    </div>
                  )}
                  {isPartnerOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-charcoal-900 truncate max-w-[160px] sm:max-w-xs">
                    {partnerInfo?.fullName || activeConversation.partnerName}
                  </h3>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Circle className={`w-2 h-2 ${isPartnerOnline ? 'text-green-500 fill-green-500' : 'text-gray-300 fill-gray-300'}`} />
                    {isPartnerOnline ? 'Active Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Compact Membership Quota Badge */}
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs ${
                    usage?.isUnlimited
                      ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                      : (usage?.remainingToday ?? 5) === 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 animate-pulse'
                      : (usage?.remainingToday ?? 5) <= 2
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-gold-50 text-gold-900 border-gold-300 hover:bg-gold-100'
                  }`}
                  title="View membership quota & upgrade"
                >
                  <Crown className="w-3.5 h-3.5 text-gold-600" />
                  <span>
                    {usage?.isUnlimited
                      ? 'PLATINUM: Unlimited'
                      : `${usage?.effectivePlan || 'FREE'}: ${usage?.remainingToday ?? 5} / ${usage?.dailyLimit ?? 5} left`}
                  </span>
                  {!usage?.isUnlimited && (
                    <span className="text-[10px] text-primary-800 underline ml-0.5 font-semibold">Upgrade</span>
                  )}
                </button>

                <Link
                  to={`/profile/${activeConversation.partnerId}`}
                  className="hidden sm:inline-block text-xs font-semibold text-primary-800 hover:text-primary-950 px-3 py-1.5 rounded-lg border border-gold-300 hover:bg-gold-50 transition shrink-0"
                >
                  View Profile
                </Link>
              </div>
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-gradient-to-b from-ivory-100/60 to-white">
              {loadingMessages ? (
                <div className="text-center py-12 text-xs text-gray-400">Loading chat history...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Sparkles className="w-8 h-8 text-gold-500 mx-auto" />
                  <p className="font-serif font-bold text-sm text-charcoal-800">
                    Connection Accepted!
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Take the first step to say hello, ask about family, and get to know each other.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === user?.id;

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} animate-fadeIn`}
                    >
                      {/* Message Bubble Container */}
                      <div
                        className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs transition-all duration-150 ${
                          isMine
                            ? 'bg-[#FCE8ED] text-[#292929] border border-[#F7C6D2] rounded-br-xs hover:border-[#E8A5B6]'
                            : 'bg-[#FFF7E8] text-[#292929] border border-[#F3E2C3] rounded-bl-xs hover:border-[#DEC596]'
                        }`}
                        style={{
                          backgroundColor: isMine ? '#FCE8ED' : '#FFF7E8',
                          color: '#292929',
                        }}
                      >
                        {/* Explicit High-Contrast Message Content */}
                        <p
                          className="text-[#292929] text-xs font-normal leading-relaxed break-words whitespace-pre-wrap select-text"
                          style={{ color: '#292929' }}
                        >
                          {m.content}
                        </p>

                        {/* Timestamp & Delivery/Read Status */}
                        <div
                          className="flex items-center justify-end gap-1.5 text-[10px] mt-1.5 select-none"
                          style={{ color: '#777777' }}
                        >
                          <span
                            className="font-medium text-[#777777]"
                            style={{ color: '#777777' }}
                          >
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (
                            m.isRead ? (
                              <span title="Read">
                                <CheckCheck className="w-3.5 h-3.5 text-primary-700 stroke-[2.2]" />
                              </span>
                            ) : (
                              <span title="Delivered">
                                <Check className="w-3.5 h-3.5 text-[#777777] stroke-[2.2]" />
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 italic bg-[#FFF7E8] border border-[#F3E2C3] px-3.5 py-1.5 rounded-full w-fit shadow-xs">
                  <span className="w-1.5 h-1.5 bg-gold-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gold-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gold-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 text-[11px] text-charcoal-800 font-medium">partner is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Daily Quota Allowance Bar */}
            <div className="px-4 py-2 bg-slate-50/90 border-t border-gold-200/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  usage?.isUnlimited ? 'bg-purple-500' :
                  (usage?.remainingToday ?? 5) > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
                <span className="text-gray-600 font-medium">
                  {usage?.isUnlimited ? (
                    'You have unlimited messaging.'
                  ) : (usage?.remainingToday ?? 5) > 0 ? (
                    <>You have <strong>{usage?.remainingToday ?? 5}</strong> {usage?.effectivePlan === 'FREE' ? 'free ' : ''}message{(usage?.remainingToday ?? 5) === 1 ? '' : 's'} remaining today.</>
                  ) : (
                    <span className="text-rose-600 font-semibold">
                      You have used all {usage?.dailyLimit ?? 5} daily messages.
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {!usage?.isUnlimited && (
                  <span className="text-gray-400 text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="hidden sm:inline">Reset in:</span> <strong>{countdown.shortFormatted}</strong>
                  </span>
                )}
                {!usage?.isUnlimited && (
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="text-primary-800 hover:text-primary-950 font-bold underline text-[11px]"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>

            {/* Message Input Bar */}
            {(() => {
              const isQuotaExhausted = !usage?.isUnlimited && (usage?.remainingToday ?? 5) <= 0;
              return (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
                  <input
                    type="text"
                    disabled={isQuotaExhausted}
                    placeholder={
                      isQuotaExhausted
                        ? "Daily message limit reached. Upgrade to continue chatting today..."
                        : "Type your message with respect and kindness..."
                    }
                    value={inputText}
                    onChange={handleInputChange}
                    className={`flex-1 h-12 px-4 text-xs rounded-2xl border ${
                      isQuotaExhausted
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 focus:outline-none focus:border-primary-700 text-charcoal-900 placeholder:text-gray-400 shadow-xs'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isQuotaExhausted}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-r from-primary-800 to-primary-950 text-white flex items-center justify-center shadow-rose-glow hover:shadow-lg disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="w-4 h-4 text-gold-300" />
                  </button>
                </form>
              );
            })()}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-gold-400" />
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Select a Conversation</h3>
            <p className="text-xs text-gray-500 max-w-sm">
              Choose a match from the left panel to begin instant real-time conversation.
            </p>
          </div>
        )}

      </div>

      <UpgradeMembershipModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUsage={usage}
        countdownFormatted={countdown.shortFormatted}
        onUpgraded={() => {
          refreshUsage();
        }}
      />

    </div>
  );
}
