import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Key, ArrowRight, Heart } from 'lucide-react';
import { authService } from '../../services/authService';
import { useNotifications } from '../../context/NotificationContext';

export default function ForgotPasswordPage() {
  const { showToast } = useNotifications();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ email });
      if (res.success) {
        setMessage(res.message);
        if (res.data?.resetToken) {
          setResetToken(res.data.resetToken);
          setStep(2);
        }
      }
    } catch (err) {
      setMessage(err.message || 'Error sending request');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.resetPassword({ token: resetToken, newPassword });
      if (res.success) {
        showToast('Password reset successfully! Please sign in.', 'success');
        setStep(3);
      }
    } catch (err) {
      setMessage(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-ivory-100 to-gold-50/40">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gold-200 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary-800 border border-gold-400 mx-auto flex items-center justify-center shadow-rose-glow">
            <Key className="w-6 h-6 text-gold-300" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">
            Password Recovery
          </h2>
          <p className="text-xs text-gray-500">
            {step === 1 ? 'Enter your registered email address to receive reset instructions' : 'Set your new password'}
          </p>
        </div>

        {message && (
          <div className="p-3 bg-gold-50 border border-gold-200 text-charcoal-800 text-xs rounded-xl font-medium">
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya.sharma@example.com"
                  className="w-full h-11 pl-10 pr-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary-850 hover:bg-primary-950 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              {loading ? 'Processing...' : 'Send Reset Instructions'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                New Password (min 6 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary-850 hover:bg-primary-950 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <p className="text-xs text-green-700 font-semibold">Your password has been reset successfully.</p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 rounded-xl bg-primary-800 text-white text-xs font-bold"
            >
              Back to Sign In
            </Link>
          </div>
        )}

        <div className="pt-2 text-center text-xs">
          <Link to="/login" className="text-primary-800 font-semibold hover:underline">
            Remember your password? Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}

