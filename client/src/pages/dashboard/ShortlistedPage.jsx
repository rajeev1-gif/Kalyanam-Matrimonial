import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, MapPin } from 'lucide-react';
import { shortlistService } from '../../services/shortlistService';
import ProfileCard from '../../components/common/ProfileCard';
import { useNotifications } from '../../context/NotificationContext';

export default function ShortlistedPage() {
  const { showToast } = useNotifications();
  const [shortlists, setShortlists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShortlists = async () => {
    try {
      const res = await shortlistService.getMyShortlists();
      if (res.success) setShortlists(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlists();
  }, []);

  const handleRemove = (userId) => {
    setShortlists((prev) => prev.filter((p) => p.userId !== userId));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-gold-200/80 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
            Shortlisted Profiles
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Handpicked profiles you have saved for further consideration
          </p>
        </div>
        <span className="text-xs font-bold bg-rose-100 text-rose-900 px-3 py-1 rounded-full">
          {shortlists.length} Saved
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading shortlisted profiles...</div>
      ) : shortlists.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gold-200 text-center space-y-3">
          <p className="text-xs text-gray-500">You haven't shortlisted any profiles yet.</p>
          <Link to="/search" className="inline-block px-5 py-2 bg-primary-800 text-white rounded-xl text-xs font-bold">
            Explore Matches
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shortlists.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={{ ...profile, isShortlisted: true }}
              onShortlistToggled={(id, status) => {
                if (!status) handleRemove(id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

