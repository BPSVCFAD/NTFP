import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Shield, Leaf, TrendingUp, Users, ChevronRight, Package } from 'lucide-react';
import skusData from '../data/skus.json';
import categoriesData from '../data/categories.json';
import type { SKU } from '../types';

const CAT_STYLE: Record<string, { gradient: string; emoji: string }> = {
  'Forest Botanicals':      { gradient: 'from-emerald-800 to-emerald-600', emoji: '🌿' },
  'Seeds & Nuts':           { gradient: 'from-amber-800 to-amber-600',     emoji: '🌰' },
  'Flowers & Buds':         { gradient: 'from-rose-800 to-pink-600',       emoji: '🌸' },
  'Honey & Bee Products':   { gradient: 'from-amber-600 to-yellow-500',    emoji: '🍯' },
  'Bamboo Products':        { gradient: 'from-lime-800 to-green-600',      emoji: '🎋' },
  'Medicinal Herbs':        { gradient: 'from-teal-800 to-emerald-600',    emoji: '🌱' },
  'Roots & Rhizomes':       { gradient: 'from-orange-800 to-amber-600',    emoji: '🫚' },
  'Mushrooms & Fungi':      { gradient: 'from-stone-700 to-stone-500',     emoji: '🍄' },
  'Dried Fruits & Berries': { gradient: 'from-purple-800 to-violet-600',   emoji: '🍇' },
};

const STOCK_BADGE: Record<string, { label: string; cls: string }> = {
  in_stock:     { label: 'In Stock',     cls: 'bg-emerald-100 text-emerald-700' },
  low_stock:    { label: 'Low Stock',    cls: 'bg-amber-100 text-amber-700' },
  out_of_stock: { label: 'Out of Stock', cls: 'bg-red-100 text-red-600' },
};

