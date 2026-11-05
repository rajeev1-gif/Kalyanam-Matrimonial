import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login({ identifier, password });
      if (res.success) {
        showToast('Welcome back to Kalyanam!', 'success');
        if (res.data?.user?.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid email/mobile or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setIdentifier('admin@matrimonial.com');
      setPassword('Password@123');
    } else if (role === 'groom') {
      setIdentifier('aditya.verma@example.com');
      setPassword('Password@123');
    } else if (role === 'bride') {
      setIdentifier('ananya.sharma@example.com');
      setPassword('Password@123');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-ivory-100 to-gold-50/40">
      
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gold-200/90 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary-800 border border-gold-400 mx-auto flex items-center justify-center shadow-rose-glow">
            <Heart className="w-6 h-6 text-gold-300 fill-gold-400" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Welcome to Kalyanam
          </h2>
          <p className="text-xs text-gray-500">
            Sign in to explore verified matrimonial alliances
          </p>
        </div>

        {/* Demo Accounts Quick Pill Selector */}
        <div className="bg-gold-50/80 p-3 rounded-2xl border border-gold-300/70 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-primary-950 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Instant Demo Login (1-Click)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="py-1.5 px-2 bg-white rounded-lg border border-gold-300 hover:border-primary-700 font-semibold text-[11px] text-primary-900 transition"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('groom')}
              className="py-1.5 px-2 bg-white rounded-lg border border-gold-300 hover:border-primary-700 font-semibold text-[11px] text-primary-900 transition"
            >
              Aditya (Groom)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('bride')}
              className="py-1.5 px-2 bg-white rounded-lg border border-gold-300 hover:border-primary-700 font-semibold text-[11px] text-primary-900 transition"
            >
              Ananya (Bride)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
              Email or Mobile Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. ananya.sharma@example.com"
                className="w-full h-11 pl-10 pr-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-primary-800 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 pl-10 pr-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-800 to-primary-950 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-rose-glow hover:shadow-lg transition"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In Securely</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-gold-100 text-center text-xs text-gray-600">
          New to Kalyanam?{' '}
          <Link to="/register" className="font-bold text-primary-850 hover:underline">
            Register Free Profile
          </Link>
        </div>

      </div>

    </div>
  );
}

