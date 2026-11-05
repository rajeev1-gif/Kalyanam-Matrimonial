import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, Mail, Phone, Lock, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { RegisterRequest } from '../../types';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterRequest>({
    profileCreatedFor: 'MYSELF',
    fullName: '',
    gender: 'FEMALE',
    dateOfBirth: '1998-05-15',
    email: '',
    mobile: '',
    password: '',
    religion: 'HINDU',
    motherTongue: 'Hindi',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(formData);
      if (res.success) {
        showToast('Registration successful! Welcome to Kalyanam.', 'success');
        navigate('/dashboard/edit-profile');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-ivory-100 to-gold-50/40">
      
      <div className="max-w-2xl w-full bg-white rounded-3xl p-8 sm:p-12 border border-gold-200 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary-800 border border-gold-400 mx-auto flex items-center justify-center shadow-rose-glow">
            <Heart className="w-6 h-6 text-gold-300 fill-gold-400" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-gold-600 block">
            100% Free Registration
          </span>
          <h2 className="font-serif text-3xl font-bold text-charcoal-900">
            Create Your Matrimonial Profile
          </h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Take the first sacred step toward finding your lifelong match among thousands of verified families.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Created For */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
              This Profile Is For
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['MYSELF', 'SON', 'DAUGHTER', 'BROTHER', 'SISTER', 'RELATIVE', 'FRIEND'].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    let inferredGender = formData.gender;
                    if (item === 'SON' || item === 'BROTHER') inferredGender = 'MALE';
                    if (item === 'DAUGHTER' || item === 'SISTER') inferredGender = 'FEMALE';
                    setFormData({ ...formData, profileCreatedFor: item, gender: inferredGender });
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    formData.profileCreatedFor === item
                      ? 'bg-primary-900 text-white border-primary-950 shadow-sm'
                      : 'bg-ivory-50 border-gold-200 text-charcoal-800 hover:bg-gold-50'
                  }`}
                >
                  {item.charAt(0) + item.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full h-11 pl-10 pr-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full h-11 px-3 text-xs font-semibold rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary-700"
              >
                <option value="FEMALE">Female (Bride)</option>
                <option value="MALE">Male (Groom)</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  required
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 pr-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>
            </div>

            {/* Mother Tongue */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Mother Tongue
              </label>
              <select
                name="motherTongue"
                value={formData.motherTongue}
                onChange={handleChange}
                className="w-full h-11 px-3 text-xs font-semibold rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary-700"
              >
                <option value="Hindi">Hindi</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Marathi">Marathi</option>
                <option value="Bengali">Bengali</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Kannada">Kannada</option>
                <option value="Urdu">Urdu</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* Religion */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Religion
              </label>
              <select
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                className="w-full h-11 px-3 text-xs font-semibold rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary-700"
              >
                <option value="HINDU">Hindu</option>
                <option value="SIKH">Sikh</option>
                <option value="JAIN">Jain</option>
                <option value="MUSLIM">Muslim</option>
                <option value="CHRISTIAN">Christian</option>
                <option value="BUDDHIST">Buddhist</option>
                <option value="PARSI">Parsi</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="radhika.sharma@example.com"
                  className="w-full h-11 pl-10 pr-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Set Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-800 via-primary-900 to-charcoal-950 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-rose-glow hover:shadow-xl transition"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-gold-300" />
                <span>Create Profile & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        <div className="pt-4 border-t border-gold-100 text-center text-xs text-gray-600">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-primary-850 hover:underline">
            Sign In to Your Account
          </Link>
        </div>

      </div>

    </div>
  );
}
