import React, { useState, useEffect } from 'react';
import { Lock, Shield, Ban, Check, UserX } from 'lucide-react';
import { authService } from '../../services/authService';
import { publicService } from '../../services/publicService';
import { useNotifications } from '../../context/NotificationContext';

export default function SettingsPage() {
  const { showToast } = useNotifications();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(true);

  const fetchBlocked = async () => {
    try {
      const res = await publicService.getBlockedUsers();
      if (res.success) setBlockedUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBlocked(false);
    }
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await authService.updatePassword({ currentPassword, newPassword });
      if (res.success) {
        showToast('Password updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUnblock = async (blockedUserId) => {
    try {
      const res = await publicService.unblockUser(blockedUserId);
      if (res.success) {
        showToast('User unblocked', 'info');
        fetchBlocked();
      }
    } catch (err) {
      showToast(err.message || 'Failed to unblock', 'error');
    }
  };

  return (
    <div className="space-y-10 max-w-4xl pb-12">
      
      <div className="border-b border-gold-200/80 pb-4">
        <h1 className="font-serif text-2xl font-bold text-charcoal-900">
          Account & Privacy Settings
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage your credentials, privacy protections, and safety controls
        </p>
      </div>

      {/* CHANGE PASSWORD CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-gold-100 pb-3">
          <Lock className="w-5 h-5 text-primary-800" />
          <h3 className="font-serif font-bold text-base text-charcoal-900">Change Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 py-2.5 rounded-xl bg-primary-850 hover:bg-primary-950 text-white font-bold text-xs uppercase tracking-wider transition"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* BLOCKED MEMBERS MANAGEMENT */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-gold-100 pb-3">
          <Ban className="w-5 h-5 text-red-600" />
          <h3 className="font-serif font-bold text-base text-charcoal-900">Blocked Members</h3>
        </div>

        {loadingBlocked ? (
          <div className="text-center py-6 text-xs text-gray-400">Loading blocked list...</div>
        ) : blockedUsers.length === 0 ? (
          <p className="text-xs text-gray-500">You have not blocked any members.</p>
        ) : (
          <div className="divide-y divide-gold-50">
            {blockedUsers.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                    {b.photo ? <img src={b.photo} alt="" className="w-full h-full object-cover" /> : null}
                  </div>
                  <span className="font-bold text-xs text-charcoal-900">{b.name}</span>
                </div>
                <button
                  onClick={() => handleUnblock(b.blockedUserId)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-charcoal-800 transition"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

