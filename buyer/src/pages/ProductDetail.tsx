import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ChevronRight, MapPin, ShoppingCart, MessageSquare,
  CheckCircle, AlertTriangle, XCircle,
  Leaf, X, Star, Minus, Plus, LogIn,
} from 'lucide-react';
import type { BuyerAuth, SKU, EnquiryCategory } from '../types';
import skusData from '../data/skus.json';

interface Props { user: BuyerAuth | null; }

const CAT_STYLE: Record<string, { gradient: string; emoji: string }> = {
  'Forest Botanicals':      { gradient: 'from-emerald-800 via-emerald-700 to-emerald-600', emoji: '🌿' },
  'Seeds & Nuts':           { gradient: 'from-amber-800 via-amber-700 to-amber-600',       emoji: '🌰' },
  'Flowers & Buds':         { gradient: 'from-rose-800 via-rose-700 to-pink-600',          emoji: '🌸' },
  'Honey & Bee Products':   { gradient: 'from-amber-700 via-yellow-600 to-yellow-500',     emoji: '🍯' },
  'Bamboo Products':        { gradient: 'from-lime-800 via-lime-700 to-green-600',         emoji: '🎋' },
  'Medicinal Herbs':        { gradient: 'from-teal-800 via-teal-700 to-emerald-600',       emoji: '🌱' },
  'Roots & Rhizomes':       { gradient: 'from-orange-800 via-orange-700 to-amber-600',     emoji: '🫚' },
  'Mushrooms & Fungi':      { gradient: 'from-stone-700 via-stone-600 to-stone-500',       emoji: '🍄' },
  'Dried Fruits & Berries': { gradient: 'from-purple-800 via-purple-700 to-violet-600',    emoji: '🍇' },
};

const STOCK_CONFIG: Record<string, { label: string; cls: string; icon: any; border: string }> = {
  in_stock:     { label: 'In Stock',     cls: 'text-emerald-700 bg-emerald-50',  icon: CheckCircle,    border: 'border-emerald-200' },
  low_stock:    { label: 'Low Stock',    cls: 'text-amber-700  bg-amber-50',     icon: AlertTriangle,  border: 'border-amber-200' },
  out_of_stock: { label: 'Out of Stock', cls: 'text-red-600    bg-red-50',       icon: XCircle,        border: 'border-red-200' },
};

const ENQUIRY_CATS: { value: EnquiryCategory; label: string }[] = [
  { value: 'pricing',      label: 'Pricing & Rates' },
  { value: 'product_info', label: 'Product Information' },
  { value: 'compliance',   label: 'Compliance & Certificates' },
  { value: 'logistics',    label: 'Logistics & Delivery' },
  { value: 'partnership',  label: 'Partnership / Bulk Deal' },
];

