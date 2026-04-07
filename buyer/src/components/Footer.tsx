import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#052e16] text-emerald-100/70 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <Leaf size={20} className="text-emerald-300" />
              </div>
              <div>
                <div className="text-white font-bold text-lg leading-none">NTFP Marketplace</div>
                <div className="text-emerald-400/60 text-[10px] tracking-widest uppercase mt-0.5">by Beyond Purpose Social Venture</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Connecting wholesale buyers with FRA-compliant NTFP sourced by tribal and forest communities
              across Northeast India, West Bengal, Jharkhand, Odisha &amp; Bihar.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['FRA Compliant', 'Tribal Sourced', 'FSSAI Registered', 'Traceable Origin'].map(badge => (
                <span key={badge} className="px-3 py-1 bg-white/5 border border-white/10 text-emerald-200/60 text-[10px] rounded-full">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/catalogue', label: 'Browse Catalogue' },
                { to: '/catalogue?cat=Forest+Botanicals', label: 'Forest Botanicals' },
                { to: '/catalogue?cat=Seeds+%26+Nuts', label: 'Seeds & Nuts' },
                { to: '/catalogue?cat=Honey+%26+Bee+Products', label: 'Honey & Bee Products' },
                { to: '/catalogue?cat=Medicinal+Herbs', label: 'Medicinal Herbs' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm hover:text-emerald-200 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact BPSV</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <Mail size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>ntfp@bpsv.org.in</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Phone size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>+91 33 4567 8900</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Salt Lake, Kolkata — 700091<br />West Bengal, India</span>
              </li>
              <li className="flex items-center gap-2 text-sm mt-3">
                <ExternalLink size={13} className="text-emerald-400 shrink-0" />
                <a href="#" className="hover:text-emerald-200 transition-colors">Admin Portal →</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-emerald-100/30">
          <span>© 2024 Beyond Purpose Social Venture. All rights reserved.</span>
          <span>NTFP Supply Chain Platform · Demo Version</span>
        </div>
      </div>
    </footer>
  );
}
