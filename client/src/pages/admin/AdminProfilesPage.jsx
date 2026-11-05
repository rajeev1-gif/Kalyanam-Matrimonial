import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Eye, EyeOff, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNotifications } from '../../context/NotificationContext';

export default function AdminProfilesPage() {
  const { showToast } = useNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    try {
      const res = await adminService.getUsers({ limit: 50 });
      if (res.success) setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleToggleVerification = async (profileId, currentVal) => {
    try {
      const res = await adminService.toggleVerification(profileId, { isVerified: !currentVal });
      if (res.success) {
        showToast('Verification status updated', 'success');
        fetchProfiles();
      }
    } catch (err) {
      showToast(err.message || 'Error updating verification', 'error');
    }
  };

  const handleToggleVisibility = async (profileId, currentVal) => {
    try {
      const res = await adminService.toggleVerification(profileId, { isVisible: !currentVal });
      if (res.success) {
        showToast('Visibility status updated', 'info');
        fetchProfiles();
      }
    } catch (err) {
      showToast(err.message || 'Error updating visibility', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Profile Moderation & Verification
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Authenticate photographs, award Verified badges, and manage public discovery visibility
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Profile</th>
              <th className="p-4">Location</th>
              <th className="p-4">Verification</th>
              <th className="p-4">Discovery Visibility</th>
              <th className="p-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">Loading profiles...</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      {u.photo ? <img src={u.photo} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-serif text-sm">{u.fullName}</strong>
                      <span className="text-[11px] text-slate-500">{u.gender} • {u.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-700">{u.city || 'India'}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        u.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {u.isVerified ? <CheckCircle2 className="w-3 h-3" /> : null}
                      {u.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        u.isVisible ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {u.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {u.isVisible ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleVerification(u.id, u.isVerified)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        u.isVerified
                          ? 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {u.isVerified ? 'Revoke Verification' : 'Verify Profile'}
                    </button>
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

