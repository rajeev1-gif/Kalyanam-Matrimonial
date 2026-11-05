import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Send,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  Smile,
  ShieldAlert,
  Ban,
  ChevronLeft,
  Sparkles,
  Check,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { profileService } from '../../services/profileService';
import { interestService } from '../../services/interestService';
import { shortlistService } from '../../services/shortlistService';
import { publicService } from '../../services/publicService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function ProfileDetailPage() {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Interaction states
  const [connectionStatus, setConnectionStatus] = useState('NONE');
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [loadingInterest, setLoadingInterest] = useState(false);

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate content');
  const [reportDescription, setReportDescription] = useState('');
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await profileService.getPublicProfile(userId);
        if (res.success && res.data) {
          setData(res.data);
          setConnectionStatus(res.data.connectionStatus || 'NONE');
          setIsShortlisted(res.data.isShortlisted || false);
        }
      } catch (err) {
        showToast(err.message || 'Error loading profile', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId, showToast]);

  const handleSendInterest = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=profile/' + userId);
      return;
    }

    setLoadingInterest(true);
    try {
      const res = await interestService.sendInterest({ receiverId: userId });
      if (res.success) {
        setConnectionStatus('PENDING_SENT');
        showToast('Interest request delivered successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to send interest', 'error');
    } finally {
      setLoadingInterest(false);
    }
  };

  const handleToggleShortlist = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=profile/' + userId);
      return;
    }

    try {
      const res = await shortlistService.toggleShortlist(userId);
      if (res.success) {
        setIsShortlisted(res.data.isShortlisted);
        showToast(res.message, 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update shortlist', 'error');
    }
  };

  const handleReportUser = async (e) => {
    e.preventDefault();
    try {
      const res = await publicService.reportUser({
        reportedUserId: userId,
        reason: reportReason,
        description: reportDescription,
      });
      if (res.success) {
        showToast('Report submitted. Thank you for keeping our community safe.', 'success');
        setReportModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit report', 'error');
    }
  };

  const handleBlockUser = async () => {
    try {
      const res = await publicService.blockUser({ blockedUserId: userId });
      if (res.success) {
        showToast('User has been blocked', 'info');
        setBlockModalOpen(false);
        navigate('/search');
      }
    } catch (err) {
      showToast(err.message || 'Failed to block user', 'error');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-sm text-gray-500">
        Loading profile details...
      </div>
    );
  }

  if (!data || !data.profile) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal-900">Profile Not Found</h2>
        <p className="text-xs text-gray-500">The requested profile might be private or inactive.</p>
        <Link to="/search" className="px-5 py-2.5 bg-primary-800 text-white rounded-xl text-xs font-bold inline-block">
          Return to Search
        </Link>
      </div>
    );
  }

  const { profile, user: targetUser } = data;
  const photos = profile.photos || [];
  const activePhoto = photos[selectedPhotoIndex]?.url ||
    (profile.gender === 'MALE'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
      : 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=800');

  const calculateAge = (dob) => {
    if (!dob) return 26;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const formatHeight = (cm) => {
    if (!cm) return '5\'6"';
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}" (${cm} cm)`;
  };

  const isSelf = currentUser?.id === userId;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-800 hover:text-primary-800 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Profiles
      </button>

      {/* TOP HERO PROFILE HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Photo Gallery Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative aspect-[3/3.8] rounded-2xl overflow-hidden bg-ivory-200 border-2 border-gold-200 shadow-md">
            <img src={activePhoto} alt={profile.fullName} className="w-full h-full object-cover" />
            
            {profile.isVerified && (
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-gold-300 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-700" />
                <span className="text-[10px] font-bold text-primary-950 uppercase tracking-wider">
                  Verified Member
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    selectedPhotoIndex === idx ? 'border-primary-700 scale-105' : 'border-gray-200 opacity-70'
                  }`}
                >
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile Info & Quick Actions Column */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-gold-700 tracking-wider uppercase">
                  Profile Managed by {targetUser?.profileCreatedFor || 'Self'}
                </span>
                <h1 className="font-serif text-3xl font-extrabold text-charcoal-900 mt-0.5">
                  {profile.fullName}
                </h1>
              </div>

              {!isSelf && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleShortlist}
                    className={`p-2.5 rounded-full border transition ${
                      isShortlisted
                        ? 'bg-rose-50 text-rose-600 border-rose-300'
                        : 'border-gray-200 text-gray-600 hover:bg-gold-50'
                    }`}
                    title={isShortlisted ? 'Shortlisted' : 'Shortlist Profile'}
                  >
                    <Heart className={`w-5 h-5 ${isShortlisted ? 'fill-rose-600' : ''}`} />
                  </button>

                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="p-2.5 rounded-full border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Report Profile"
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setBlockModalOpen(true)}
                    className="p-2.5 rounded-full border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Block Profile"
                  >
                    <Ban className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Metrics Tag Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-gold-50/60 p-3 rounded-xl border border-gold-200/50">
                <span className="text-gray-500 block text-[10px] uppercase">Age / Height</span>
                <strong className="text-charcoal-900">{calculateAge(profile.dateOfBirth)} yrs • {formatHeight(profile.height)}</strong>
              </div>
              <div className="bg-gold-50/60 p-3 rounded-xl border border-gold-200/50">
                <span className="text-gray-500 block text-[10px] uppercase">Religion & Caste</span>
                <strong className="text-charcoal-900">{profile.religionCommunity?.religion} • {profile.religionCommunity?.community || 'Not specified'}</strong>
              </div>
              <div className="bg-gold-50/60 p-3 rounded-xl border border-gold-200/50">
                <span className="text-gray-500 block text-[10px] uppercase">Location</span>
                <strong className="text-charcoal-900">{profile.location?.city}, {profile.location?.state}</strong>
              </div>
              <div className="bg-gold-50/60 p-3 rounded-xl border border-gold-200/50">
                <span className="text-gray-500 block text-[10px] uppercase">Education</span>
                <strong className="text-charcoal-900 truncate block">{profile.educationCareer?.highestEducation}</strong>
              </div>
              <div className="bg-gold-50/60 p-3 rounded-xl border border-gold-200/50">
                <span className="text-gray-500 block text-[10px] uppercase">Profession</span>
                <strong className="text-charcoal-900 truncate block">{profile.educationCareer?.occupationTitle}</strong>
              </div>
              <div className="bg-gold-50/60 p-3 rounded-xl border border-gold-200/50">
                <span className="text-gray-500 block text-[10px] uppercase">Annual Income</span>
                <strong className="text-charcoal-900">{profile.educationCareer?.annualIncome}</strong>
              </div>
            </div>

            {/* Profile Summary */}
            {profile.profileSummary && (
              <p className="text-xs text-gray-700 italic bg-ivory-200/50 p-3 rounded-xl border border-gold-200/50">
                "{profile.profileSummary}"
              </p>
            )}

            {/* Protected Contact Information Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-gold-50 border border-gold-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  Contact Information
                </span>
                {targetUser.canViewContact ? (
                  <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Protected
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 text-[11px]">Phone:</span>{' '}
                  <strong className="text-charcoal-900">{targetUser.mobile}</strong>
                </div>
                <div>
                  <span className="text-gray-500 text-[11px]">Email:</span>{' '}
                  <strong className="text-charcoal-900 truncate block">{targetUser.email}</strong>
                </div>
              </div>

              {!targetUser.canViewContact && (
                <p className="text-[11px] text-amber-800 pt-1">
                  Contact details are revealed when an interest request is mutually accepted, or immediately with a Gold membership.
                </p>
              )}
            </div>

          </div>

          {/* Primary Action Button */}
          {!isSelf && (
            <div className="pt-2 flex items-center gap-3">
              {connectionStatus === 'ACCEPTED' ? (
                <button
                  onClick={() => navigate('/dashboard/messages')}
                  className="flex-1 py-3 px-4 rounded-xl bg-green-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Connected • Open Messages
                </button>
              ) : connectionStatus === 'PENDING_SENT' ? (
                <button
                  disabled
                  className="flex-1 py-3 px-4 rounded-xl bg-gold-200 text-gold-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  Interest Already Sent
                </button>
              ) : connectionStatus === 'PENDING_RECEIVED' ? (
                <Link
                  to="/dashboard/received-interests"
                  className="flex-1 text-center py-3 px-4 rounded-xl bg-primary-800 text-white font-bold text-xs uppercase tracking-wider shadow-rose-glow"
                >
                  Accept Interest Request
                </Link>
              ) : (
                <button
                  onClick={handleSendInterest}
                  disabled={loadingInterest}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-800 to-primary-950 hover:from-primary-900 hover:to-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-rose-glow hover:shadow-xl transition"
                >
                  <Send className="w-4 h-4 text-gold-300" />
                  {loadingInterest ? 'Sending...' : 'Send Free Interest Request'}
                </button>
              )}
            </div>
          )}

        </div>

      </div>

      {/* DETAILED PROFILE TABS / SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 1. About Me */}
        <div className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2 border-b border-gold-100 pb-2">
            <Sparkles className="w-4 h-4 text-gold-600" />
            About Myself & Personality
          </h3>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
            {profile.aboutMe || 'No detailed biography provided.'}
          </p>
        </div>

        {/* 2. Religion and Community */}
        <div className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2 border-b border-gold-100 pb-2">
            <Heart className="w-4 h-4 text-primary-800" />
            Religion & Ethnic Background
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-gray-500">Religion:</span> <strong>{profile.religionCommunity?.religion}</strong></div>
            <div><span className="text-gray-500">Community:</span> <strong>{profile.religionCommunity?.community || 'N/A'}</strong></div>
            <div><span className="text-gray-500">Caste / Subcaste:</span> <strong>{profile.religionCommunity?.caste || 'N/A'}</strong></div>
            <div><span className="text-gray-500">Mother Tongue:</span> <strong>{profile.religionCommunity?.motherTongue}</strong></div>
            <div><span className="text-gray-500">Gotra:</span> <strong>{profile.religionCommunity?.gothra || 'N/A'}</strong></div>
            <div><span className="text-gray-500">Manglik:</span> <strong>{profile.religionCommunity?.manglik}</strong></div>
          </div>
        </div>

        {/* 3. Education & Career */}
        <div className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2 border-b border-gold-100 pb-2">
            <Briefcase className="w-4 h-4 text-primary-800" />
            Education & Career Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-gray-500">Highest Degree:</span> <strong>{profile.educationCareer?.highestEducation}</strong></div>
            <div><span className="text-gray-500">Field of Study:</span> <strong>{profile.educationCareer?.educationField || 'N/A'}</strong></div>
            <div><span className="text-gray-500">College:</span> <strong>{profile.educationCareer?.collegeName || 'N/A'}</strong></div>
            <div><span className="text-gray-500">Profession:</span> <strong>{profile.educationCareer?.occupationTitle}</strong></div>
            <div><span className="text-gray-500">Company:</span> <strong>{profile.educationCareer?.companyName || 'N/A'}</strong></div>
            <div><span className="text-gray-500">Income:</span> <strong>{profile.educationCareer?.annualIncome}</strong></div>
          </div>
        </div>

        {/* 4. Family Details */}
        <div className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2 border-b border-gold-100 pb-2">
            <Users className="w-4 h-4 text-primary-800" />
            Family Background
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-gray-500">Family Type:</span> <strong>{profile.familyDetails?.familyType}</strong></div>
            <div><span className="text-gray-500">Family Status:</span> <strong>{profile.familyDetails?.familyStatus}</strong></div>
            <div><span className="text-gray-500">Father's Occupation:</span> <strong>{profile.familyDetails?.fatherOccupation || 'N/A'}</strong></div>
            <div><span className="text-gray-500">Mother's Occupation:</span> <strong>{profile.familyDetails?.motherOccupation || 'N/A'}</strong></div>
            <div><span className="text-gray-500">Brothers:</span> <strong>{profile.familyDetails?.brothersCount || 0}</strong></div>
            <div><span className="text-gray-500">Sisters:</span> <strong>{profile.familyDetails?.sistersCount || 0}</strong></div>
          </div>
          {profile.familyDetails?.aboutFamily && (
            <p className="text-xs text-gray-600 pt-2 border-t border-gold-50">
              {profile.familyDetails.aboutFamily}
            </p>
          )}
        </div>

        {/* 5. Lifestyle */}
        <div className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2 border-b border-gold-100 pb-2">
            <Smile className="w-4 h-4 text-primary-800" />
            Lifestyle & Interests
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div><span className="text-gray-500">Diet:</span> <strong>{profile.lifestyleDetails?.diet}</strong></div>
            <div><span className="text-gray-500">Smoking:</span> <strong>{profile.lifestyleDetails?.smoking}</strong></div>
            <div><span className="text-gray-500">Drinking:</span> <strong>{profile.lifestyleDetails?.drinking}</strong></div>
          </div>
          {profile.lifestyleDetails?.hobbies && (
            <div className="pt-2 text-xs">
              <span className="text-gray-500 block mb-1">Hobbies & Activities:</span>
              <span className="font-medium text-charcoal-800">{profile.lifestyleDetails.hobbies}</span>
            </div>
          )}
        </div>

        {/* 6. Partner Preferences */}
        <div className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2 border-b border-gold-100 pb-2">
            <Heart className="w-4 h-4 text-gold-600" />
            Partner Preferences
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-gray-500">Age:</span> <strong>{profile.partnerPreference?.minAge || 21} - {profile.partnerPreference?.maxAge || 35} Yrs</strong></div>
            <div><span className="text-gray-500">Income:</span> <strong>{profile.partnerPreference?.minIncome || 'Open'}</strong></div>
            <div><span className="text-gray-500">Diet Preference:</span> <strong>{profile.partnerPreference?.diet || 'Any'}</strong></div>
            <div><span className="text-gray-500">Location:</span> <strong>{profile.partnerPreference?.city || profile.partnerPreference?.state || 'Open'}</strong></div>
          </div>
        </div>

      </div>

      {/* REPORT USER MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-serif font-bold text-lg">
              <AlertTriangle className="w-5 h-5" />
              <span>Report Profile</span>
            </div>
            <p className="text-xs text-gray-500">
              Please let us know what concerns you about {profile.fullName}'s account.
            </p>
            <form onSubmit={handleReportUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal-800">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-gray-300 bg-white"
                >
                  <option value="Fake or misleading profile">Fake or misleading profile</option>
                  <option value="Inappropriate photograph">Inappropriate photograph</option>
                  <option value="Offensive behavior or harassment">Offensive behavior or harassment</option>
                  <option value="Financial solicitation / scam">Financial solicitation / scam</option>
                  <option value="Already married">Already married</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal-800">Additional Details</label>
                <textarea
                  rows="3"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe your concern in detail..."
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOCK USER MODAL */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif font-bold text-lg text-charcoal-900">
              Block {profile.fullName}?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Blocking this member will prevent them from seeing your profile, viewing your photos, or sending you any messages.
            </p>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setBlockModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBlockUser}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

