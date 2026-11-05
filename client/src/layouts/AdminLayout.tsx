import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  AlertTriangle,
  Crown,
  BookOpen,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Heart,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminNavLink {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks: AdminNavLink[] = [
    { to: '/admin', label: 'Overview Analytics', icon: LayoutDashboard, exact: true },
    { to: '/admin/users', label: 'User Accounts', icon: Users },
    { to: '/admin/profiles', label: 'Profile Moderation', icon: ShieldCheck },
    { to: '/admin/reports', label: 'Reported Accounts', icon: AlertTriangle },
    { to: '/admin/plans', label: 'Membership Plans', icon: Crown },
    { to: '/admin/success-stories', label: 'Success Stories', icon: BookOpen },
    { to: '/admin/faqs', label: 'Manage FAQs', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Admin Header */}
      <header className="bg-charcoal-950 text-white border-b border-gold-500/30 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary-800 border border-gold-400 flex items-center justify-center">
              <Heart className="w-5 h-5 text-gold-300 fill-gold-400" />
            </div>
            <span className="font-serif text-xl font-bold tracking-wide">Kalyanam</span>
          </Link>
          <span className="bg-primary-900/80 text-gold-300 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md border border-gold-400/40">
            Admin Console
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs text-gold-300 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to User View
          </Link>
          <div className="h-4 w-px bg-white/20"></div>
          <span className="text-xs text-gray-300">
            Signed in as <strong>{user?.email}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 space-y-1 shrink-0">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Management Modules
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-primary-900 text-gold-300 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-primary-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