export default function ProductDetail({ user }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showEnquiry, setShowEnquiry] = useState(false);
  const [orderTab, setOrderTab]       = useState(searchParams.get('action') === 'order');
  const [qty, setQty]                 = useState(0);
  const [notes, setNotes]             = useState('');
  const [orderDone, setOrderDone]     = useState(false);
  const [enqDone, setEnqDone]         = useState(false);

  const [enqName,     setEnqName]     = useState(user?.name ?? '');
  const [enqBiz,      setEnqBiz]      = useState(user?.businessName ?? '');
  const [enqGstin,    setEnqGstin]    = useState(user?.gstin ?? '');
  const [enqEmail,    setEnqEmail]    = useState(user?.email ?? '');
  const [enqPhone,    setEnqPhone]    = useState('');
  const [enqCat,      setEnqCat]      = useState<EnquiryCategory>('product_info');
  const [enqMsg,      setEnqMsg]      = useState('');

  const sku = (skusData as SKU[]).find(s => s.id === id);

  useEffect(() => {
    if (sku) setQty(sku.moq);
  }, [sku]);

  useEffect(() => {
    if (user) { setEnqName(user.name); setEnqBiz(user.businessName); setEnqGstin(user.gstin); setEnqEmail(user.email); }
  }, [user]);

  if (!sku) return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-stone-500">
      Product not found.{' '}
      <Link to="/catalogue" className="text-emerald-700 underline">Back to catalogue</Link>
    </div>
  );

  const style   = CAT_STYLE[sku.category] ?? { gradient: 'from-emerald-800 to-emerald-600', emoji: '🌿' };
  const stock   = STOCK_CONFIG[sku.stockStatus];
  const StIcon  = stock.icon;
  const total   = qty * sku.price;

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-1.5 text-sm text-stone-500 flex-wrap">
          <Link to="/" className="hover:text-emerald-700 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/catalogue" className="hover:text-emerald-700 transition-colors">Catalogue</Link>
          <ChevronRight size={14} />
          <Link to={`/catalogue?cat=${encodeURIComponent(sku.category)}`} className="hover:text-emerald-700 transition-colors">{sku.category}</Link>
          <ChevronRight size={14} />
          <span className="text-stone-800 font-medium truncate max-w-[200px]">{sku.displayName}</span>
        </div>
      </div>

      {/* Success banners */}
      {(orderDone || enqDone) && (
        <div className="max-w-7xl mx-auto px-6 pt-5">
          {orderDone && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-3">
              <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-emerald-800">Order Placed Successfully!</div>
                <div className="text-sm text-emerald-700 mt-0.5">
                  Your order has been submitted. Upload payment proof to confirm.{' '}
                  <Link to="/orders" className="underline font-medium">Go to Orders →</Link>
                </div>
              </div>
            </div>
          )}
          {enqDone && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-3">
              <MessageSquare size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-800">Enquiry Submitted</div>
                <div className="text-sm text-blue-700 mt-0.5">BPSV team will respond within 1–2 business days.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: Image (2/5) */}
          <div className="lg:col-span-2">
            <div className={`bg-gradient-to-br ${style.gradient} rounded-3xl aspect-square flex items-center justify-center shadow-xl`}>
              <span className="text-[120px] leading-none select-none">{style.emoji}</span>
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs text-stone-600 flex items-center gap-1.5">
                <Leaf size={11} className="text-emerald-600" /> FRA Compliant
              </span>
              <span className="px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs text-stone-600 flex items-center gap-1.5">
                <Star size={11} className="text-amber-500" /> Verified Quality
              </span>
              <span className="px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs text-stone-600 flex items-center gap-1.5">
                <MapPin size={11} className="text-emerald-600" /> Tribal Sourced
              </span>
            </div>
          </div>

          {/* Right: Details (3/5) */}
          <div className="lg:col-span-3 space-y-5">
            {/* Title block */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Link to={`/catalogue?cat=${encodeURIComponent(sku.category)}`}
                  className="text-xs font-bold text-emerald-700 uppercase tracking-widest hover:underline">
                  {sku.category}
                </Link>
                <span className="text-stone-300">·</span>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${stock.cls} ${stock.border}`}>
                  <StIcon size={11} />
                  {stock.label}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-stone-800 leading-snug">{sku.displayName}</h1>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-stone-500">
                <MapPin size={14} className="text-emerald-600 shrink-0" />
                {sku.sourceState}{sku.sourceDistrict ? ` · ${sku.sourceDistrict}` : ''}
              </div>
              <div className="text-[10px] text-stone-400 mt-1 font-mono">{sku.name}</div>
            </div>

            {/* Price card */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-bold text-stone-800">₹{sku.price.toLocaleString('en-IN')}</span>
                <span className="text-stone-400 text-sm pb-1.5">per {sku.unit}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Min. Order', value: `${sku.moq} ${sku.unit}` },
                  { label: 'Batch Size', value: `${sku.batchSize.toLocaleString()} ${sku.unit}` },
                  { label: 'Unit', value: sku.unit },
                ].map(s => (
                  <div key={s.label} className="bg-stone-50 rounded-xl py-2.5 px-2">
                    <div className="text-[10px] text-stone-400 uppercase tracking-wide">{s.label}</div>
                    <div className="font-semibold text-stone-700 text-sm mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order / Auth section */}
            {!user ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-emerald-800">Sign in to place orders</div>
                  <div className="text-sm text-emerald-700/70 mt-0.5">Join 50+ verified buyers on VanOS</div>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-colors shrink-0"
                >
                  <LogIn size={15} />
                  Sign In
                </button>
              </div>
            ) : sku.stockStatus === 'out_of_stock' ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                <XCircle size={18} className="text-red-500 shrink-0" />
                <div className="text-sm text-red-700">This product is currently out of stock. Submit an enquiry to be notified.</div>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                <div className="flex border-b border-stone-200">
                  <button
                    onClick={() => setOrderTab(false)}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${!orderTab ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:bg-stone-50'}`}
                  >
                    Product Info
                  </button>
                  <button
                    onClick={() => setOrderTab(true)}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${orderTab ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:bg-stone-50'}`}
                  >
                    <ShoppingCart size={14} />
                    Place Order
                  </button>
                </div>

                {orderTab ? (
                  <form
                    onSubmit={e => { e.preventDefault(); setOrderDone(true); setOrderTab(false); }}
                    className="p-5 space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wide">
                        Quantity ({sku.unit}) — Min: {sku.moq}
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQty(q => Math.max(sku.moq, q - sku.moq))}
                          className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          min={sku.moq}
                          value={qty}
                          onChange={e => setQty(Math.max(sku.moq, parseInt(e.target.value) || sku.moq))}
                          className="flex-1 text-center text-lg font-bold border border-stone-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setQty(q => q + sku.moq)}
                          className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                      <span className="text-sm text-emerald-700 font-medium">Estimated Total</span>
                      <span className="text-2xl font-bold text-emerald-800">₹{total.toLocaleString('en-IN')}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wide">Special Instructions</label>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Delivery preferences, quality requirements, packaging notes…"
                        className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      />
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 text-xs text-amber-700">
                      ⚡ After placing your order, upload advance payment screenshot to confirm dispatch.
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-colors"
                    >
                      <ShoppingCart size={16} />
                      Place Order — ₹{total.toLocaleString('en-IN')}
                    </button>
                  </form>
                ) : (
                  <div className="p-5">
                    <p className="text-sm text-stone-600 leading-relaxed line-clamp-3">{sku.description}</p>
                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <div className="bg-stone-50 rounded-xl p-3">
                        <div className="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">Source State</div>
                        <div className="font-medium text-stone-700">{sku.sourceState}</div>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-3">
                        <div className="text-[10px] text-stone-400 uppercase tracking-wide mb-0.5">Updated</div>
                        <div className="font-medium text-stone-700">{new Date(sku.updatedAt).toLocaleDateString('en-IN')}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enquiry button */}
            <button
              onClick={() => setShowEnquiry(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-stone-300 hover:border-emerald-400 text-stone-600 hover:text-emerald-700 text-sm font-semibold rounded-2xl transition-colors"
            >
              <MessageSquare size={16} />
              Submit Product Enquiry
            </button>
          </div>
        </div>

        {/* Full Description */}
        <div className="mt-10 bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="flex border-b border-stone-200">
            <div className="px-6 py-4 border-b-2 border-emerald-700 font-semibold text-emerald-700 text-sm">
              Product Description
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <p className="text-stone-600 leading-relaxed">{sku.description}</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'SKU Code',       value: sku.name },
                { label: 'Category',       value: sku.category },
                { label: 'Source State',   value: sku.sourceState },
                { label: 'Source District',value: sku.sourceDistrict ?? 'N/A' },
                { label: 'Unit',           value: sku.unit },
                { label: 'Batch Size',     value: `${sku.batchSize.toLocaleString()} ${sku.unit}` },
                { label: 'Price',          value: `₹${sku.price.toLocaleString('en-IN')} / ${sku.unit}` },
                { label: 'Min. Order',     value: `${sku.moq} ${sku.unit}` },
                { label: 'Last Updated',   value: new Date(sku.updatedAt).toLocaleDateString('en-IN') },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-2 py-2 border-b border-stone-100 last:border-0">
                  <span className="text-xs text-stone-400 font-medium uppercase tracking-wide shrink-0">{row.label}</span>
                  <span className="text-sm text-stone-700 font-medium text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {showEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
              <div>
                <h2 className="font-bold text-stone-800 text-lg">Submit Enquiry</h2>
                <p className="text-xs text-stone-400 mt-0.5">{sku.displayName}</p>
              </div>
              <button onClick={() => setShowEnquiry(false)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={e => { e.preventDefault(); setEnqDone(true); setShowEnquiry(false); }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">Your Name *</label>
                  <input value={enqName} onChange={e => setEnqName(e.target.value)} required
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">Business Name *</label>
                  <input value={enqBiz} onChange={e => setEnqBiz(e.target.value)} required
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">Email *</label>
                  <input type="email" value={enqEmail} onChange={e => setEnqEmail(e.target.value)} required
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">Phone *</label>
                  <input type="tel" value={enqPhone} onChange={e => setEnqPhone(e.target.value)} required placeholder="+91 XXXXX XXXXX"
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">GSTIN</label>
                <input value={enqGstin} onChange={e => setEnqGstin(e.target.value)} placeholder="22AAAAA0000A1Z5"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Enquiry Type *</label>
                <select value={enqCat} onChange={e => setEnqCat(e.target.value as EnquiryCategory)}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {ENQUIRY_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Message *</label>
                <textarea value={enqMsg} onChange={e => setEnqMsg(e.target.value)} required rows={4}
                  placeholder="Describe your requirement, question, or concern…"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowEnquiry(false)}
                  className="px-5 py-2.5 border border-stone-200 text-stone-600 text-sm rounded-xl hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition-colors">
                  Submit Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
