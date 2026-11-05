import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  BookOpen,
  Briefcase,
  MapPin,
  Users,
  Smile,
  FileText,
  Camera,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Trash2,
  Star,
  Save,
} from 'lucide-react';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Religion & Caste', icon: Heart },
  { id: 3, title: 'Education & Career', icon: Briefcase },
  { id: 4, title: 'Location', icon: MapPin },
  { id: 5, title: 'Family Details', icon: Users },
  { id: 6, title: 'Lifestyle & Habits', icon: Smile },
  { id: 7, title: 'About & Preferences', icon: FileText },
  { id: 8, title: 'Profile Photos', icon: Camera },
];

export default function EditProfileWizardPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  // Form State covering all 8 steps
  const [formData, setFormData] = useState({
    // Step 1: Basic
    basicInfo: {
      fullName: '',
      gender: 'FEMALE',
      dateOfBirth: '1998-01-01',
      height: 165,
      maritalStatus: 'NEVER_MARRIED',
    },
    // Step 2: Religion & Community
    religionCommunity: {
      religion: 'HINDU',
      community: '',
      caste: '',
      subCaste: '',
      motherTongue: 'Hindi',
      gothra: '',
      manglik: 'NO',
    },
    // Step 3: Education & Career
    educationCareer: {
      highestEducation: 'B.Tech / Bachelor',
      educationField: 'Engineering',
      collegeName: '',
      occupationType: 'PRIVATE_SECTOR',
      occupationTitle: 'Software Engineer',
      companyName: '',
      annualIncome: '15-25 Lakhs',
      currency: 'INR',
    },
    // Step 4: Location
    location: {
      country: 'India',
      state: 'Delhi',
      city: 'New Delhi',
      citizenship: 'Indian',
      residentialStatus: 'CITIZEN',
    },
    // Step 5: Family
    familyDetails: {
      familyType: 'NUCLEAR',
      familyValues: 'MODERATE',
      familyStatus: 'MIDDLE_CLASS',
      fatherOccupation: '',
      motherOccupation: '',
      brothersCount: 0,
      brothersMarried: 0,
      sistersCount: 0,
      sistersMarried: 0,
      aboutFamily: '',
    },
    // Step 6: Lifestyle
    lifestyleDetails: {
      diet: 'VEGETARIAN',
      smoking: 'NO',
      drinking: 'NO',
      hobbies: '',
      interests: '',
    },
    // Step 7: About Me & Preferences
    aboutMe: '',
    profileSummary: '',
    partnerPreference: {
      minAge: 21,
      maxAge: 35,
      minHeight: 150,
      maxHeight: 195,
      minIncome: '10 Lakhs and above',
      religions: ['HINDU'],
      diet: 'VEGETARIAN',
    },
    // Photos list
    photos: [],
  });

  useEffect(() => {
    async function loadCurrentProfile() {
      try {
        const res = await profileService.getMyProfile();
        if (res.success && res.data) {
          const p = res.data;
          setFormData({
            basicInfo: {
              fullName: p.fullName || '',
              gender: p.gender || 'FEMALE',
              dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '1998-01-01',
              height: p.height || 165,
              maritalStatus: p.maritalStatus || 'NEVER_MARRIED',
            },
            religionCommunity: {
              religion: p.religionCommunity?.religion || 'HINDU',
              community: p.religionCommunity?.community || '',
              caste: p.religionCommunity?.caste || '',
              subCaste: p.religionCommunity?.subCaste || '',
              motherTongue: p.religionCommunity?.motherTongue || 'Hindi',
              gothra: p.religionCommunity?.gothra || '',
              manglik: p.religionCommunity?.manglik || 'NO',
            },
            educationCareer: {
              highestEducation: p.educationCareer?.highestEducation || 'B.Tech / Bachelor',
              educationField: p.educationCareer?.educationField || '',
              collegeName: p.educationCareer?.collegeName || '',
              occupationType: p.educationCareer?.occupationType || 'PRIVATE_SECTOR',
              occupationTitle: p.educationCareer?.occupationTitle || 'Professional',
              companyName: p.educationCareer?.companyName || '',
              annualIncome: p.educationCareer?.annualIncome || '15-25 Lakhs',
              currency: p.educationCareer?.currency || 'INR',
            },
            location: {
              country: p.location?.country || 'India',
              state: p.location?.state || 'Delhi',
              city: p.location?.city || 'New Delhi',
              citizenship: p.location?.citizenship || 'Indian',
              residentialStatus: p.location?.residentialStatus || 'CITIZEN',
            },
            familyDetails: {
              familyType: p.familyDetails?.familyType || 'NUCLEAR',
              familyValues: p.familyDetails?.familyValues || 'MODERATE',
              familyStatus: p.familyDetails?.familyStatus || 'MIDDLE_CLASS',
              fatherOccupation: p.familyDetails?.fatherOccupation || '',
              motherOccupation: p.familyDetails?.motherOccupation || '',
              brothersCount: p.familyDetails?.brothersCount || 0,
              brothersMarried: p.familyDetails?.brothersMarried || 0,
              sistersCount: p.familyDetails?.sistersCount || 0,
              sistersMarried: p.familyDetails?.sistersMarried || 0,
              aboutFamily: p.familyDetails?.aboutFamily || '',
            },
            lifestyleDetails: {
              diet: p.lifestyleDetails?.diet || 'VEGETARIAN',
              smoking: p.lifestyleDetails?.smoking || 'NO',
              drinking: p.lifestyleDetails?.drinking || 'NO',
              hobbies: p.lifestyleDetails?.hobbies || '',
              interests: p.lifestyleDetails?.interests || '',
            },
            aboutMe: p.aboutMe || '',
            profileSummary: p.profileSummary || '',
            partnerPreference: {
              minAge: p.partnerPreference?.minAge || 21,
              maxAge: p.partnerPreference?.maxAge || 35,
              minHeight: p.partnerPreference?.minHeight || 150,
              maxHeight: p.partnerPreference?.maxHeight || 195,
              minIncome: p.partnerPreference?.minIncome || '10 Lakhs',
              religions: p.partnerPreference?.religions ? JSON.parse(p.partnerPreference.religions) : ['HINDU'],
              diet: p.partnerPreference?.diet || 'VEGETARIAN',
            },
            photos: p.photos || [],
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCurrentProfile();
  }, []);

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSaveStep = async (nextStep = null) => {
    setSaving(true);
    try {
      const res = await profileService.updateProfile(formData);
      if (res.success) {
        showToast('Changes saved successfully!', 'success');
        await refreshUser();
        if (nextStep) {
          setActiveStep(nextStep);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save profile changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Photo handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('photo', file);

    setUploadingPhoto(true);
    try {
      const res = await profileService.uploadPhoto(data);
      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, res.data],
        }));
        showToast('Photo uploaded successfully!', 'success');
        await refreshUser();
      }
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddPhotoByUrl = async () => {
    if (!photoUrlInput.trim()) return;

    setUploadingPhoto(true);
    try {
      const res = await profileService.uploadPhoto({ url: photoUrlInput.trim() });
      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, res.data],
        }));
        setPhotoUrlInput('');
        showToast('Photo added!', 'success');
        await refreshUser();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add photo URL', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const res = await profileService.deletePhoto(photoId);
      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          photos: prev.photos.filter((p) => p.id !== photoId),
        }));
        showToast('Photo removed', 'info');
        await refreshUser();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete photo', 'error');
    }
  };

  const handleSetPrimary = async (photoId) => {
    try {
      const res = await profileService.setPrimaryPhoto(photoId);
      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          photos: prev.photos.map((p) => ({
            ...p,
            isProfilePicture: p.id === photoId,
          })),
        }));
        showToast('Primary photo updated', 'success');
        await refreshUser();
      }
    } catch (err) {
      showToast(err.message || 'Failed to set primary', 'error');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-sm text-gray-500">
        Loading profile wizard...
      </div>
    );
  }

  const completionPct = user?.profile?.completionPercentage || 40;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Wizard Header & Progress Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gold-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold text-charcoal-900">
              Matrimonial Profile Creation Wizard
            </h1>
            <p className="text-xs text-gray-500">
              Complete your profile details to unlock 100% verified status and higher match visibility
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary-900 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
              {completionPct}% Completed
            </span>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-gold-400 via-primary-700 to-primary-900 h-full transition-all duration-500 rounded-full"
            style={{ width: `${completionPct}%` }}
          ></div>
        </div>

        {/* Step Indicator Pills */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = activeStep === s.id;
            const isDone = activeStep > s.id;

            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`flex flex-col items-center p-2 rounded-xl text-[10px] font-semibold transition ${
                  isActive
                    ? 'bg-primary-900 text-gold-300 shadow-sm'
                    : isDone
                    ? 'bg-gold-50 text-gold-800'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="truncate w-full text-center">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP CONTAINER */}
      <div className="bg-white p-8 rounded-3xl border border-gold-200 shadow-md space-y-6">
        
        {/* STEP 1: BASIC INFORMATION */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 border-b border-gold-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-800" />
              Step 1: Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Full Name</label>
                <input
                  type="text"
                  value={formData.basicInfo.fullName}
                  onChange={(e) => handleNestedChange('basicInfo', 'fullName', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Gender</label>
                <select
                  value={formData.basicInfo.gender}
                  onChange={(e) => handleNestedChange('basicInfo', 'gender', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                >
                  <option value="FEMALE">Female (Bride)</option>
                  <option value="MALE">Male (Groom)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Date of Birth</label>
                <input
                  type="date"
                  value={formData.basicInfo.dateOfBirth}
                  onChange={(e) => handleNestedChange('basicInfo', 'dateOfBirth', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Height (cm)</label>
                <input
                  type="number"
                  min="130"
                  max="220"
                  value={formData.basicInfo.height}
                  onChange={(e) => handleNestedChange('basicInfo', 'height', parseInt(e.target.value))}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase text-charcoal-800">Marital Status</label>
                <select
                  value={formData.basicInfo.maritalStatus}
                  onChange={(e) => handleNestedChange('basicInfo', 'maritalStatus', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                >
                  <option value="NEVER_MARRIED">Never Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                  <option value="AWAITING_DIVORCE">Awaiting Divorce</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: RELIGION & COMMUNITY */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 border-b border-gold-100 pb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary-800" />
              Step 2: Religion and Community
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Religion</label>
                <select
                  value={formData.religionCommunity.religion}
                  onChange={(e) => handleNestedChange('religionCommunity', 'religion', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                >
                  <option value="HINDU">Hindu</option>
                  <option value="SIKH">Sikh</option>
                  <option value="JAIN">Jain</option>
                  <option value="MUSLIM">Muslim</option>
                  <option value="CHRISTIAN">Christian</option>
                  <option value="BUDDHIST">Buddhist</option>
                  <option value="PARSI">Parsi</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Community / Caste</label>
                <input
                  type="text"
                  placeholder="e.g. Brahmin, Rajput, Kayastha, Khatri"
                  value={formData.religionCommunity.community}
                  onChange={(e) => handleNestedChange('religionCommunity', 'community', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Sub-caste / Gotra</label>
                <input
                  type="text"
                  placeholder="e.g. Shandilya, Kashyap, Vadama"
                  value={formData.religionCommunity.gothra}
                  onChange={(e) => handleNestedChange('religionCommunity', 'gothra', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Mother Tongue</label>
                <input
                  type="text"
                  value={formData.religionCommunity.motherTongue}
                  onChange={(e) => handleNestedChange('religionCommunity', 'motherTongue', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase text-charcoal-800">Manglik Status</label>
                <select
                  value={formData.religionCommunity.manglik}
                  onChange={(e) => handleNestedChange('religionCommunity', 'manglik', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                >
                  <option value="NO">Non-Manglik</option>
                  <option value="YES">Manglik</option>
                  <option value="ANGSHIK">Angshik (Partial)</option>
                  <option value="DONT_KNOW">Don't Know</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EDUCATION & CAREER */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 border-b border-gold-100 pb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary-800" />
              Step 3: Education and Career
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Highest Education</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech, MBA, MBBS, MD, CA"
                  value={formData.educationCareer.highestEducation}
                  onChange={(e) => handleNestedChange('educationCareer', 'highestEducation', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">College / University</label>
                <input
                  type="text"
                  placeholder="e.g. IIT Bombay, AIIMS, IIM Ahmedabad"
                  value={formData.educationCareer.collegeName}
                  onChange={(e) => handleNestedChange('educationCareer', 'collegeName', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Occupation Sector</label>
                <select
                  value={formData.educationCareer.occupationType}
                  onChange={(e) => handleNestedChange('educationCareer', 'occupationType', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                >
                  <option value="PRIVATE_SECTOR">Private Sector</option>
                  <option value="GOVERNMENT">Government / Public Sector</option>
                  <option value="BUSINESS">Business / Entrepreneur</option>
                  <option value="DEFENCE">Defence</option>
                  <option value="SELF_EMPLOYED">Self Employed / Professional</option>
                  <option value="NOT_WORKING">Not Working</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Designation / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Architect, Consultant Doctor"
                  value={formData.educationCareer.occupationTitle}
                  onChange={(e) => handleNestedChange('educationCareer', 'occupationTitle', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Google, Apollo Hospital, Deloitte"
                  value={formData.educationCareer.companyName}
                  onChange={(e) => handleNestedChange('educationCareer', 'companyName', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Annual Income</label>
                <select
                  value={formData.educationCareer.annualIncome}
                  onChange={(e) => handleNestedChange('educationCareer', 'annualIncome', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                >
                  <option value="5-10 Lakhs">5 - 10 Lakhs</option>
                  <option value="10-15 Lakhs">10 - 15 Lakhs</option>
                  <option value="15-25 Lakhs">15 - 25 Lakhs</option>
                  <option value="25-50 Lakhs">25 - 50 Lakhs</option>
                  <option value="50-75 Lakhs">50 - 75 Lakhs</option>
                  <option value="75+ Lakhs">75+ Lakhs</option>
                  <option value="Not Disclosed">Prefer not to disclose</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: LOCATION */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 border-b border-gold-100 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-800" />
              Step 4: Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Country</label>
                <input
                  type="text"
                  value={formData.location.country}
                  onChange={(e) => handleNestedChange('location', 'country', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">State</label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra, Karnataka, Delhi"
                  value={formData.location.state}
                  onChange={(e) => handleNestedChange('location', 'state', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">City</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Bengaluru, New Delhi"
                  value={formData.location.city}
                  onChange={(e) => handleNestedChange('location', 'city', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Citizenship</label>
                <input
                  type="text"
                  value={formData.location.citizenship}
                  onChange={(e) => handleNestedChange('location', 'citizenship', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: FAMILY DETAILS */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 border-b border-gold-100 pb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-800" />
              Step 5: Family Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Family Type</label>
                <select
                  value={formData.familyDetails.familyType}
                  onChange={(e) => handleNestedChange('familyDetails', 'familyType', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                >
                  <option value="NUCLEAR">Nuclear</option>
                  <option value="JOINT">Joint Family</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Family Status</label>
                <select
                  value={formData.familyDetails.familyStatus}
                  onChange={(e) => handleNestedChange('familyDetails', 'familyStatus', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                >
                  <option value="MIDDLE_CLASS">Middle Class</option>
                  <option value="UPPER_MIDDLE_CLASS">Upper Middle Class</option>
                  <option value="AFFLUENT">Affluent / Industrialist</option>
                  <option value="HIGH_NET_WORTH">High Net Worth</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Father's Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Government Officer, Businessman"
                  value={formData.familyDetails.fatherOccupation}
                  onChange={(e) => handleNestedChange('familyDetails', 'fatherOccupation', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Mother's Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Professor, Doctor, Homemaker"
                  value={formData.familyDetails.motherOccupation}
                  onChange={(e) => handleNestedChange('familyDetails', 'motherOccupation', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase text-charcoal-800">About Family Background</label>
                <textarea
                  rows={3}
                  placeholder="Share a brief overview of family traditions, hometown, and roots..."
                  value={formData.familyDetails.aboutFamily}
                  onChange={(e) => handleNestedChange('familyDetails', 'aboutFamily', e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: LIFESTYLE & HABITS */}
        {activeStep === 6 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 border-b border-gold-100 pb-3 flex items-center gap-2">
              <Smile className="w-5 h-5 text-primary-800" />
              Step 6: Lifestyle and Habits
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Dietary Habits</label>
                <select
                  value={formData.lifestyleDetails.diet}
                  onChange={(e) => handleNestedChange('lifestyleDetails', 'diet', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                >
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="EGGETARIAN">Eggetarian</option>
                  <option value="JAIN">Jain</option>
                  <option value="VEGAN">Vegan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Smoking</label>
                <select
                  value={formData.lifestyleDetails.smoking}
                  onChange={(e) => handleNestedChange('lifestyleDetails', 'smoking', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                >
                  <option value="NO">No</option>
                  <option value="OCCASIONALLY">Occasionally</option>
                  <option value="YES">Yes</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">Drinking</label>
                <select
                  value={formData.lifestyleDetails.drinking}
                  onChange={(e) => handleNestedChange('lifestyleDetails', 'drinking', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                >
                  <option value="NO">No</option>
                  <option value="OCCASIONALLY">Occasionally</option>
                  <option value="YES">Yes</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-3">
                <label className="text-xs font-bold uppercase text-charcoal-800">Hobbies & Activities</label>
                <input
                  type="text"
                  placeholder="e.g. Classical Music, Yoga, Hiking, Badminton, Chess, Reading"
                  value={formData.lifestyleDetails.hobbies}
                  onChange={(e) => handleNestedChange('lifestyleDetails', 'hobbies', e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: ABOUT ME & PARTNER PREFERENCES */}
        {activeStep === 7 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 border-b border-gold-100 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-800" />
              Step 7: About Me & Partner Preferences
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">
                  Personal Introduction & Bio
                </label>
                <textarea
                  rows={4}
                  placeholder="Write a warm, authentic description about your personality, values, outlook on marriage and what makes you happy..."
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-charcoal-800">
                  One-Line Profile Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Pediatrician at Apollo Hospital Delhi, warm and family-oriented."
                  value={formData.profileSummary}
                  onChange={(e) => setFormData({ ...formData, profileSummary: e.target.value })}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
                />
              </div>

              {/* Partner Preferences */}
              <div className="pt-4 border-t border-gold-100 space-y-3">
                <h4 className="text-xs font-bold uppercase text-charcoal-900 tracking-wider">
                  Partner Expectations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Preferred Age Range</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min Age"
                        value={formData.partnerPreference.minAge}
                        onChange={(e) => handleNestedChange('partnerPreference', 'minAge', parseInt(e.target.value))}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-gray-300"
                      />
                      <span>to</span>
                      <input
                        type="number"
                        placeholder="Max Age"
                        value={formData.partnerPreference.maxAge}
                        onChange={(e) => handleNestedChange('partnerPreference', 'maxAge', parseInt(e.target.value))}
                        className="w-full h-10 px-3 text-xs rounded-xl border border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Minimum Annual Income</label>
                    <input
                      type="text"
                      placeholder="e.g. 15 Lakhs and above"
                      value={formData.partnerPreference.minIncome}
                      onChange={(e) => handleNestedChange('partnerPreference', 'minIncome', e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: PROFILE PHOTOS */}
        {activeStep === 8 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 border-b border-gold-100 pb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary-800" />
              Step 8: Profile Photographs
            </h3>

            <p className="text-xs text-gray-600">
              Profiles with photos receive 8x more interest requests. Upload recent close-up and full-length photographs in JPG, PNG or WebP format.
            </p>

            {/* Upload Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* File upload input */}
              <label className="border-2 border-dashed border-gold-300 hover:border-primary-700 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-gold-50/40 hover:bg-gold-50 transition">
                <Upload className="w-8 h-8 text-gold-600" />
                <span className="text-xs font-bold text-primary-900">Upload Image File</span>
                <span className="text-[11px] text-gray-500">Max size 5MB (JPG, PNG, WebP)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </label>

              {/* URL paste input */}
              <div className="border border-gold-200 rounded-3xl p-6 flex flex-col justify-center gap-3 bg-white">
                <span className="text-xs font-bold text-charcoal-900">Or Add Direct Image URL</span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    className="flex-1 h-10 px-3 text-xs rounded-xl border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoByUrl}
                    disabled={uploadingPhoto || !photoUrlInput.trim()}
                    className="px-4 py-2 bg-primary-800 text-white rounded-xl text-xs font-bold hover:bg-primary-900 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

            </div>

            {/* Photo Gallery Grid */}
            <div className="space-y-3 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                Uploaded Photographs ({formData.photos.length})
              </h4>

              {formData.photos.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 bg-gray-50 rounded-2xl">
                  No photos uploaded yet. Add at least one photo for account verification.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formData.photos.map((p) => (
                    <div
                      key={p.id}
                      className="relative rounded-2xl overflow-hidden border-2 border-gold-200 group aspect-square bg-gray-100"
                    >
                      <img src={p.url} alt="Profile" className="w-full h-full object-cover" />

                      {/* Primary Badge */}
                      {p.isProfilePicture && (
                        <div className="absolute top-2 left-2 bg-gold-400 text-charcoal-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Primary
                        </div>
                      )}

                      {/* Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!p.isProfilePicture && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(p.id)}
                            className="p-2 bg-white rounded-full text-gold-700 hover:scale-110 transition"
                            title="Set as Primary"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(p.id)}
                          className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="pt-6 border-t border-gold-100 flex items-center justify-between gap-4">
          
          <button
            type="button"
            disabled={activeStep === 1 || saving}
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-charcoal-800 hover:bg-gray-50 transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Step
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveStep(null)}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-gold-400 text-primary-900 text-xs font-semibold hover:bg-gold-50 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Progress
            </button>

            {activeStep < 8 ? (
              <button
                type="button"
                onClick={() => handleSaveStep(activeStep + 1)}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-primary-850 hover:bg-primary-950 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <span>Save & Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleSaveStep(null);
                  navigate('/dashboard/my-profile');
                }}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-charcoal-950 text-xs font-bold flex items-center gap-1.5 shadow-gold-glow transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finish & View Profile
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