export default function Home() {
  const navigate = useNavigate();
  const skus = (skusData as SKU[]).filter(s => !s.archived);
  const featured = skus.filter(s => s.stockStatus === 'in_stock').slice(0, 4);
  const categories = categoriesData.filter(c => c.active);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#052e16 0%,#0a3d1f 40%,#0d5c2a 70%,#0e6930 100%)' }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #4ade80 0%, transparent 50%), radial-gradient(circle at 75% 20%, #fbbf24 0%, transparent 40%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '24px 24px' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Text */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              India's Premier NTFP B2B Marketplace
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Source India's Finest<br />
              <span className="text-emerald-300">Forest Produce</span><br />
              Direct from Source
            </h1>
            <p className="mt-5 text-emerald-100/70 text-base leading-relaxed">
              FRA-compliant NTFPs from tribal communities across Northeast India,
              West Bengal, Jharkhand, Odisha &amp; Bihar. Transparent pricing,
              verified origin, wholesale quantities.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => navigate('/catalogue')}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-900/30"
              >
                Browse Catalogue
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-colors border border-white/20"
              >
                Register as Buyer
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/10">
              {[
                { value: '12+', label: 'NTFP Products' },
                { value: '9',   label: 'Source States' },
                { value: '50+', label: 'GSTIN Buyers' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-emerald-300">{s.value}</div>
                  <div className="text-xs text-emerald-100/50 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Floating product cards */}
          <div className="hidden lg:grid grid-cols-2 gap-3 w-80 shrink-0">
            {featured.slice(0, 4).map((sku, i) => {
              const style = CAT_STYLE[sku.category] ?? { gradient: 'from-emerald-800 to-emerald-600', emoji: '🌿' };
              return (
                <Link
                  key={sku.id}
                  to={`/catalogue/${sku.id}`}
                  className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all hover:scale-105 cursor-pointer ${i === 0 ? 'col-span-2' : ''}`}
                >
                  <div className={`bg-gradient-to-br ${style.gradient} ${i === 0 ? 'h-20' : 'h-16'} flex items-center justify-center text-3xl`}>
                    {style.emoji}
                  </div>
                  <div className="p-3">
                    <div className="text-white text-xs font-semibold line-clamp-1">{sku.displayName}</div>
                    <div className="text-emerald-300 text-sm font-bold mt-1">₹{sku.price.toLocaleString('en-IN')}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
            {[
              { icon: Shield, label: 'FRA Compliant Sourcing' },
              { icon: Users, label: 'Tribal Community Sourced' },
              { icon: Leaf, label: 'Verified Natural Origin' },
              { icon: TrendingUp, label: 'Transparent Pricing' },
              { icon: Package, label: 'Wholesale Quantities' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-stone-600">
                <Icon size={15} className="text-emerald-600 shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by Category ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-1">What We Offer</div>
            <h2 className="text-2xl font-bold text-stone-800">Browse by Category</h2>
          </div>
          <Link to="/catalogue" className="hidden sm:flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800 font-medium">
            View all <ChevronRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(cat => {
            const style = CAT_STYLE[cat.name] ?? { gradient: 'from-emerald-800 to-emerald-600', emoji: '🌿' };
            return (
              <Link
                key={cat.id}
                to={`/catalogue?cat=${encodeURIComponent(cat.name)}`}
                className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all"
              >
                <div className={`bg-gradient-to-br ${style.gradient} h-24 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform`}>
                  {style.emoji}
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-stone-800 leading-snug">{cat.name}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{cat.skuCount} product{cat.skuCount !== 1 ? 's' : ''}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────── */}
      <section className="bg-stone-100 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-1">Handpicked</div>
              <h2 className="text-2xl font-bold text-stone-800">Featured Products</h2>
            </div>
            <Link to="/catalogue" className="hidden sm:flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800 font-medium">
              All products <ChevronRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map(sku => {
              const style = CAT_STYLE[sku.category] ?? { gradient: 'from-emerald-800 to-emerald-600', emoji: '🌿' };
              const stock = STOCK_BADGE[sku.stockStatus];
              return (
                <Link
                  key={sku.id}
                  to={`/catalogue/${sku.id}`}
                  className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all"
                >
                  <div className={`relative bg-gradient-to-br ${style.gradient} h-44 flex items-center justify-center text-6xl`}>
                    {style.emoji}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${stock.cls}`}>
                      {stock.label}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">{sku.category}</div>
                    <h3 className="font-semibold text-stone-800 mt-1 text-sm leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
                      {sku.displayName}
                    </h3>
                    <div className="text-xs text-stone-400 mt-1">📍 {sku.sourceState}</div>
                    <div className="flex items-end justify-between mt-3 pt-3 border-t border-stone-100">
                      <div>
                        <span className="text-lg font-bold text-stone-800">₹{sku.price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-stone-400 ml-1">/ {sku.unit}</span>
                      </div>
                      <span className="text-xs text-stone-400">MOQ {sku.moq}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-1">Simple Process</div>
          <h2 className="text-2xl font-bold text-stone-800">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Register',        desc: 'Create your buyer account with GSTIN and business details.',   icon: '📝' },
            { step: '02', title: 'Browse & Enquire', desc: 'Explore verified NTFP catalogue. Submit product enquiries.',    icon: '🔍' },
            { step: '03', title: 'Place Order',      desc: 'Place order with quantity and delivery preferences.',           icon: '🛒' },
            { step: '04', title: 'Pay & Receive',    desc: 'Upload payment proof, track delivery status in real time.',     icon: '🚚' },
          ].map((item, i) => (
            <div key={item.step} className="relative">
              {i < 3 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-stone-200 -translate-y-1/2 z-0" style={{ width: 'calc(100% - 32px)', left: '50%' }} />
              )}
              <div className="relative bg-white border border-stone-200 rounded-2xl p-6 text-center hover:shadow-md hover:border-emerald-200 transition-all">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-xs font-bold text-emerald-600 tracking-widest mb-1">STEP {item.step}</div>
                <div className="font-bold text-stone-800 mb-2">{item.title}</div>
                <div className="text-sm text-stone-500 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#052e16,#14532d)' }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #4ade80 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Ready to source India's finest NTFP?
          </h2>
          <p className="text-emerald-100/70 mt-3 text-base leading-relaxed">
            Join 50+ verified wholesale buyers sourcing directly from tribal forest communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-sm transition-colors shadow-lg"
            >
              Register as Buyer
            </button>
            <button
              onClick={() => navigate('/catalogue')}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-colors border border-white/20"
            >
              Browse Catalogue First
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
