import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  AlertTriangle,
  Crown,
  DollarSign,
  TrendingUp,
  Shield,
  Activity,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await adminService.getAnalytics();
        if (res.success) setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-xs text-gray-500">Loading admin metrics...</div>;
  }

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Platform Overview & Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics, user breakdown, and revenue monitoring
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Registered</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-slate-900 font-serif">
            {analytics?.totalUsers || 0}
          </span>
          <p className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +{analytics?.newRegistrations || 0} in last 30 days
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-slate-900 font-serif">
            ₹{(analytics?.revenue?.totalAmount || 0).toLocaleString('en-IN')}
          </span>
          <p className="text-[11px] text-slate-500 font-medium">
            {analytics?.revenue?.totalTransactions || 0} paid subscription orders
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Profiles</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-slate-900 font-serif">
            {analytics?.statusStats?.active || 0}
          </span>
          <p className="text-[11px] text-slate-500 font-medium">
            {analytics?.statusStats?.suspended || 0} accounts suspended
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Safety Reports</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-slate-900 font-serif">
            {analytics?.pendingReports || 0}
          </span>
          <p className="text-[11px] text-rose-600 font-semibold">
            Pending administrative review
          </p>
        </div>

      </div>

      {/* Demographic & Subscription Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gender Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900">
            Profile Demographics (Brides vs Grooms)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-pink-50 border border-pink-100 space-y-1">
              <span className="text-xs text-pink-700 font-bold uppercase">Female (Brides)</span>
              <p className="text-2xl font-bold text-pink-950 font-serif">{analytics?.genderStats?.female || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-1">
              <span className="text-xs text-blue-700 font-bold uppercase">Male (Grooms)</span>
              <p className="text-2xl font-bold text-blue-950 font-serif">{analytics?.genderStats?.male || 0}</p>
            </div>
          </div>
        </div>

        {/* Subscriptions breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900">
            Active Subscriptions by Tier
          </h3>
          <div className="space-y-2">
            {analytics?.subscriptionsBreakdown?.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                <span className="font-bold text-slate-800">{s.planName}</span>
                <span className="bg-white px-3 py-1 rounded-full border border-slate-200 font-bold">
                  {s.count} members
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

