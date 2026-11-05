import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, ArrowUpDown, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { searchService } from '../../services/searchService';
import ProfileCard from '../../components/common/ProfileCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search filter states
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [ageMin, setAgeMin] = useState(searchParams.get('ageMin') || '20');
  const [ageMax, setAgeMax] = useState(searchParams.get('ageMax') || '40');
  const [heightMin, setHeightMin] = useState(searchParams.get('heightMin') || '');
  const [heightMax, setHeightMax] = useState(searchParams.get('heightMax') || '');
  const [religion, setReligion] = useState(searchParams.get('religion') || '');
  const [community, setCommunity] = useState(searchParams.get('community') || '');
  const [maritalStatus, setMaritalStatus] = useState(searchParams.get('maritalStatus') || '');
  const [highestEducation, setHighestEducation] = useState(searchParams.get('highestEducation') || '');
  const [occupation, setOccupation] = useState(searchParams.get('occupation') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [motherTongue, setMotherTongue] = useState(searchParams.get('motherTongue') || '');
  const [diet, setDiet] = useState(searchParams.get('diet') || '');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'recent');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const [profiles, setProfiles] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const executeSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        gender,
        ageMin,
        ageMax,
        heightMin,
        heightMax,
        religion,
        community,
        maritalStatus,
        highestEducation,
        occupation,
        city,
        motherTongue,
        diet,
        keyword,
        sortBy,
        page,
        limit: 12,
      };

      // Clean empty keys
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);

      const res = await searchService.searchProfiles(params);
      if (res.success) {
        setProfiles(res.data.profiles || []);
        setPagination(res.data.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [
    gender,
    ageMin,
    ageMax,
    heightMin,
    heightMax,
    religion,
    community,
    maritalStatus,
    highestEducation,
    occupation,
    city,
    motherTongue,
    diet,
    keyword,
    sortBy,
    page,
  ]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  const handleResetFilters = () => {
    setGender('');
    setAgeMin('20');
    setAgeMax('40');
    setHeightMin('');
    setHeightMax('');
    setReligion('');
    setCommunity('');
    setMaritalStatus('');
    setHighestEducation('');
    setOccupation('');
    setCity('');
    setMotherTongue('');
    setDiet('');
    setKeyword('');
    setSortBy('recent');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Search Bar & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">
            Browse Matrimonial Matches
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Found <strong>{pagination.total}</strong> verified profiles matching your criteria
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-800 text-white text-xs font-bold shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters ({pagination.total})</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT SEARCH FILTERS SIDEBAR */}
        <aside
          className={`w-full lg:w-72 bg-white p-6 rounded-3xl border border-gold-200/90 shadow-sm space-y-6 ${
            filterDrawerOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-gold-100">
            <div className="flex items-center gap-2 font-serif font-bold text-charcoal-900 text-sm">
              <Filter className="w-4 h-4 text-primary-800" />
              <span>Search Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-primary-800 hover:text-primary-950 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Keyword / Name */}
            <div className="space-y-1">
              <label className="font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
                Search Name / Keyword
              </label>
              <input
                type="text"
                placeholder="e.g. Doctor, IIT, Ananya"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:outline-none focus:border-primary-700"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
                Looking For
              </label>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white"
              >
                <option value="">All Genders</option>
                <option value="FEMALE">Brides (Women)</option>
                <option value="MALE">Grooms (Men)</option>
              </select>
            </div>

            {/* Age Range */}
            <div className="space-y-1">
              <label className="font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
                Age Range (Yrs)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="18"
                  max="70"
                  value={ageMin}
                  onChange={(e) => {
                    setAgeMin(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 px-2 text-center rounded-xl border border-gray-300"
                />
                <span>to</span>
                <input
                  type="number"
                  min="18"
                  max="70"
                  value={ageMax}
                  onChange={(e) => {
                    setAgeMax(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 px-2 text-center rounded-xl border border-gray-300"
                />
              </div>
            </div>

            {/* Religion */}
            <div className="space-y-1">
              <label className="font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
                Religion
              </label>
              <select
                value={religion}
                onChange={(e) => {
                  setReligion(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white"
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

            {/* Community / Caste */}
            <div className="space-y-1">
              <label className="font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
                Community / Caste
              </label>
              <input
                type="text"
                placeholder="e.g. Brahmin, Khatri, Nair"
                value={community}
                onChange={(e) => {
                  setCommunity(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* Location City */}
            <div className="space-y-1">
              <label className="font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Delhi, Mumbai, Bengaluru"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* Education */}
            <div className="space-y-1">
              <label className="font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
                Education
              </label>
              <input
                type="text"
                placeholder="e.g. B.Tech, MBA, MBBS, CA"
                value={highestEducation}
                onChange={(e) => {
                  setHighestEducation(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* Profession */}
            <div className="space-y-1">
              <label className="font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
                Profession
              </label>
              <input
                type="text"
                placeholder="e.g. Engineer, Doctor, Banker"
                value={occupation}
                onChange={(e) => {
                  setOccupation(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* Diet */}
            <div className="space-y-1">
              <label className="font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
                Dietary Habit
              </label>
              <select
                value={diet}
                onChange={(e) => {
                  setDiet(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white"
              >
                <option value="">Any Diet</option>
                <option value="VEGETARIAN">Vegetarian</option>
                <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                <option value="EGGETARIAN">Eggetarian</option>
                <option value="JAIN">Jain</option>
              </select>
            </div>

            {/* Marital Status */}
            <div className="space-y-1">
              <label className="font-bold text-charcoal-800 uppercase tracking-wider text-[11px]">
                Marital Status
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => {
                  setMaritalStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white"
              >
                <option value="">Any Status</option>
                <option value="NEVER_MARRIED">Never Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
              </select>
            </div>

          </div>
        </aside>

        {/* RIGHT PROFILES RESULTS CONTENT */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Sorting Bar */}
          <div className="bg-white px-5 py-3.5 rounded-2xl border border-gold-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-600 font-medium">
              Showing profiles {profiles.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>

            <div className="flex items-center gap-2 text-xs">
              <ArrowUpDown className="w-4 h-4 text-gold-600" />
              <span className="font-bold text-charcoal-800">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-3 rounded-xl border border-gray-300 bg-white font-medium"
              >
                <option value="recent">Recently Joined</option>
                <option value="age_asc">Age: Youngest First</option>
                <option value="age_desc">Age: Oldest First</option>
                <option value="completeness">Profile Completeness</option>
              </select>
            </div>
          </div>

          {/* Profiles Grid */}
          {loading ? (
            <div className="text-center py-24 text-sm text-gray-500">
              Searching matrimonial profiles...
            </div>
          ) : profiles.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gold-200 text-center space-y-4">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">
                No matching profiles found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try loosening your age or community criteria to see more candidates.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-xl bg-primary-800 text-white text-xs font-bold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="p-2 rounded-xl border border-gray-300 text-charcoal-800 hover:bg-gold-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                    page === pNum
                      ? 'bg-primary-900 text-white shadow-sm'
                      : 'border border-gray-200 hover:bg-gold-50 text-charcoal-800'
                  }`}
                >
                  {pNum}
                </button>
              ))}

              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="p-2 rounded-xl border border-gray-300 text-charcoal-800 hover:bg-gold-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

