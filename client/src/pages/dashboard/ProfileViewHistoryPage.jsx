import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MapPin, Calendar } from 'lucide-react';
import { shortlistService } from '../../services/shortlistService';

export default function ProfileViewHistoryPage() {
  const [activeTab, setActiveTab] = useState('who_viewed_me');
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchViews() {
      setLoading(true);
      try {
        const res = await shortlistService.getProfileViews(activeTab);
        if (res.success) setViews(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchViews();
  }, [activeTab]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-gold-200/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <Eye className="w-6 h-6 text-primary-800" />
            Profile Views & Activity
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor visitor engagement and track members you have explored
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-gold-100/70 p-1 rounded-2xl border border-gold-300 w-fit">
          <button
            onClick={() => setActiveTab('who_viewed_me')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'who_viewed_me'
                ? 'bg-primary-900 text-white shadow-sm'
                : 'text-charcoal-800 hover:text-primary-900'
            }`}
          >
            Who Viewed Me ({activeTab === 'who_viewed_me' ? views.length : ''})
          </button>
          <button
            onClick={() => setActiveTab('viewed_by_me')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'viewed_by_me'
                ? 'bg-primary-900 text-white shadow-sm'
                : 'text-charcoal-800 hover:text-primary-900'
            }`}
          >
            Viewed By Me ({activeTab === 'viewed_by_me' ? views.length : ''})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading view history...</div>
      ) : views.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gold-200 text-center space-y-3">
          <p className="text-xs text-gray-500">No profile views recorded in this category yet.</p>
          <Link to="/search" className="inline-block px-5 py-2 bg-primary-800 text-white rounded-xl text-xs font-bold">
            Search Matches
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {views.map((item, idx) => {
            const p = item.profile;
            const photoUrl = p.photos?.[0]?.url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800';

            return (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-gold-200/90 shadow-sm hover:shadow-md transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-ivory-200 border border-gold-300 shrink-0">
                    <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <Link
                      to={`/profile/${item.userId}`}
                      className="font-serif text-sm font-bold text-charcoal-900 hover:text-primary-800 transition truncate block"
                    >
                      {p.fullName}
                    </Link>
                    <p className="text-xs text-gray-600 truncate">{p.educationCareer?.occupationTitle || 'Professional'}</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gold-600" />
                      {p.location?.city || 'India'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-gray-400 block mb-2">
                    {new Date(item.viewedAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/profile/${item.userId}`}
                    className="px-3 py-1.5 rounded-lg border border-gold-300 text-charcoal-800 text-xs font-semibold hover:bg-gold-50 transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

