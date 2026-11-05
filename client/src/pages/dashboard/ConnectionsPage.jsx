import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Phone, Mail, MessageSquare, MapPin, Calendar, Heart } from 'lucide-react';
import { interestService } from '../../services/interestService';

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadConnections() {
      try {
        const res = await interestService.getConnections();
        if (res.success) setConnections(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadConnections();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-gold-200/80 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-800" />
            My Accepted Connections
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Members with whom you share a mutual connection. Contact information is fully accessible.
          </p>
        </div>
        <span className="text-xs font-bold bg-green-100 text-green-900 px-3 py-1 rounded-full">
          {connections.length} Connected
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading connections...</div>
      ) : connections.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gold-200 text-center space-y-3">
          <p className="text-xs text-gray-500">No accepted connections yet. Accept received interests or send interests to profiles.</p>
          <Link to="/search" className="inline-block px-5 py-2 bg-primary-800 text-white rounded-xl text-xs font-bold">
            Find Matches
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {connections.map((c) => {
            const profile = c.profile;
            const photoUrl = profile?.photos?.[0]?.url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800';

            return (
              <div
                key={c.partnerId}
                className="bg-white p-6 rounded-3xl border border-gold-200 shadow-sm hover:shadow-lg transition flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-ivory-200 shrink-0 border border-gold-300">
                    <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <Link
                      to={`/profile/${c.partnerId}`}
                      className="font-serif text-lg font-bold text-charcoal-900 hover:text-primary-800 transition truncate block"
                    >
                      {profile?.fullName}
                    </Link>
                    <p className="text-xs text-gray-600 truncate">
                      {profile?.educationCareer?.occupationTitle || 'Professional'}
                    </p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gold-600" />
                      {profile?.location?.city}, {profile?.location?.state}
                    </p>
                  </div>
                </div>

                {/* Contact numbers revealed */}
                <div className="bg-gold-50/70 p-3.5 rounded-2xl border border-gold-200/60 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-charcoal-900">
                    <Phone className="w-3.5 h-3.5 text-primary-700 shrink-0" />
                    <strong>{c.mobile}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-charcoal-900">
                    <Mail className="w-3.5 h-3.5 text-primary-700 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    to={`/profile/${c.partnerId}`}
                    className="flex-1 text-center py-2.5 rounded-xl border border-gold-300 text-charcoal-800 font-semibold text-xs hover:bg-gold-50 transition"
                  >
                    View Full Profile
                  </Link>
                  <button
                    onClick={() => navigate('/dashboard/messages')}
                    className="flex-1 py-2.5 rounded-xl bg-primary-800 hover:bg-primary-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat Now
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

