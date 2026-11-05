import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, CheckCircle2, MapPin, Briefcase, Heart, Users, Smile, FileText } from 'lucide-react';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';

export default function MyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await profileService.getMyProfile();
        if (res.success) setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-xs text-gray-500">Loading your profile...</div>;
  }

  if (!profile) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-xs text-gray-500">Profile data unavailable.</p>
        <Link to="/dashboard/edit-profile" className="px-4 py-2 bg-primary-800 text-white rounded-xl text-xs font-bold inline-block">
          Complete Profile
        </Link>
      </div>
    );
  }

  const photos = profile.photos || [];
  const primaryPhoto = photos.find((p) => p.isProfilePicture)?.url || photos[0]?.url ||
    'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold-400 bg-ivory-200 shrink-0 shadow-md">
            <img src={primaryPhoto} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gold-700 uppercase tracking-widest">
              My Public Matrimonial Profile
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              {profile.fullName}
            </h1>
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <span>{profile.gender === 'FEMALE' ? 'Bride' : 'Groom'}</span>
              <span>•</span>
              <span>{profile.location?.city || 'India'}</span>
              <span>•</span>
              <strong className="text-primary-800">{profile.completionPercentage}% Complete</strong>
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/edit-profile"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-800 to-primary-950 text-white font-bold text-xs flex items-center gap-2 shadow-rose-glow hover:shadow-lg transition"
        >
          <Edit3 className="w-4 h-4 text-gold-300" />
          Edit Profile Wizard
        </Link>
      </div>

      {/* Profile Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* About */}
        <div className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm space-y-3 md:col-span-2">
          <h3 className="font-serif font-bold text-base text-charcoal-900 border-b border-gold-100 pb-2">
            Personal Introduction & About Me
          </h3>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
            {profile.aboutMe || 'No detailed biography provided.'}
          </p>
        </div>

        {/* Religion */}
        <div className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-charcoal-900 border-b border-gold-100 pb-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary-800" />
            Religion & Caste
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-gray-500">Religion:</span> <strong>{profile.religionCommunity?.religion}</strong></div>
            <div><span className="text-gray-500">Community:</span> <strong>{profile.religionCommunity?.community || 'N/A'}</strong></div>
            <div><span className="text-gray-500">Mother Tongue:</span> <strong>{profile.religionCommunity?.motherTongue}</strong></div>
            <div><span className="text-gray-500">Manglik:</span> <strong>{profile.religionCommunity?.manglik}</strong></div>
          </div>
        </div>

        {/* Career */}
        <div className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-charcoal-900 border-b border-gold-100 pb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary-800" />
            Career & Education
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-gray-500">Degree:</span> <strong>{profile.educationCareer?.highestEducation}</strong></div>
            <div><span className="text-gray-500">Profession:</span> <strong>{profile.educationCareer?.occupationTitle}</strong></div>
            <div><span className="text-gray-500">Company:</span> <strong>{profile.educationCareer?.companyName || 'N/A'}</strong></div>
            <div><span className="text-gray-500">Income:</span> <strong>{profile.educationCareer?.annualIncome}</strong></div>
          </div>
        </div>

      </div>

    </div>
  );
}

