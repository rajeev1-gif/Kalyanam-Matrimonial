import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Lock, Award, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-charcoal-950 text-ivory-200 border-t-2 border-gold-500/30 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-white/10">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-gold-400/20 text-gold-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">100% Verified Profiles</h4>
              <p className="text-xs text-gray-400">Strict ID and manual photograph authentication</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-300 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Total Privacy Control</h4>
              <p className="text-xs text-gray-400">Conceal phone, email & photos on your own terms</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-gold-400/20 text-gold-300 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Respected Matchmaking</h4>
              <p className="text-xs text-gray-400">Over 12,000+ celebrated matrimonial alliances</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-800 to-primary-600 flex items-center justify-center border border-gold-400 shadow-rose-glow">
                <Heart className="w-5 h-5 text-gold-300 fill-gold-400" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-wide text-white">
                Kalyanam
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              India's premier matrimonial platform curated for discerning individuals and respected families seeking meaningful lifelong relationships.
            </p>
            <div className="pt-2 text-xs text-gold-300 font-serif italic">
              "Where meaningful connections begin."
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-4">
              Explore Matches
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link to="/search?gender=FEMALE" className="hover:text-gold-300 transition">Browse Brides</Link></li>
              <li><Link to="/search?gender=MALE" className="hover:text-gold-300 transition">Browse Grooms</Link></li>
              <li><Link to="/search?religion=HINDU" className="hover:text-gold-300 transition">Hindu Matrimony</Link></li>
              <li><Link to="/search?religion=SIKH" className="hover:text-gold-300 transition">Sikh Matrimony</Link></li>
              <li><Link to="/search?religion=JAIN" className="hover:text-gold-300 transition">Jain Matrimony</Link></li>
              <li><Link to="/search?religion=MUSLIM" className="hover:text-gold-300 transition">Muslim Matrimony</Link></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-4">
              Membership & Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link to="/membership-plans" className="hover:text-gold-300 transition">Membership Plans</Link></li>
              <li><Link to="/success-stories" className="hover:text-gold-300 transition">Wedding Stories</Link></li>
              <li><a href="#how-it-works" className="hover:text-gold-300 transition">How It Works</a></li>
              <li><a href="#faq" className="hover:text-gold-300 transition">Frequently Asked Questions</a></li>
              <li><span className="text-gray-400">Privacy Policy</span></li>
              <li><span className="text-gray-400">Terms & Conditions</span></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-4">
              Concierge Support
            </h4>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>+91 1800 200 4545 (Toll Free)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>support@kalyanam-matrimony.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>Level 7, Royal Heritage Tower, MG Road, Bengaluru, Karnataka - 560001</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} Kalyanam Matrimonial Services Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Weddings worldwide.
          </p>
        </div>

      </div>
    </footer>
  );
}
