import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, Sparkles, Quote } from 'lucide-react';
import { publicService } from '../../services/publicService';

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await publicService.getSuccessStories();
        if (res.success) setStories(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStories();
  }, []);

  return (
    <div className="py-16 space-y-16">
      
      {/* Page Header */}
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100 text-gold-800 text-xs font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          Celebrated Alliances
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-charcoal-900">
          Kalyanam Success Stories
        </h1>
        <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
          Read genuine journeys of couples who found their soulmate and united families through our platform.
        </p>
      </div>

      {/* Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-20 text-sm text-gray-500">Loading stories...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-3xl overflow-hidden border border-gold-200/90 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="aspect-[16/11] overflow-hidden bg-ivory-200 relative">
                  <img
                    src={story.couplePhoto}
                    alt={story.groomName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[11px] font-semibold text-gold-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(story.weddingDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <h3 className="font-serif text-xl font-bold">{story.groomName}</h3>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-gray-600 leading-relaxed italic">
                    "{story.story}"
                  </p>
                  <div className="pt-3 border-t border-gold-100 flex items-center justify-between text-xs text-gold-700 font-semibold">
                    <span>United via Kalyanam</span>
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Story Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-primary-900 to-charcoal-950 rounded-3xl p-8 sm:p-10 text-white text-center space-y-4 border border-gold-400">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Found Your Match on Kalyanam?
          </h2>
          <p className="text-xs text-ivory-300 max-w-lg mx-auto">
            Inspire thousands of families by sharing your wedding photographs and beautiful love story with our community.
          </p>
          <Link
            to="/register"
            className="inline-block px-6 py-2.5 rounded-full bg-gold-400 hover:bg-gold-300 text-charcoal-950 font-bold text-xs uppercase tracking-wider transition"
          >
            Start Your Journey Free
          </Link>
        </div>
      </div>

    </div>
  );
}

