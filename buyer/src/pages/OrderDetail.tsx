import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight, Upload, CheckCircle, Clock, Package, Truck,
  XCircle, FileImage, AlertTriangle, Check, CreditCard,
} from 'lucide-react';
import type { Order } from '../types';
import ordersData from '../data/orders.json';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: 'Pending Payment', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmed:       { label: 'Confirmed',        cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  packed:          { label: 'Packed',           cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  delivered:       { label: 'Delivered',        cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected:        { label: 'Rejected',         cls: 'bg-red-100 text-red-600 border-red-200' },
};

const TIMELINE_ICONS: Record<string, any> = {
  placed: Clock, pending_payment: AlertTriangle, confirmed: CheckCircle,
  packed: Package, delivered: Truck, rejected: XCircle, system: Clock,
};

export default function OrderDetail() {
  const { id } = useParams();
  const order = (ordersData as any[]).find(o => o.id === id) as Order | undefined;

  const [advFile, setAdvFile] = useState<File | null>(null);
  const [fullFile, setFullFile] = useState<File | null>(null);
  const [utr, setUtr]         = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!order) return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-stone-500">
      Order not found. <Link to="/orders" className="text-emerald-700 underline">Back to orders</Link>
    </div>
  );

  const cfg = STATUS_CONFIG[order.status];

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-3">
            <Link to="/" className="hover:text-emerald-700">Home</Link>
            <ChevronRight size={14} />
            <Link to="/orders" className="hover:text-emerald-700">My Orders</Link>
            <ChevronRight size={14} />
            <span className="text-stone-800 font-medium">{order.id}</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-xl font-bold text-stone-800">{order.id}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cfg.cls}`}>{cfg.label}</span>
          </div>
          <p className="text-stone-500 text-sm mt-1">
            Placed on {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Product card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-600 flex items-center justify-center text-3xl shrink-0">
                🌿
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-stone-800 text-lg leading-snug">{order.skuName}</h2>
                <div className="text-xs font-mono text-stone-400 mt-0.5">{order.sku}</div>
                <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                  <span className="text-stone-600">{order.quantity} {order.unit}</span>
                  <span className="text-stone-300">·</span>
                  <span className="font-bold text-stone-800 text-base">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="mt-4 pt-4 border-t border-stone-100 text-sm text-stone-500">
                <span className="font-medium text-stone-600">Notes: </span>{order.notes}
              </div>
            )}
            {order.rejectionReason && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <span className="font-semibold">Rejection Reason: </span>{order.rejectionReason}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="font-bold text-stone-800 mb-5 flex items-center gap-2">
              <Clock size={16} className="text-stone-400" /> Order Timeline
            </h2>
            <div className="space-y-1">
              {order.statusHistory.map((item, i) => {
                const Icon = TIMELINE_ICONS[item.status] ?? Clock;
                const isLast = i === order.statusHistory.length - 1;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isLast ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200' : 'bg-stone-100 text-stone-500'
                      }`}>
                        <Icon size={16} />
                      </div>
                      {i < order.statusHistory.length - 1 && (
                        <div className="w-0.5 flex-1 bg-stone-100 my-1 min-h-[20px]" />
                      )}
                    </div>
                    <div className={`pb-4 ${isLast ? '' : ''}`}>
                      <div className={`font-semibold text-sm capitalize ${isLast ? 'text-emerald-700' : 'text-stone-700'}`}>
                        {item.status.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        {new Date(item.timestamp).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                        {' · by '}<span className="capitalize">{item.by}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Upload */}
          {order.paymentStatus === 'unpaid' && !submitted && (
            <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden">
              <div className="bg-amber-50 px-6 py-4 border-b border-amber-200 flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Upload size={18} className="text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-amber-800">Upload Payment Proof</div>
                  <div className="text-xs text-amber-600/80">Required to confirm your order</div>
                </div>
              </div>

              <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="p-6 space-y-5">
                {[
                  { label: 'Advance Payment Screenshot', req: true, state: advFile, set: setAdvFile },
                  { label: 'Full Payment Screenshot', req: false, state: fullFile, set: setFullFile },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wide">
                      {f.label} {f.req && '*'}
                    </label>
                    <label className={`flex items-center gap-4 px-5 py-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                      f.state ? 'border-emerald-400 bg-emerald-50' : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                    }`}>
                      {f.state ? (
                        <>
                          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                            <CheckCircle size={20} className="text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-emerald-800 text-sm">{f.state.name}</div>
                            <div className="text-xs text-emerald-600">{(f.state.size / 1024).toFixed(0)} KB · Click to change</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center shrink-0">
                            <FileImage size={20} className="text-stone-400" />
                          </div>
                          <div>
                            <div className="font-medium text-stone-600 text-sm">Click to upload screenshot</div>
                            <div className="text-xs text-stone-400 mt-0.5">JPG, PNG or PDF — max 5MB</div>
                          </div>
                        </>
                      )}
                      <input type="file" accept="image/*,.pdf" className="hidden"
                        required={f.req}
                        onChange={e => f.set(e.target.files?.[0] ?? null)} />
                    </label>
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wide">UTR / Transaction Reference *</label>
                  <input
                    value={utr} onChange={e => setUtr(e.target.value)} required
                    placeholder="e.g. UTRNEFT202401120001"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wide">Payment Notes</label>
                  <textarea value={payNotes} onChange={e => setPayNotes(e.target.value)} rows={2}
                    placeholder="Bank name, transfer date, etc."
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                </div>

                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">
                  <Upload size={16} />
                  Submit Payment Proof
                </button>
              </form>
            </div>
          )}

          {submitted && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <Check size={22} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-emerald-800 text-lg">Payment Proof Submitted!</div>
                <div className="text-sm text-emerald-700 mt-1 leading-relaxed">
                  UTR <span className="font-mono font-semibold">{utr}</span> recorded.
                  BPSV will verify and confirm your order within 24 hours.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h3 className="font-bold text-stone-700 text-sm mb-4">Order Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Order ID',    value: order.id, mono: true },
                { label: 'Date',        value: new Date(order.date).toLocaleDateString('en-IN') },
                { label: 'Quantity',    value: `${order.quantity} ${order.unit}` },
                { label: 'Total',       value: `₹${order.totalAmount.toLocaleString('en-IN')}`, bold: true },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-stone-400">{row.label}</span>
                  <span className={`text-xs text-right ${row.bold ? 'font-bold text-stone-800 text-sm' : row.mono ? 'font-mono text-stone-700' : 'text-stone-700 font-medium'}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment status */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h3 className="font-bold text-stone-700 text-sm mb-4 flex items-center gap-2">
              <CreditCard size={15} className="text-stone-400" />
              Payment Status
            </h3>
            {order.paymentStatus === 'paid' ? (
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold text-emerald-800 text-sm">Payment Verified</div>
                  {order.utr && <div className="text-xs text-stone-400 font-mono mt-0.5">{order.utr}</div>}
                </div>
              </div>
            ) : order.paymentStatus === 'pending_verification' ? (
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-amber-500 shrink-0" />
                <div>
                  <div className="font-semibold text-amber-700 text-sm">Under Verification</div>
                  {order.utr && <div className="text-xs text-stone-400 font-mono mt-0.5">{order.utr}</div>}
                  <div className="text-xs text-stone-400 mt-0.5">Within 24 hours</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-500 shrink-0" />
                <div>
                  <div className="font-semibold text-red-700 text-sm">Payment Pending</div>
                  <div className="text-xs text-stone-400 mt-0.5">Upload proof to confirm</div>
                </div>
              </div>
            )}
          </div>

          {/* Delivery */}
          {order.deliveryDate && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-700 text-sm mb-3 flex items-center gap-2">
                <Truck size={15} className="text-stone-400" />
                Delivery Info
              </h3>
              <div className="text-sm">
                <div className="text-stone-400 text-xs mb-1">Expected Delivery</div>
                <div className="font-semibold text-stone-800">
                  {new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
