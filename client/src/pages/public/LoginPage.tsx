import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LoginRequest } from '../../types';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const identifierInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Synchronize browser autofill values on mount and after short intervals
  useEffect(() => {
    const syncAutofill = () => {
      if (identifierInputRef.current?.value && !identifier) {
        setIdentifier(identifierInputRef.current.value);
      }
      if (passwordInputRef.current?.value && !password) {
        setPassword(passwordInputRef.current.value);
      }
    };

    syncAutofill();
    const t1 = setTimeout(syncAutofill, 100);
    const t2 = setTimeout(syncAutofill, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleAutofillDetection = () => {
    if (identifierInputRef.current?.value) {
      setIdentifier(identifierInputRef.current.value);
    }
    if (passwordInputRef.current?.value) {
      setPassword(passwordInputRef.current.value);
    }
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Capture live current values from DOM refs, form elements, or React state
    const form = e.currentTarget;
    const domIdentifier = (
      identifierInputRef.current?.value ||
      (form.elements.namedItem('identifier') as HTMLInputElement)?.value ||
      (form.elements.namedItem('username') as HTMLInputElement)?.value ||
      identifier ||
      ''
    ).trim();

    const domPassword = (
      passwordInputRef.current?.value ||
      (form.elements.namedItem('password') as HTMLInputElement)?.value ||
      password ||
      ''
    );

    // Sync state if DOM had autofilled values not yet stored in state
    if (domIdentifier !== identifier) setIdentifier(domIdentifier);
    if (domPassword !== password) setPassword(domPassword);

    // 2. Validate both fields are present
    if (!domIdentifier || !domPassword) {
      setError('Email/Mobile and Password are required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const isEmail = domIdentifier.includes('@');
      const payload: LoginRequest = {
        identifier: domIdentifier,
        email: isEmail ? domIdentifier : undefined,
        mobile: !isEmail ? domIdentifier : undefined,
        password: domPassword,
      };

      const res = await login(payload);
      if (res.success) {
        showToast('Welcome back to Kalyanam!', 'success');
        if (res.data?.user?.role === 'ADMIN') {
          navigate('/admin');
        } else {
          const redirectPath = from && from !== '/login' ? from : '/dashboard';
          navigate(redirectPath, { replace: true });
        }
      } else {
        setError(res.message || 'Invalid email/mobile or password');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email/mobile or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'groom' | 'bride') => {
    if (error) setError('');
    let nextIdentifier = '';
    const nextPassword = 'Password@123';

    if (role === 'admin') {
      nextIdentifier = 'admin@matrimonial.com';
    } else if (role === 'groom') {
      nextIdentifier = 'aditya.verma@example.com';
    } else if (role === 'bride') {
      nextIdentifier = 'ananya.sharma@example.com';
    }

    setIdentifier(nextIdentifier);
    setPassword(nextPassword);

    if (identifierInputRef.current) identifierInputRef.current.value = nextIdentifier;
    if (passwordInputRef.current) passwordInputRef.current.value = nextPassword;
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
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium animate-fadeIn">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
          <div className="space-y-1.5">
            <label htmlFor="identifier" className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
              Email or Mobile Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                ref={identifierInputRef}
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={handleIdentifierChange}
                onInput={handleAutofillDetection}
                onAnimationStart={handleAutofillDetection}
                placeholder="e.g. ananya.sharma@example.com or 9811122201"
                className="w-full h-11 pl-10 pr-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-primary-800 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                ref={passwordInputRef}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                onInput={handleAutofillDetection}
                onAnimationStart={handleAutofillDetection}
                placeholder="••••••••••••"
                className="w-full h-11 pl-10 pr-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-800 to-primary-950 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-rose-glow hover:shadow-lg transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
