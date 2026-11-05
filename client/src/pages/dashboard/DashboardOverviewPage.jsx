import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Heart,
  Inbox,
  Send,
  Users,
  Crown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { searchService } from '../../services/searchService';
import { interestService } from '../../services/interestService';
import { shortlistService } from '../../services/shortlistService';
import { useAuth } from '../../context/AuthContext';
import ProfileCard from '../../components/common/ProfileCard';

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    profileViews: 0,
    interestsReceived: 0,
    interestsSent: 0,
    shortlists: 0,
    connections: 0,
  });

  const [recommendedMatches, setRecommendedMatches] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [recRes, recvdRes, sentRes, connRes, shortRes, viewsRes] = await Promise.all([
          searchService.getRecommendedMatches(),
          interestService.getReceived(),
          interestService.getSent(),
          interestService.getConnections(),
          shortlistService.getMyShortlists(),
          shortlistService.getProfileViews('who_viewed_me'),
        ]);

        if (recRes.success) setRecommendedMatches(recRes.data || []);
        if (viewsRes.success) setRecentViews(viewsRes.data || []);

        setStats({
          profileViews: viewsRes.data?.length || 0,
          interestsReceived: recvdRes.data?.length || 0,
          interestsSent: sentRes.data?.length || 0,
          connections: connRes.data?.length || 0,
          shortlists: shortRes.data?.length || 0,
        });
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const completionPct = user?.profile?.completionPercentage || 40;
  const activeSub = user?.subscriptions?.[0];
  const plan = activeSub?.plan || { name: 'Free Starter' };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-charcoal-950 rounded-3xl p-6 sm:p-8 text-white border-2 border-gold-400 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="text-[11px] font-bold tracking-widest text-gold-300 uppercase">
            Namaste & Welcome
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            {user?.profile?.fullName || 'Esteemed Member'}
          </h1>
          <p className="text-xs text-ivory-200 max-w-lg leading-relaxed">
            Your profile is active and being matched with verified candidates across your preferred communities and locations.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <Link
            to="/dashboard/edit-profile"
            className="px-5 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-charcoal-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow transition"
          >
            Edit Profile
          </Link>
          <Link
            to="/search"
            className="px-5 py-2.5 rounded-xl border border-white/30 hover:bg-white/10 text-white font-semibold text-xs transition"
          >
            Find Matches
          </Link>
        </div>
      </div>

      {/* Profile Completion Warning if incomplete */}
      {completionPct < 80 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">
                Your profile is {completionPct}% complete!
              </p>
              <p className="text-[11px] text-amber-700">
                Add education details, family background, and photographs to get verified and unlock top search placement.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/edit-profile"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shrink-0 transition"
          >
            Complete Now
          </Link>
        </div>
      )}

      {/* DASHBOARD STATS WIDGETS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <Link
          to="/dashboard/views"
          className="bg-white p-5 rounded-2xl border border-gold-200/80 shadow-sm hover:shadow-md hover:border-gold-400 transition space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-charcoal-900">{stats.profileViews}</span>
            <p className="text-[11px] text-gray-500 font-medium">Profile Views</p>
          </div>
        </Link>

        <Link
          to="/dashboard/received-interests"
          className="bg-white p-5 rounded-2xl border border-gold-200/80 shadow-sm hover:shadow-md hover:border-gold-400 transition space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-110 transition">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-charcoal-900">{stats.interestsReceived}</span>
            <p className="text-[11px] text-gray-500 font-medium">Interests Received</p>
          </div>
        </Link>

        <Link
          to="/dashboard/sent-interests"
          className="bg-white p-5 rounded-2xl border border-gold-200/80 shadow-sm hover:shadow-md hover:border-gold-400 transition space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-charcoal-900">{stats.interestsSent}</span>
            <p className="text-[11px] text-gray-500 font-medium">Interests Sent</p>
          </div>
        </Link>

        <Link
          to="/dashboard/connections"
          className="bg-white p-5 rounded-2xl border border-gold-200/80 shadow-sm hover:shadow-md hover:border-gold-400 transition space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-charcoal-900">{stats.connections}</span>
            <p className="text-[11px] text-gray-500 font-medium">Accepted Matches</p>
          </div>
        </Link>

        <Link
          to="/dashboard/shortlisted"
          className="bg-white p-5 rounded-2xl border border-gold-200/80 shadow-sm hover:shadow-md hover:border-gold-400 transition space-y-2 group col-span-2 sm:col-span-1"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-charcoal-900">{stats.shortlists}</span>
            <p className="text-[11px] text-gray-500 font-medium">Shortlisted Profiles</p>
          </div>
        </Link>

      </div>

      {/* SUBSCRIPTION & PROFILE COMPLETION WIDGET ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Plan Widget */}
        <div className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold-600" />
              <h3 className="font-serif font-bold text-sm text-charcoal-900">Active Membership</h3>
            </div>
            <span className="text-[11px] font-bold text-primary-800 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
              {plan.name}
            </span>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Remaining Interests:</span>
              <strong>{activeSub?.interestsRemaining ?? 10}</strong>
            </div>
            <div className="flex justify-between">
              <span>Remaining Contact Reveals:</span>
              <strong>{activeSub?.contactsRemaining ?? 2}</strong>
            </div>
            <div className="flex justify-between">
              <span>Direct Chat:</span>
              <strong>{activeSub?.plan?.canDirectMessage ? 'Unlocked' : 'Locked'}</strong>
            </div>
          </div>

          <Link
            to="/dashboard/membership"
            className="w-full text-center py-2.5 rounded-xl bg-gold-50 border border-gold-300 text-gold-900 font-bold text-xs hover:bg-gold-100 transition"
          >
            Upgrade / Manage Plan
          </Link>
        </div>

        {/* Profile Progress Widget */}
        <div className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-charcoal-900">Profile Completeness</h3>
            <span className="text-xs font-bold text-primary-800">{completionPct}%</span>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-gold-400 to-primary-700 h-full rounded-full"
                style={{ width: `${completionPct}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-gray-500">
              Complete higher steps in the wizard to earn a Verified badge and attract serious proposals.
            </p>
          </div>

          <Link
            to="/dashboard/edit-profile"
            className="w-full text-center py-2.5 rounded-xl bg-primary-850 hover:bg-primary-950 text-white font-bold text-xs transition"
          >
            Resume Profile Wizard
          </Link>
        </div>

        {/* Recent Profile Views Shortcut */}
        <div className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-charcoal-900">Recent Profile Visitors</h3>
            <Link to="/dashboard/views" className="text-xs text-primary-700 font-medium hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {recentViews.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">No visitors yet today.</p>
            ) : (
              recentViews.slice(0, 3).map((v, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gold-200 shrink-0">
                    {v.profile?.photos?.[0]?.url ? (
                      <img src={v.profile.photos[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-gray-500">
                        {v.profile?.fullName?.[0] || 'M'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-charcoal-900 truncate">{v.profile?.fullName}</p>
                    <p className="text-[10px] text-gray-500 truncate">{v.profile?.educationCareer?.occupationTitle || 'Member'}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/search"
            className="w-full text-center py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-charcoal-800 hover:bg-gray-50 transition"
          >
            Search More Matches
          </Link>
        </div>

      </div>

      {/* RECOMMENDED MATCHES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-600" />
            <h2 className="font-serif text-xl font-bold text-charcoal-900">
              Recommended Daily Matches For You
            </h2>
          </div>
          <Link to="/dashboard/recommended" className="text-xs text-primary-800 font-bold hover:underline">
            View All Recommendations
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-gray-500">Loading matches...</div>
        ) : recommendedMatches.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gold-200 text-center space-y-3">
            <p className="text-xs text-gray-500">No direct recommendations yet. Try broadening your partner preferences.</p>
            <Link to="/search" className="inline-block px-5 py-2 bg-primary-800 text-white rounded-xl text-xs font-bold">
              Browse All Profiles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedMatches.slice(0, 4).map((match) => (
              <ProfileCard key={match.id} profile={match} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

