import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, CheckCircle2, MapPin, Briefcase, GraduationCap, Sparkles, Send, Check } from 'lucide-react';
import { interestService } from '../../services/interestService';
import { shortlistService } from '../../services/shortlistService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function ProfileCard({ profile, onInterestSent, onShortlistToggled }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [connectionStatus, setConnectionStatus] = useState(profile.connectionStatus || 'NONE');
  const [isShortlisted, setIsShortlisted] = useState(profile.isShortlisted || false);
  const [loadingInterest, setLoadingInterest] = useState(false);
  const [loadingShortlist, setLoadingShortlist] = useState(false);

  // Calculate age
  const calculateAge = (dob) => {
    if (!dob) return 26;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  // Format height from cm to feet/inches
  const formatHeight = (cm) => {
    if (!cm) return '5\'6"';
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}" (${cm} cm)`;
  };

  const photoUrl = profile.photos?.find((p) => p.isProfilePicture)?.url ||
    profile.photos?.[0]?.url ||
    (profile.gender === 'MALE'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
      : 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=800');

  const handleSendInterest = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login?redirect=search');
      return;
    }

    if (connectionStatus !== 'NONE') return;

    setLoadingInterest(true);
    try {
      const res = await interestService.sendInterest({ receiverId: profile.userId });
      if (res.success) {
        setConnectionStatus('PENDING_SENT');
        showToast('Interest request sent successfully!', 'success');
        if (onInterestSent) onInterestSent(profile.userId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to send interest', 'error');
    } finally {
      setLoadingInterest(false);
    }
  };

  const handleToggleShortlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login?redirect=search');
      return;
    }

    setLoadingShortlist(true);
    try {
      const res = await shortlistService.toggleShortlist(profile.userId);
      if (res.success) {
        setIsShortlisted(res.data.isShortlisted);
        showToast(res.message, 'info');
        if (onShortlistToggled) onShortlistToggled(profile.userId, res.data.isShortlisted);
      }
    } catch (err) {
      showToast(err.message || 'Shortlist action failed', 'error');
    } finally {
      setLoadingShortlist(false);
    }
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gold-200/70 hover:border-gold-400 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
      
      {/* Photo with Overlay Badges */}
      <div className="relative aspect-[4/4.5] overflow-hidden bg-ivory-200">
        <img
          src={photoUrl}
          alt={profile.fullName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-black/20"></div>

        {/* Shortlist Heart Button */}
        <button
          onClick={handleToggleShortlist}
          disabled={loadingShortlist}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
            isShortlisted
              ? 'bg-rose-600 text-white shadow-rose-glow scale-110'
              : 'bg-white/80 hover:bg-white text-gray-700 hover:text-rose-600 shadow-sm'
          }`}
          title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
        >
          <Heart className={`w-5 h-5 ${isShortlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Verified Badge */}
        {profile.isVerified && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-gold-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary-700" />
            <span className="text-[11px] font-bold text-primary-900 tracking-wide">VERIFIED</span>
          </div>
        )}

        {/* Quick Info in Overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="font-serif text-xl font-bold tracking-tight drop-shadow-md flex items-center gap-2">
            {profile.fullName}
            <span className="text-sm font-sans font-normal opacity-90">
              ({calculateAge(profile.dateOfBirth)} yrs)
            </span>
          </h3>
          <p className="text-xs text-gold-200 font-medium flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-gold-300" />
            {profile.location?.city || 'India'}, {profile.location?.state || ''}
          </p>
        </div>
      </div>

      {/* Profile Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2.5 text-xs text-charcoal-800">
          
          {/* Religion & Community */}
          <div className="flex items-center gap-2 pb-2 border-b border-gold-100">
            <Sparkles className="w-4 h-4 text-gold-600 shrink-0" />
            <span className="font-semibold text-charcoal-900">
              {profile.religionCommunity?.religion || 'Hindu'}
              {profile.religionCommunity?.community ? ` • ${profile.religionCommunity.community}` : ''}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{profile.religionCommunity?.motherTongue || 'Hindi'}</span>
          </div>

          {/* Education & Occupation */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-gray-700">
              <GraduationCap className="w-4 h-4 text-primary-700 shrink-0" />
              <span className="truncate">{profile.educationCareer?.highestEducation || 'Graduate'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Briefcase className="w-4 h-4 text-primary-700 shrink-0" />
              <span className="truncate font-medium text-charcoal-900">
                {profile.educationCareer?.occupationTitle || 'Professional'}
                {profile.educationCareer?.companyName ? ` at ${profile.educationCareer.companyName}` : ''}
              </span>
            </div>
          </div>

          {/* Height and Marital Status */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
            <span>Height: <strong className="text-charcoal-800">{formatHeight(profile.height)}</strong></span>
            <span>Marital Status: <strong className="text-charcoal-800">{profile.maritalStatus?.replace('_', ' ') || 'Never Married'}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2 border-t border-gold-100">
          
          <Link
            to={`/profile/${profile.userId}`}
            className="flex-1 text-center py-2.5 px-3 rounded-xl border border-gold-400 hover:border-primary-700 text-primary-900 font-semibold text-xs hover:bg-gold-50 transition"
          >
            View Profile
          </Link>

          {connectionStatus === 'ACCEPTED' ? (
            <button
              onClick={() => navigate('/dashboard/messages')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-green-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Connected
            </button>
          ) : connectionStatus === 'PENDING_SENT' ? (
            <button
              disabled
              className="flex-1 py-2.5 px-3 rounded-xl bg-gold-100 text-gold-800 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" />
              Interest Sent
            </button>
          ) : connectionStatus === 'PENDING_RECEIVED' ? (
            <Link
              to="/dashboard/received-interests"
              className="flex-1 text-center py-2.5 px-3 rounded-xl bg-primary-700 text-white font-semibold text-xs hover:bg-primary-800 transition"
            >
              Respond
            </Link>
          ) : (
            <button
              onClick={handleSendInterest}
              disabled={loadingInterest}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary-700 to-primary-900 hover:from-primary-800 hover:to-primary-950 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-rose-glow hover:shadow-lg transition"
            >
              <Send className="w-3.5 h-3.5" />
              {loadingInterest ? 'Sending...' : 'Send Interest'}
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

