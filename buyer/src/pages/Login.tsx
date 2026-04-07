import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Lock, Mail, AlertCircle, ArrowRight, Shield, Users, TrendingUp } from 'lucide-react';
import type { BuyerAuth } from '../types';

const DEMO_ACCOUNTS = [
  {
    email: 'rohit@prakritinat.com', password: 'buyer123',
    user: { id: 'USR-001', name: 'Rohit Agarwal', email: 'rohit@prakritinat.com', businessName: 'Prakriti Naturals Pvt Ltd', gstin: '19AAPCP1234A1Z5', city: 'Kolkata', state: 'West Bengal' },
  },
  {
    email: 'nalini@aranyaorganics.org', password: 'buyer123',
    user: { id: 'USR-003', name: 'Nalini Sahu', email: 'nalini@aranyaorganics.org', businessName: 'Aranya Organics Collective', gstin: '21CCCCA9012C1Z8', city: 'Bhubaneswar', state: 'Odisha' },
  },
];

interface Props { onLogin: (u: BuyerAuth) => void; }

export default function Login({ onLogin }: Props) {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const match = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
      if (match) { onLogin(match.user); navigate('/'); }
      else { setError('Invalid credentials. Use a demo account below.'); setLoading(false); }
    }, 600);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#052e16 0%,#0a3d1f 40%,#0d5c2a 100%)' }}
      >
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#4ade80,transparent)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#fbbf24,transparent)' }} />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <Leaf size={24} className="text-emerald-300" />
          </div>
          <div>
            <div className="text-white font-bold text-xl leading-none tracking-tight">NTFP Marketplace</div>
            <div className="text-emerald-400/60 text-[10px] tracking-widest uppercase mt-1">by BPSV · Buyer Portal</div>
          </div>
        </Link>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
              Forest to Factory,<br />
              <span className="text-emerald-300">Simplified.</span>
            </h1>
            <p className="mt-5 text-emerald-100/60 text-base leading-relaxed max-w-md">
              Source verified NTFPs at wholesale prices directly from tribal
              communities — with full traceability, compliance documents, and
              real-time order tracking.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: Shield, title: 'FRA-Compliant Sourcing', desc: 'Every product traceable to its forest community of origin' },
              { icon: Users,  title: 'Tribal Community Network', desc: '10,000+ tribal collectors across 9 states' },
              { icon: TrendingUp, title: 'Transparent Pricing', desc: 'No middlemen. Factory-direct wholesale rates.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-emerald-300" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{title}</div>
                  <div className="text-emerald-100/50 text-xs mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Product tags */}
          <div className="flex flex-wrap gap-2">
            {['Bengal Tejpata', 'Sal Seeds', 'Wild Honey', 'Mahua Flowers', 'Forest Turmeric', 'Amla', 'Bamboo Shoots'].map(t => (
              <span key={t} className="px-3 py-1 bg-white/5 border border-emerald-500/20 text-emerald-200/60 text-xs rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-emerald-100/20 text-xs">
          © 2024 Beyond Purpose Social Venture · All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col bg-stone-50">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-bold text-stone-800">NTFP by BPSV</span>
          </Link>
          <Link to="/catalogue" className="text-sm text-emerald-700 font-medium">Browse →</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-[420px]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-stone-800">Buyer Sign In</h2>
              <p className="text-stone-500 mt-2 text-sm leading-relaxed">
                Sign in to place orders and track deliveries.{' '}
                <Link to="/catalogue" className="text-emerald-700 hover:underline font-medium">
                  Continue browsing as guest →
                </Link>
              </p>
            </div>

            {/* Demo accounts */}
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-amber-800 mb-3">Demo Accounts (password: buyer123)</div>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map(a => (
                  <button
                    key={a.email}
                    onClick={() => { setEmail(a.email); setPassword('buyer123'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 bg-white border border-amber-200 hover:border-amber-400 rounded-xl text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">
                      {a.user.name.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-stone-800">{a.user.name}</div>
                      <div className="text-[10px] text-stone-500 truncate">{a.user.businessName}</div>
                    </div>
                    <ArrowRight size={13} className="text-amber-400 group-hover:text-amber-600 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com" required
                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="w-full pl-10 pr-10 py-3 border border-stone-200 rounded-xl text-sm bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign In to Buyer Portal'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-stone-200 text-center">
              <p className="text-xs text-stone-400">
                Beyond Purpose Social Venture · NTFP Supply Chain Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
