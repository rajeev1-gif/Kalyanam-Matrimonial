import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, MapPin, XCircle } from 'lucide-react';
import { interestService } from '../../services/interestService';
import { useNotifications } from '../../context/NotificationContext';

export default function SentInterestsPage() {
  const { showToast } = useNotifications();
  const [sentList, setSentList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSent = async () => {
    try {
      const res = await interestService.getSent();
      if (res.success) setSentList(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSent();
  }, []);

  const handleWithdraw = async (interestId) => {
    try {
      const res = await interestService.withdrawInterest(interestId);
      if (res.success) {
        showToast('Interest request withdrawn', 'info');
        fetchSent();
      }
    } catch (err) {
      showToast(err.message || 'Failed to withdraw', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-gold-200/80 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <Send className="w-6 h-6 text-primary-800" />
            Sent Interest Requests
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Profiles to whom you have expressed interest
          </p>
        </div>
        <span className="text-xs font-bold bg-gold-100 text-gold-900 px-3 py-1 rounded-full">
          {sentList.length} Total
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading sent requests...</div>
      ) : sentList.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gold-200 text-center space-y-3">
          <p className="text-xs text-gray-500">You haven't sent any interests yet.</p>
          <Link to="/search" className="inline-block px-5 py-2 bg-primary-800 text-white rounded-xl text-xs font-bold">
            Search Matches
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sentList.map((item) => {
            const receiver = item.receiver;
            const profile = receiver.profile;
            const photoUrl = profile.photos?.[0]?.url ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800';

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-gold-200/90 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-center justify-between gap-5"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-ivory-200 shrink-0 border border-gold-300">
                    <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <Link
                      to={`/profile/${receiver.id}`}
                      className="font-serif text-base font-bold text-charcoal-900 hover:text-primary-800 transition block"
                    >
                      {profile.fullName}
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span>{profile.educationCareer?.occupationTitle || 'Professional'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gold-600" />
                        {profile.location?.city || 'India'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block">
                      Sent on {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      item.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gold-100 text-gold-800'
                    }`}
                  >
                    {item.status}
                  </span>

                  {item.status === 'PENDING' && (
                    <button
                      onClick={() => handleWithdraw(item.id)}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Withdraw
                    </button>
                  )}

                  <Link
                    to={`/profile/${receiver.id}`}
                    className="px-4 py-1.5 rounded-xl border border-gold-300 text-charcoal-800 text-xs font-semibold hover:bg-gold-50 transition"
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

