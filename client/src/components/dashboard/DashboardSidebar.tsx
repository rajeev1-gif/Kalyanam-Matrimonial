import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Edit3,
  Search,
  Sparkles,
  Heart,
  Send,
  Inbox,
  Users,
  MessageSquare,
  Bell,
  Crown,
  Settings,
  Eye,
  LucideIcon,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarLink {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number | null;
  highlight?: boolean;
}

export default function DashboardSidebar() {
  const { unreadNotificationCount, unreadMessageCount } = useNotifications();
  const { user } = useAuth();

  const links: SidebarLink[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/my-profile', label: 'My Profile', icon: User },
    { to: '/dashboard/edit-profile', label: 'Edit Profile Wizard', icon: Edit3 },
    { to: '/search', label: 'Search Matches', icon: Search },
    { to: '/dashboard/recommended', label: 'Recommended Matches', icon: Sparkles },
    { to: '/dashboard/shortlisted', label: 'Shortlisted Profiles', icon: Heart },
    { to: '/dashboard/received-interests', label: 'Received Interests', icon: Inbox },
    { to: '/dashboard/sent-interests', label: 'Sent Interests', icon: Send },
    { to: '/dashboard/connections', label: 'My Connections', icon: Users },
    {
      to: '/dashboard/messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessageCount > 0 ? unreadMessageCount : null,
    },
    {
      to: '/dashboard/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : null,
    },
    { to: '/dashboard/views', label: 'Profile Views', icon: Eye },
    { to: '/dashboard/membership', label: 'Membership Plans', icon: Crown, highlight: true },
    { to: '/dashboard/settings', label: 'Account Settings', icon: Settings },
  ];

  const planName = user?.subscriptions?.[0]?.plan?.name || 'Free Plan';

  return (
    <aside className="w-64 bg-white border-r border-gold-200/80 min-h-[calc(100vh-80px)] flex flex-col justify-between shrink-0 shadow-sm">
      
      {/* Top Section */}
      <div className="p-4 space-y-6">
        
        {/* User Mini Card */}
        <div className="bg-gradient-to-br from-ivory-300 via-gold-50 to-pink-50 p-3.5 rounded-2xl border border-gold-300/80 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-100 border-2 border-gold-400 shrink-0">
            {user?.profile?.photos?.[0]?.url ? (
              <img
                src={user.profile.photos[0].url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-primary-800">
                {user?.profile?.fullName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-charcoal-900 truncate">
              {user?.profile?.fullName || 'My Account'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold text-primary-800 bg-primary-100/80 px-2 py-0.5 rounded-full inline-block truncate">
                {planName}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-800 to-primary-700 text-white shadow-sm font-semibold'
                      : link.highlight
                      ? 'text-amber-800 bg-amber-50/70 hover:bg-amber-100/70'
                      : 'text-charcoal-800 hover:bg-gold-50/70 hover:text-primary-800'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

      </div>

      {/* Footer Support Info */}
      <div className="p-4 border-t border-gold-100 text-[11px] text-gray-500">
        <p className="font-semibold text-charcoal-800">Need Help?</p>
        <p className="mt-0.5">Call Concierge: 1800 200 4545</p>
      </div>

    </aside>
  );
}
