import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Check, X, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import { interestService } from '../../services/interestService';
import { useNotifications } from '../../context/NotificationContext';

export default function ReceivedInterestsPage() {
  const { showToast } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReceived = async () => {
    try {
      const res = await interestService.getReceived();
      if (res.success) setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceived();
  }, []);

  const handleAccept = async (interestId) => {
    try {
      const res = await interestService.acceptInterest(interestId);
      if (res.success) {
        showToast('Interest accepted! You are now connected.', 'success');
        fetchReceived();
      }
    } catch (err) {
      showToast(err.message || 'Error accepting interest', 'error');
    }
  };

  const handleReject = async (interestId) => {
    try {
      const res = await interestService.rejectInterest(interestId);
      if (res.success) {
        showToast('Interest request declined', 'info');
        fetchReceived();
      }
    } catch (err) {
      showToast(err.message || 'Error declining interest', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-gold-200/80 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-primary-800" />
            Received Interest Requests
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Members who have expressed interest in connecting with you
          </p>
        </div>
        <span className="text-xs font-bold bg-primary-100 text-primary-900 px-3 py-1 rounded-full">
          {requests.length} Pending
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gold-200 text-center space-y-3">
          <p className="text-xs text-gray-500">You have no pending interest requests at the moment.</p>
          <Link to="/search" className="inline-block px-5 py-2 bg-primary-800 text-white rounded-xl text-xs font-bold">
            Explore Profiles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((item) => {
            const sender = item.sender;
            const profile = sender.profile;
            const photoUrl = profile.photos?.[0]?.url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800';

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
                      to={`/profile/${sender.id}`}
                      className="font-serif text-base font-bold text-charcoal-900 hover:text-primary-800 transition block"
                    >
                      {profile.fullName}
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span>{profile.religionCommunity?.religion} • {profile.religionCommunity?.community || 'Member'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gold-600" />
                        {profile.location?.city || 'India'}
                      </span>
                    </div>
                    {item.message && (
                      <p className="text-[11px] text-gray-500 italic bg-gold-50/60 px-2.5 py-1 rounded-lg">
                        "{item.message}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Link
                    to={`/profile/${sender.id}`}
                    className="px-4 py-2 rounded-xl border border-gold-300 text-charcoal-800 text-xs font-semibold hover:bg-gold-50 transition"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition"
                    title="Decline"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAccept(item.id)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-800 to-primary-950 text-white font-bold text-xs flex items-center gap-1.5 shadow-rose-glow hover:shadow-lg transition"
                  >
                    <Check className="w-4 h-4" />
                    Accept Request
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

