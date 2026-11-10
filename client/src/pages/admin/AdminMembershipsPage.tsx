import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Plus,
  Clock,
  Ban,
  History,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Shield,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNotifications } from '../../context/NotificationContext';

interface GrantItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userMobile: string;
  userPhoto: string | null;
  userStatus: string;
  planCode: string;
  planName: string;
  dailyMessageLimit: number;
  isUnlimited: boolean;
  startDate: string;
  endDate: string | null;
  status: string;
  displayStatus: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  reason: string;
  grantedByAdmin: string;
  revokedAt: string | null;
  revokedByAdmin: string | null;
  revocationReason: string | null;
  createdAt: string;
  currentEntitlement: {
    effectivePlan: string;
    accessSource: string;
    dailyLimit: number;
    isUnlimited: boolean;
    accessExpiresAt: string | null;
  };
}

export default function AdminMembershipsPage() {
  const { showToast } = useNotifications();

  // Listing state
  const [grants, setGrants] = useState<GrantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });

  // Modal states
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Active item in action
  const [activeGrant, setActiveGrant] = useState<GrantItem | null>(null);

  // Grant Modal form state
  const [userQuery, setUserQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [grantPlan, setGrantPlan] = useState('GOLD');
  const [grantDurationDays, setGrantDurationDays] = useState(30);
  const [grantIsUnlimited, setGrantIsUnlimited] = useState(false);
  const [grantReason, setGrantReason] = useState('');
  const [grantSubmitting, setGrantSubmitting] = useState(false);

  // Extend Modal form state
  const [extendDays, setExtendDays] = useState(30);
  const [extendReason, setExtendReason] = useState('');
  const [extendSubmitting, setExtendSubmitting] = useState(false);

  // Revoke Modal form state
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeSubmitting, setRevokeSubmitting] = useState(false);

  // History Modal state
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState<{ user: any; currentEntitlement: any; logs: any[] } | null>(null);

  // Fetch Grants List
  const fetchGrants = async () => {
    setLoading(true);
    try {
      const res = await adminService.getMemberships({
        search: search.trim() || undefined,
        plan: planFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15,
      });

      if (res.success) {
        setGrants(res.data.grants || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1, limit: 15 });
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load membership grants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, [search, planFilter, statusFilter, page]);

  // Search users for grant modal
  useEffect(() => {
    if (!showGrantModal || !userQuery.trim() || userQuery.trim().length < 2) {
      setSearchedUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await adminService.getUsers({ search: userQuery.trim(), limit: 5 });
        if (res.success) {
          setSearchedUsers(res.data.users || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearchingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userQuery, showGrantModal]);

  // Handlers
  const handleOpenGrant = () => {
    setSelectedUser(null);
    setUserQuery('');
    setSearchedUsers([]);
    setGrantPlan('GOLD');
    setGrantDurationDays(30);
    setGrantIsUnlimited(false);
    setGrantReason('');
    setShowGrantModal(true);
  };

  const handleGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      showToast('Please select a recipient user.', 'error');
      return;
    }
    if (!grantReason.trim()) {
      showToast('A mandatory reason is required to grant membership access.', 'error');
      return;
    }
    if (!grantIsUnlimited && (!grantDurationDays || grantDurationDays <= 0)) {
      showToast('Duration must be a positive number of days.', 'error');
      return;
    }

    setGrantSubmitting(true);
    try {
      const res = await adminService.grantMembership({
        userId: selectedUser.id,
        planCode: grantPlan,
        duration: grantIsUnlimited ? 'unlimited' : grantDurationDays,
        isUnlimited: grantIsUnlimited,
        reason: grantReason.trim(),
      });

      if (res.success) {
        showToast('Membership access successfully granted!', 'success');
        setShowGrantModal(false);
        fetchGrants();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to grant membership', 'error');
    } finally {
      setGrantSubmitting(false);
    }
  };

  const handleOpenExtend = (grant: GrantItem) => {
    setActiveGrant(grant);
    setExtendDays(30);
    setExtendReason('');
    setShowExtendModal(true);
  };

  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGrant) return;
    if (!extendReason.trim()) {
      showToast('A mandatory reason is required to extend duration.', 'error');
      return;
    }
    if (!extendDays || extendDays <= 0) {
      showToast('Please enter a positive number of additional days.', 'error');
      return;
    }

    setExtendSubmitting(true);
    try {
      const res = await adminService.extendMembership(activeGrant.id, {
        additionalDays: extendDays,
        reason: extendReason.trim(),
      });

      if (res.success) {
        showToast('Membership access extended successfully!', 'success');
        setShowExtendModal(false);
        fetchGrants();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to extend membership', 'error');
    } finally {
      setExtendSubmitting(false);
    }
  };

  const handleOpenRevoke = (grant: GrantItem) => {
    setActiveGrant(grant);
    setRevokeReason('');
    setShowRevokeModal(true);
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGrant) return;
    if (!revokeReason.trim()) {
      showToast('A mandatory reason is required to revoke access.', 'error');
      return;
    }

    setRevokeSubmitting(true);
    try {
      const res = await adminService.revokeMembership(activeGrant.id, {
        revocationReason: revokeReason.trim(),
      });

      if (res.success) {
        showToast('Membership access revoked. User reverted to fallback entitlement.', 'success');
        setShowRevokeModal(false);
        fetchGrants();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke access', 'error');
    } finally {
      setRevokeSubmitting(false);
    }
  };

  const handleOpenHistory = async (grant: GrantItem) => {
    setActiveGrant(grant);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await adminService.getUserMembershipHistory(grant.userId);
      if (res.success) {
        setHistoryData(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch audit history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const getPlanBadge = (code: string) => {
    switch (code) {
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'GOLD':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SILVER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EXPIRED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REVOKED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Lifetime / Unlimited';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Membership Management
            </h1>
            <span className="bg-primary-50 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary-200">
              Admin Access Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Grant, extend, and revoke complimentary plan entitlements with immutable audit logging
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGrants}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition"
            title="Refresh grants"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenGrant}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary-900 rounded-xl hover:bg-primary-950 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Grant Membership
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search user name, email, or mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-primary-800"
          />
        </div>

        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-primary-800"
        >
          <option value="">All Plans</option>
          <option value="PLATINUM">Platinum (Unlimited)</option>
          <option value="GOLD">Gold (150 msgs/day)</option>
          <option value="SILVER">Silver (50 msgs/day)</option>
          <option value="FREE">Free Starter (5 msgs/day)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-primary-800"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active Grants</option>
          <option value="EXPIRED">Expired Grants</option>
          <option value="REVOKED">Revoked Grants</option>
        </select>

        {(search || planFilter || statusFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setPlanFilter('');
              setStatusFilter('');
              setPage(1);
            }}
            className="text-xs text-primary-800 hover:underline px-2 py-1 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Granted Plan</th>
                <th className="py-3 px-4">Effective Entitlement</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Reason / Admin</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                    Loading membership grants...
                  </td>
                </tr>
              ) : grants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Award className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No membership access grants found matching your criteria.
                  </td>
                </tr>
              ) : (
                grants.map((grant) => {
                  const isRevoked = grant.displayStatus === 'REVOKED';
                  const isExpired = grant.displayStatus === 'EXPIRED';
                  const isUnlimited = grant.isUnlimited;

                  return (
                    <tr key={grant.id} className="hover:bg-slate-50/70 transition">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0 overflow-hidden border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                            {grant.userPhoto ? (
                              <img src={grant.userPhoto} alt={grant.userName} className="w-full h-full object-cover" />
                            ) : (
                              grant.userName?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{grant.userName}</div>
                            <div className="text-[11px] text-slate-500">{grant.userEmail}</div>
                            <div className="text-[10px] text-slate-400">{grant.userMobile}</div>
                          </div>
                        </div>
                      </td>

                      {/* Granted Plan */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPlanBadge(grant.planCode)}`}>
                          <Award className="w-3 h-3" />
                          {grant.planName}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          Limit: {grant.dailyMessageLimit === -1 ? 'Unlimited' : `${grant.dailyMessageLimit}/day`}
                        </div>
                      </td>

                      {/* Real-time Entitlement */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span>{grant.currentEntitlement.effectivePlan}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            grant.currentEntitlement.accessSource === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                            grant.currentEntitlement.accessSource === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {grant.currentEntitlement.accessSource}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {grant.currentEntitlement.isUnlimited ? 'Unlimited chat' : `${grant.currentEntitlement.dailyLimit} msgs/day`}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(grant.displayStatus)}`}>
                          {grant.displayStatus}
                        </span>
                      </td>

                      {/* Validity */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 text-[11px]">
                          <strong>From:</strong> {formatDate(grant.startDate)}
                        </div>
                        <div className="text-slate-600 text-[11px] mt-0.5">
                          <strong>To:</strong>{' '}
                          {grant.isUnlimited ? (
                            <span className="text-purple-700 font-semibold">Lifetime / Unlimited</span>
                          ) : (
                            formatDate(grant.endDate)
                          )}
                        </div>
                      </td>

                      {/* Reason & Admin */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="text-slate-700 truncate" title={grant.reason}>
                          "{grant.reason}"
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          By: <span className="text-slate-600">{grant.grantedByAdmin}</span>
                        </div>
                        {isRevoked && grant.revocationReason && (
                          <div className="text-[10px] text-rose-600 mt-0.5 truncate" title={grant.revocationReason}>
                            Revoked: "{grant.revocationReason}"
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Extend button */}
                          <button
                            onClick={() => handleOpenExtend(grant)}
                            disabled={isRevoked || isUnlimited}
                            title={isUnlimited ? 'Unlimited grants do not have an expiration date' : isRevoked ? 'Cannot extend revoked grant' : 'Extend Duration'}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {/* Revoke button */}
                          <button
                            onClick={() => handleOpenRevoke(grant)}
                            disabled={isRevoked}
                            title={isRevoked ? 'Already revoked' : 'Revoke Access'}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          {/* History button */}
                          <button
                            onClick={() => handleOpenHistory(grant)}
                            title="View Audit History"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing {grants.length} of {pagination.total} grants
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-slate-700">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. GRANT MEMBERSHIP MODAL */}
      {/* ========================================================================= */}
      {showGrantModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary-100 text-primary-900">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">Grant Membership Access</h3>
                  <p className="text-xs text-slate-500">Directly assign elevated privileges without payment</p>
                </div>
              </div>
              <button
                onClick={() => setShowGrantModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantSubmit} className="mt-4 space-y-4 text-xs">
              {/* Step 1: User Search & Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Select Target User <span className="text-red-500">*</span>
                </label>
                {selectedUser ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{selectedUser.fullName || selectedUser.email}</div>
                      <div className="text-slate-500">{selectedUser.email} &bull; {selectedUser.mobile}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setUserQuery('');
                      }}
                      className="text-primary-800 text-xs font-semibold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Type name, email, or mobile..."
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 focus:outline-none focus:border-primary-800"
                    />
                    {searchingUsers && (
                      <div className="p-2 text-slate-400 text-center">Searching accounts...</div>
                    )}
                    {searchedUsers.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {searchedUsers.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => {
                              setSelectedUser(u);
                              setSearchedUsers([]);
                            }}
                            className="p-2.5 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{u.fullName}</div>
                              <div className="text-slate-500 text-[11px]">{u.email} &bull; {u.mobile}</div>
                            </div>
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                              {u.plan || 'Free'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Plan Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Choose Membership Plan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { code: 'PLATINUM', name: 'Platinum', limit: 'Unlimited Messages', desc: 'Direct chat + VIP badge' },
                    { code: 'GOLD', name: 'Gold', limit: '150 msgs/day', desc: 'Direct chat' },
                    { code: 'SILVER', name: 'Silver', limit: '50 msgs/day', desc: 'Direct chat' },
                    { code: 'FREE', name: 'Free Starter', limit: '5 msgs/day', desc: 'Connected chats only' },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.code}
                      onClick={() => setGrantPlan(p.code)}
                      className={`p-3 rounded-xl border text-left transition ${
                        grantPlan === p.code
                          ? 'border-primary-800 bg-primary-50/60 ring-2 ring-primary-800/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                      <div className="text-[11px] text-primary-900 font-semibold">{p.limit}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Duration */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">3. Grant Duration</label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-purple-700">
                    <input
                      type="checkbox"
                      checked={grantIsUnlimited}
                      onChange={(e) => setGrantIsUnlimited(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Unlimited / Lifetime Access</span>
                  </label>
                </div>

                {!grantIsUnlimited ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {[7, 15, 30, 90, 180, 365].map((d) => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => setGrantDurationDays(d)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                            grantDurationDays === d
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {d} Days
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">Custom days:</span>
                      <input
                        type="number"
                        min="1"
                        max="3650"
                        value={grantDurationDays}
                        onChange={(e) => setGrantDurationDays(parseInt(e.target.value, 10) || 1)}
                        className="w-24 h-8 px-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-[11px] flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>This grant will remain active indefinitely until manually revoked.</span>
                  </div>
                )}
              </div>

              {/* Step 4: Mandatory Reason */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  4. Administrative Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="State the justification for this complimentary grant (mandatory for audit)..."
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-primary-800 text-xs"
                />
              </div>

              {/* Confirmation Notice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Confirmation:</strong> This action is recorded in the permanent audit trail. Any separately paid subscription will remain intact.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantSubmitting || !selectedUser || !grantReason.trim()}
                  className="px-4 py-2 rounded-xl bg-primary-900 text-white font-semibold hover:bg-primary-950 disabled:opacity-50 transition"
                >
                  {grantSubmitting ? 'Granting Access...' : 'Confirm & Grant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EXTEND MEMBERSHIP MODAL */}
      {/* ========================================================================= */}
      {showExtendModal && activeGrant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-900">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">Extend Access Duration</h3>
                  <p className="text-xs text-slate-500">Add additional validity days to this grant</p>
                </div>
              </div>
              <button
                onClick={() => setShowExtendModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExtendSubmit} className="mt-4 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">{activeGrant.userName}</div>
                <div className="text-slate-500 text-[11px]">{activeGrant.userEmail}</div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span>Plan: <strong>{activeGrant.planName}</strong></span>
                  <span>Current Expiry: <strong>{formatDate(activeGrant.endDate)}</strong></span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Additional Days <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[7, 15, 30, 60, 90].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setExtendDays(d)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        extendDays === d
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      +{d} Days
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={extendDays}
                  onChange={(e) => setExtendDays(parseInt(e.target.value, 10) || 1)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-primary-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mandatory Extension Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain why this extension is being provided..."
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-primary-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={extendSubmitting || !extendReason.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 disabled:opacity-50 transition"
                >
                  {extendSubmitting ? 'Extending...' : 'Confirm Extension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REVOKE MEMBERSHIP MODAL */}
      {/* ========================================================================= */}
      {showRevokeModal && activeGrant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">Revoke Membership Access</h3>
                  <p className="text-xs text-rose-600 font-medium">Immediately terminate manually granted privileges</p>
                </div>
              </div>
              <button
                onClick={() => setShowRevokeModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRevokeSubmit} className="mt-4 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                <div className="font-bold text-slate-900">{activeGrant.userName}</div>
                <div className="text-slate-600 text-[11px]">{activeGrant.userEmail}</div>
                <div className="mt-1 text-[11px] text-slate-700">
                  Plan to revoke: <strong className="text-rose-700">{activeGrant.planName}</strong>
                </div>
              </div>

              {/* Impact explanation */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-slate-500" />
                  Impact of Revocation:
                </div>
                <p>
                  &bull; This grant will immediately change to <strong>REVOKED</strong> status.
                </p>
                <p>
                  &bull; The user will instantly fall back to an active paid subscription (if valid), or otherwise to the <strong>Free Starter</strong> plan (5 messages/day).
                </p>
                <p>
                  &bull; Any paid subscription will <strong>NOT</strong> be deleted or altered.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mandatory Revocation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the reason for early revocation (e.g., terms violation, granted by mistake, test concluded)..."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRevokeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={revokeSubmitting || !revokeReason.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-50 transition"
                >
                  {revokeSubmitting ? 'Revoking...' : 'Confirm Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. AUDIT HISTORY MODAL (READ-ONLY) */}
      {/* ========================================================================= */}
      {showHistoryModal && activeGrant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">Membership Audit History</h3>
                  <p className="text-xs text-slate-500">Read-only immutable log of all membership changes</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Overview */}
            <div className="py-3 px-4 my-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs shrink-0">
              <div>
                <span className="text-slate-500">Target User:</span>{' '}
                <strong className="text-slate-900">{activeGrant.userName}</strong> ({activeGrant.userEmail})
              </div>
              {historyData && (
                <div>
                  <span className="text-slate-500">Effective:</span>{' '}
                  <strong className="text-primary-900">{historyData.currentEntitlement?.effectivePlan}</strong>{' '}
                  <span className="text-[10px] text-slate-500 font-mono">({historyData.currentEntitlement?.accessSource})</span>
                </div>
              )}
            </div>

            {/* Audit Logs List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {historyLoading ? (
                <div className="text-center py-12 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                  Loading audit logs...
                </div>
              ) : !historyData || historyData.logs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  No membership audit records found for this user.
                </div>
              ) : (
                historyData.logs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            log.action === 'ADMIN_GRANT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.action === 'ADMIN_EXTEND'
                              ? 'bg-blue-100 text-blue-800'
                              : log.action === 'ADMIN_REVOKE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {log.fromPlan ? `${log.fromPlan} → ${log.toPlan}` : log.planCode}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="text-slate-700 text-xs">
                      <strong>Reason:</strong> "{log.reason || 'N/A'}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <div>
                        Performed by: <strong>{log.performedBy?.fullName || log.performedBy?.email || 'System'}</strong>
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">
                        Source: {log.source}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 mt-2 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

