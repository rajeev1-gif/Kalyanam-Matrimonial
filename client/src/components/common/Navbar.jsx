import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bell, MessageSquare, User, LogOut, Shield, ChevronDown, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { unreadNotificationCount, unreadMessageCount, notifications, markAsRead } = useNotifications();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-ivory-50/95 backdrop-blur-md border-b border-gold-200/60 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary-800 to-primary-600 flex items-center justify-center shadow-rose-glow border border-gold-400">
              <Heart className="w-6 h-6 text-gold-300 fill-gold-400 transition-transform group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-wide text-primary-950 group-hover:text-primary-800 transition">
                Kalyanam
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-gold-600">
                Premium Indian Matrimony
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/search" className="text-sm font-medium text-charcoal-800 hover:text-primary-700 transition">
              Browse Matches
            </Link>
            <Link to="/success-stories" className="text-sm font-medium text-charcoal-800 hover:text-primary-700 transition">
              Success Stories
            </Link>
            <Link to="/membership-plans" className="text-sm font-medium text-charcoal-800 hover:text-primary-700 transition flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gold-500" />
              Membership Plans
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifMenu(!showNotifMenu);
                      setShowProfileMenu(false);
                    }}
                    className="p-2 rounded-full hover:bg-gold-50 text-charcoal-800 transition relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-charcoal-800" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifMenu && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gold-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-gold-100 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900">Notifications</span>
                        <Link
                          to="/dashboard/notifications"
                          onClick={() => setShowNotifMenu(false)}
                          className="text-xs text-primary-700 hover:underline font-medium"
                        >
                          View All
                        </Link>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-gold-50">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-500">No new notifications</div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markAsRead(n.id);
                                if (n.link) navigate(n.link);
                                setShowNotifMenu(false);
                              }}
                              className={`p-3 text-xs hover:bg-gold-50/50 cursor-pointer transition ${!n.isRead ? 'bg-primary-50/40' : ''}`}
                            >
                              <p className="font-semibold text-charcoal-900">{n.title}</p>
                              <p className="text-gray-600 line-clamp-2 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages shortcut */}
                <Link
                  to="/dashboard/messages"
                  className="p-2 rounded-full hover:bg-gold-50 text-charcoal-800 transition relative"
                  aria-label="Messages"
                >
                  <MessageSquare className="w-5 h-5 text-charcoal-800" />
                  {unreadMessageCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                    </span>
                  )}
                </Link>

                {/* User Dashboard Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifMenu(false);
                    }}
                    className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-gold-300 hover:border-gold-500 bg-white shadow-sm transition"
                  >
                    <span className="text-xs font-semibold text-charcoal-900 max-w-[120px] truncate">
                      {user?.profile?.fullName || user?.email?.split('@')[0]}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary-100 border border-primary-300 overflow-hidden flex items-center justify-center">
                      {user?.profile?.photos?.[0]?.url ? (
                        <img
                          src={user.profile.photos[0].url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-primary-700" />
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gold-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-gold-100">
                        <p className="text-xs font-bold text-charcoal-900">{user?.profile?.fullName || 'User'}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-800 hover:bg-gold-50 transition"
                      >
                        <User className="w-4 h-4 text-primary-700" />
                        My Dashboard
                      </Link>
                      <Link
                        to="/dashboard/my-profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-800 hover:bg-gold-50 transition"
                      >
                        <Heart className="w-4 h-4 text-primary-700" />
                        View My Profile
                      </Link>
                      <Link
                        to="/dashboard/edit-profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-800 hover:bg-gold-50 transition"
                      >
                        <Sparkles className="w-4 h-4 text-gold-600" />
                        Edit Profile Wizard
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-primary-800 bg-gold-50/60 hover:bg-gold-100 transition"
                        >
                          <Shield className="w-4 h-4 text-primary-700" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-gold-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-700 to-primary-900 text-white shadow-sm hover:opacity-95 transition"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-xs font-bold text-primary-900 hover:text-primary-700 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 text-white shadow-rose-glow hover:shadow-lg hover:scale-[1.02] transition border border-gold-400"
                >
                  Register Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-800 hover:bg-gold-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ivory-50 border-b border-gold-200 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal-900"
          >
            Browse Matches
          </Link>
          <Link
            to="/success-stories"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal-900"
          >
            Success Stories
          </Link>
          <Link
            to="/membership-plans"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal-900"
          >
            Membership Plans
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-gold-200 space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-primary-800"
              >
                Go to Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-primary-800"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm text-red-600 font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-gold-200 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-primary-700 text-primary-800 font-semibold text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-primary-800 text-white font-semibold text-sm"
              >
                Register Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

