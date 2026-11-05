import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Search,
  Sparkles,
  ShieldCheck,
  Lock,
  Users,
  Award,
  ChevronRight,
  ChevronDown,
  Star,
  CheckCircle2,
  Calendar,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { searchService } from '../../services/searchService';
import { publicService } from '../../services/publicService';
import { membershipService } from '../../services/membershipService';
import ProfileCard from '../../components/common/ProfileCard';

export default function HomePage() {
  const navigate = useNavigate();

  // Search form state
  const [lookingFor, setLookingFor] = useState('FEMALE');
  const [ageFrom, setAgeFrom] = useState('21');
  const [ageTo, setAgeTo] = useState('32');
  const [religion, setReligion] = useState('');
  const [community, setCommunity] = useState('');
  const [location, setLocation] = useState('');

  // Data states
  const [featuredProfiles, setFeaturedProfiles] = useState([]);
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [successStories, setSuccessStories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [featRes, recRes, storiesRes, testRes, faqRes, plansRes] = await Promise.all([
          searchService.getFeaturedProfiles(),
          searchService.getRecentProfiles(),
          publicService.getSuccessStories(),
          publicService.getTestimonials(),
          publicService.getFaqs(),
          membershipService.getPlans(),
        ]);

        if (featRes.success) setFeaturedProfiles(featRes.data || []);
        if (recRes.success) setRecentProfiles(recRes.data || []);
        if (storiesRes.success) setSuccessStories(storiesRes.data || []);
        if (testRes.success) setTestimonials(testRes.data || []);
        if (faqRes.success) setFaqs(faqRes.data || []);
        if (plansRes.success) setPlans(plansRes.data || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (lookingFor) params.append('gender', lookingFor);
    if (ageFrom) params.append('ageMin', ageFrom);
    if (ageTo) params.append('ageMax', ageTo);
    if (religion) params.append('religion', religion);
    if (community) params.append('community', community);
    if (location) params.append('city', location);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION WITH QUICK SEARCH */}
      <section className="relative min-h-[640px] flex items-center justify-center pt-8 pb-20 overflow-hidden bg-gradient-to-b from-primary-950 via-primary-900 to-charcoal-950 text-white">
        
        {/* Wedding Hero Background Image with Subtle Parallax & Overlay */}
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1920"
            alt="Indian Wedding Celebration"
            className="w-full h-full object-cover scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-primary-950/80 z-0"></div>

        {/* Hero Decorative Motifs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-gold-400/30 text-gold-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            India's Most Trusted Royal Matrimonial Network
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-xl leading-tight">
              Find Your <span className="text-gold-gradient italic font-serif">Perfect</span> Life Partner
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-ivory-300 font-normal leading-relaxed">
              Where meaningful connections begin and beautiful journeys become lifelong relationships.
            </p>
          </div>

          {/* QUICK SEARCH WIDGET CARD */}
          <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-gold-300/80 text-charcoal-900 text-left">
            
            <form onSubmit={handleQuickSearch} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                
                {/* 1. Looking For */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                    I'm looking for
                  </label>
                  <select
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-semibold rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary-700"
                  >
                    <option value="FEMALE">Bride (Woman)</option>
                    <option value="MALE">Groom (Man)</option>
                  </select>
                </div>

                {/* 2. Age From */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                    Age From
                  </label>
                  <select
                    value={ageFrom}
                    onChange={(e) => setAgeFrom(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-semibold rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary-700"
                  >
                    {Array.from({ length: 40 }, (_, i) => i + 18).map((num) => (
                      <option key={num} value={num}>
                        {num} Years
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Age To */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                    Age To
                  </label>
                  <select
                    value={ageTo}
                    onChange={(e) => setAgeTo(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-semibold rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary-700"
                  >
                    {Array.from({ length: 40 }, (_, i) => i + 21).map((num) => (
                      <option key={num} value={num}>
                        {num} Years
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Religion */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                    Religion
                  </label>
                  <select
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-semibold rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary-700"
                  >
                    <option value="">Any Religion</option>
                    <option value="HINDU">Hindu</option>
                    <option value="SIKH">Sikh</option>
                    <option value="JAIN">Jain</option>
                    <option value="MUSLIM">Muslim</option>
                    <option value="CHRISTIAN">Christian</option>
                    <option value="BUDDHIST">Buddhist</option>
                    <option value="PARSI">Parsi</option>
                  </select>
                </div>

                {/* 5. Community */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                    Community
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Brahmin, Rajput"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary-700"
                  />
                </div>

                {/* 6. City / State */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                    City / State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Delhi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-11 px-3 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary-700"
                  />
                </div>

              </div>

              {/* Submit Button & Register CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <UserCheck className="w-4 h-4 text-primary-700" />
                  <span>50,000+ Verified Brides & Grooms Active Now</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    to="/register"
                    className="flex-1 sm:flex-none text-center px-6 py-3 rounded-xl border border-primary-700 text-primary-900 font-bold text-xs hover:bg-primary-50 transition"
                  >
                    Register Free
                  </Link>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 hover:from-primary-800 hover:to-primary-950 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-rose-glow hover:shadow-xl transition"
                  >
                    <Search className="w-4 h-4 text-gold-300" />
                    Let's Begin Search
                  </button>
                </div>
              </div>

            </form>

          </div>

        </div>

      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
            Four Simple Steps
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            How Kalyanam Works For You
          </h2>
          <p className="max-w-xl mx-auto text-sm text-gray-600">
            A dignified, structured and family-friendly approach to discovering your lifelong match.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="bg-white p-6 rounded-3xl border border-gold-200/80 shadow-sm hover:shadow-md transition text-center space-y-4 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-800 to-primary-600 text-gold-300 flex items-center justify-center mx-auto shadow-rose-glow group-hover:scale-110 transition">
              <span className="font-serif text-2xl font-bold">1</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Create Your Profile</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Register yourself or your loved one in minutes with education, career, lifestyle, and horoscope preferences.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gold-200/80 shadow-sm hover:shadow-md transition text-center space-y-4 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-800 to-primary-600 text-gold-300 flex items-center justify-center mx-auto shadow-rose-glow group-hover:scale-110 transition">
              <span className="font-serif text-2xl font-bold">2</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Discover Matches</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Explore 100% verified profiles filtered by community, profession, salary, city, and dietary alignment.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gold-200/80 shadow-sm hover:shadow-md transition text-center space-y-4 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-800 to-primary-600 text-gold-300 flex items-center justify-center mx-auto shadow-rose-glow group-hover:scale-110 transition">
              <span className="font-serif text-2xl font-bold">3</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Connect With Families</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Send respectful interests, unlock verified contact details, and start safe conversations via real-time chat.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gold-200/80 shadow-sm hover:shadow-md transition text-center space-y-4 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-800 to-primary-600 text-gold-300 flex items-center justify-center mx-auto shadow-rose-glow group-hover:scale-110 transition">
              <span className="font-serif text-2xl font-bold">4</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Begin Your Journey</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Arrange family meetings, celebrate shared values, and embark on a joyous lifelong matrimonial journey.
            </p>
          </div>

        </div>

      </section>

      {/* 3. FEATURED PROFILES CAROUSEL / GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
              Verified & Handpicked
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900 mt-1">
              Featured Profiles
            </h2>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-800 hover:text-primary-950 transition"
          >
            <span>View All Profiles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProfiles.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">Loading featured profiles...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProfiles.slice(0, 4).map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}

      </section>

      {/* 4. RECENTLY JOINED PROFILES */}
      <section className="bg-ivory-200/60 py-16 border-y border-gold-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
                New Members
              </span>
              <h2 className="font-serif text-3xl font-bold text-charcoal-900 mt-1">
                Recently Joined Profiles
              </h2>
            </div>
            <Link
              to="/search?sortBy=recent"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-800 hover:text-primary-950 transition"
            >
              <span>Explore New Joiners</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProfiles.slice(0, 4).map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>

        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
            Gold Standard in Matrimony
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            Why Discerning Families Choose Kalyanam
          </h2>
          <p className="max-w-xl mx-auto text-sm text-gray-600">
            We honor Indian family traditions while providing state-of-the-art matchmaking technology and strict privacy safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-gold-200 shadow-sm hover:shadow-xl transition space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-50 border border-gold-300 text-gold-600 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal-900">100% Verified Credentials</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every profile is authenticated using mobile verification, official photo moderation, and education/work verification for total authenticity.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gold-200 shadow-sm hover:shadow-xl transition space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-300 text-primary-700 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal-900">Uncompromising Privacy</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              You decide who views your photographs, email address, and phone number. No spam, no unauthorized disclosures.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gold-200 shadow-sm hover:shadow-xl transition space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-50 border border-gold-300 text-gold-600 flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal-900">Dedicated Relationship Managers</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our seasoned matrimonial consultants provide personalized match suggestions, horoscope screening, and family meeting coordination.
            </p>
          </div>

        </div>
      </section>

      {/* 6. SUCCESS STORIES */}
      <section className="bg-gradient-to-br from-charcoal-950 via-primary-950 to-charcoal-950 text-white py-20 border-y-2 border-gold-500/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Celebrated Unions
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Real Kalyanam Success Stories
            </h2>
            <p className="max-w-xl mx-auto text-sm text-gray-300">
              Thousands of couples found lifelong companionship and family harmony through our network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story) => (
              <div
                key={story.id}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-gold-400/50 transition-all flex flex-col justify-between group"
              >
                <div className="aspect-[16/10] overflow-hidden bg-black/40">
                  <img
                    src={story.couplePhoto}
                    alt={story.groomName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-gold-300 text-[11px] font-medium mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Married on {new Date(story.weddingDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white">{story.groomName}</h3>
                    <p className="text-xs text-gray-300 mt-2 line-clamp-4 italic">
                      "{story.story}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              to="/success-stories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-400 hover:bg-gold-300 text-charcoal-950 text-xs font-bold shadow-gold-glow transition"
            >
              <span>Read More Success Stories</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 7. MEMBERSHIP PLANS HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
            Transparent Pricing
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            Tailored Membership Plans
          </h2>
          <p className="max-w-xl mx-auto text-sm text-gray-600">
            Select the plan that fits your pace of matchmaking. Free registration with premium options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.slice(0, 3).map((plan) => {
            const isGold = plan.planCode === 'GOLD';
            const features = Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? JSON.parse(plan.features) : []);

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  isGold
                    ? 'bg-gradient-to-b from-primary-950 via-primary-900 to-charcoal-950 text-white shadow-2xl border-2 border-gold-400 relative scale-105'
                    : 'bg-white text-charcoal-900 border border-gold-200 shadow-md hover:shadow-xl'
                }`}
              >
                {isGold && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-400 text-charcoal-950 text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className={`font-serif text-2xl font-bold ${isGold ? 'text-gold-300' : 'text-primary-950'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs mt-1 ${isGold ? 'text-gray-300' : 'text-gray-500'}`}>
                      {plan.durationMonths} Month{plan.durationMonths > 1 ? 's' : ''} Membership
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold font-serif">
                      ₹{plan.price.toLocaleString('en-IN')}
                    </span>
                    <span className={`text-xs ${isGold ? 'text-gray-300' : 'text-gray-500'}`}>
                      / {plan.durationMonths} mo
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 pt-2 text-xs">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isGold ? 'text-gold-400' : 'text-primary-700'}`} />
                        <span className={isGold ? 'text-gray-200' : 'text-gray-700'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    to="/membership-plans"
                    className={`block w-full text-center py-3 rounded-xl font-bold text-xs transition ${
                      isGold
                        ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-charcoal-950 hover:opacity-95 shadow-gold-glow'
                        : 'bg-primary-800 text-white hover:bg-primary-900'
                    }`}
                  >
                    {plan.price === 0 ? 'Get Started Free' : 'Choose Plan'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="bg-ivory-200/50 py-16 border-y border-gold-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
              Trusted by Families
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900">
              Words From Happy Parents & Couples
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white p-6 rounded-3xl border border-gold-200/80 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-gold-500">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-500" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gold-100">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt={t.authorName} className="w-10 h-10 rounded-full object-cover border border-gold-300" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 font-bold flex items-center justify-center text-xs">
                      {t.authorName[0]}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-900">{t.authorName}</h4>
                    <p className="text-[11px] text-gray-500">{t.authorLocation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
            Got Questions?
          </span>
          <h2 className="font-serif text-3xl font-bold text-charcoal-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-gold-200 overflow-hidden shadow-sm transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-charcoal-900 hover:text-primary-800 transition"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gold-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gold-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. FINAL BOTTOM CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-charcoal-950 rounded-3xl p-10 sm:p-14 text-white text-center space-y-6 border-2 border-gold-400 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
              Begin Your Journey to <span className="text-gold-gradient italic">Lifelong Happiness</span>
            </h2>
            <p className="text-sm text-ivory-200">
              Join over 50,000+ verified brides, grooms and families who trust Kalyanam for finding their match.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-charcoal-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow transition"
              >
                Register Free Today
              </Link>
              <Link
                to="/search"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-gold-400/50 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition"
              >
                Explore All Profiles
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

