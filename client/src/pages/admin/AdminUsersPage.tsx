import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, Check, UserCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNotifications } from '../../context/NotificationContext';

export default function AdminUsersPage() {
  const { showToast } = useNotifications();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        search,
        status: statusFilter,
        role: roleFilter,
        page,
        limit: 15,
      });

      if (res.success) {
        setUsers(res.data.users || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, roleFilter, page]);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const res = await adminService.updateUserStatus(userId, { status: newStatus });
      if (res.success) {
        showToast(`User status set to ${newStatus}`, 'success');
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await adminService.updateUserStatus(userId, { role: newRole });
      if (res.success) {
        showToast(`User role changed to ${newRole}`, 'success');
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message || 'Role update failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            User Accounts Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, moderate, and adjust access permissions for registered accounts
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search email, mobile, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-slate-800"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white"
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Member</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Role</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">No matching users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      {u.photo ? <img src={u.photo} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <div>
                      <strong className="text-slate-900 block">{u.fullName}</strong>
                      <span className="text-[10px] text-slate-500">For {u.profileCreatedFor}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="block text-slate-800">{u.email}</span>
                    <span className="text-slate-500 text-[11px]">{u.mobile}</span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleRole(u.id, u.role)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-900' : 'bg-slate-100 text-slate-700'
                      }`}
                      title="Click to toggle role"
                    >
                      {u.role}
                    </button>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{u.plan}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.status === 'SUSPENDED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {u.status === 'SUSPENDED' ? (
                      <button
                        onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Reactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(u.id, 'SUSPENDED')}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

