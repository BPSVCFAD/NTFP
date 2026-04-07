import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Lock, Mail, AlertCircle } from 'lucide-react';
import type { AuthUser } from '../types';

const DEMO_EMAIL = 'admin@bpsv.org.in';
const DEMO_PASS  = 'admin123';

interface Props {
  onLogin: (u: AuthUser) => void;
}

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
      if (email === DEMO_EMAIL && password === DEMO_PASS) {
        onLogin({ name: 'Admin User', email, role: 'admin' });
        navigate('/');
      } else {
        setError('Invalid credentials. Use admin@bpsv.org.in / admin123');
        setLoading(false);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#052e16 0%,#14532d 50%,#166534 100%)' }}
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#4ade80,transparent)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#d97706,transparent)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <Leaf size={22} className="text-emerald-300" />
          </div>
          <div>
            <div className="text-white font-bold text-xl tracking-tight">NTFP</div>
            <div className="text-emerald-400 text-[10px] font-medium tracking-widest uppercase">by BPSV</div>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
              Forest to<br />
              <span className="text-emerald-300">Market,</span><br />
              Digitised.
            </h1>
            <p className="mt-5 text-emerald-100/70 text-base leading-relaxed max-w-sm">
              VanOS connects tribal forest communities with wholesale buyers across Northeast India,
              West Bengal, Jharkhand, Bihar &amp; Odisha — replacing WhatsApp and spreadsheets with
              a single, transparent platform.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '50+',   label: 'GSTIN Buyers' },
              { value: '< 24h', label: 'Order to Dispatch' },
              { value: '100%',  label: 'Delivery Visibility' },
            ].map(s => (
              <div key={s.label}
                className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-emerald-300">{s.value}</div>
                <div className="text-xs text-emerald-100/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {['Bengal Tejpata','Sal Seeds','Wild Honey','Mahua Flowers','Forest Turmeric','Kendu Leaves'].map(t => (
              <span key={t}
                className="px-3 py-1 bg-white/5 border border-emerald-500/20 text-emerald-200/70 text-xs rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-emerald-100/30 text-xs">
          © 2024 Beyond Purpose Social Venture. All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 bg-stone-50">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-stone-800 text-lg">VanOS</div>
            <div className="text-xs text-stone-400">by BPSV</div>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stone-800">Welcome back</h2>
            <p className="text-stone-500 mt-1.5 text-sm">Sign in to your admin account</p>
          </div>

          {/* Demo badge */}
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
            <div className="text-xs text-amber-800">
              <span className="font-semibold">Demo: </span>
              admin@bpsv.org.in / admin123
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@bpsv.org.in" required
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-10 py-2.5 border border-stone-200 rounded-xl text-sm bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
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
  );
}
