import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, ArrowRight, Upload, ChevronRight,
  CheckCircle, Package, Truck, XCircle, AlertTriangle,
} from 'lucide-react';
import type { BuyerAuth, Order } from '../types';
import ordersData from '../data/orders.json';

interface Props { user: BuyerAuth; }

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: any }> = {
  pending_payment: { label: 'Pending Payment', cls: 'bg-amber-100 text-amber-700 border-amber-200',    icon: AlertTriangle },
  confirmed:       { label: 'Confirmed',        cls: 'bg-blue-100 text-blue-700 border-blue-200',       icon: CheckCircle },
  packed:          { label: 'Packed',           cls: 'bg-purple-100 text-purple-700 border-purple-200', icon: Package },
  delivered:       { label: 'Delivered',        cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Truck },
  rejected:        { label: 'Rejected',         cls: 'bg-red-100 text-red-600 border-red-200',          icon: XCircle },
};

const PAYMENT_CLS: Record<string, string> = {
  paid:                 'text-emerald-600 bg-emerald-50',
  unpaid:               'text-red-500 bg-red-50',
  pending_verification: 'text-amber-600 bg-amber-50',
};

const PAYMENT_LBL: Record<string, string> = {
  paid: 'Paid', unpaid: 'Unpaid', pending_verification: 'Verifying',
};

const TABS = [
  { value: 'all',          label: 'All' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'confirmed',    label: 'Confirmed' },
  { value: 'packed',       label: 'Packed' },
  { value: 'delivered',    label: 'Delivered' },
  { value: 'rejected',     label: 'Rejected' },
];

const STEPS = ['placed', 'confirmed', 'packed', 'delivered'];

export default function Orders({ user }: Props) {
  const [tab, setTab] = useState('all');
  const myOrders = (ordersData as any[]).filter(o => o.buyerId === user.id) as Order[];
  const filtered = tab === 'all' ? myOrders : myOrders.filter(o => o.status === tab);

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-3">
            <Link to="/" className="hover:text-emerald-700">Home</Link>
            <ChevronRight size={14} />
            <span className="text-stone-800 font-medium">My Orders</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-800">My Orders</h1>
          <p className="text-stone-500 text-sm mt-1">{myOrders.length} total orders</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 bg-white border border-stone-200 rounded-2xl p-1">
          {TABS.map(t => {
            const count = t.value === 'all' ? myOrders.length : myOrders.filter(o => o.status === t.value).length;
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  tab === t.value
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {t.label}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    tab === t.value ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-500'
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 py-20 text-center">
            <ShoppingCart size={48} className="mx-auto mb-4 text-stone-300" />
            <p className="font-semibold text-stone-600 text-lg">No orders here</p>
            <Link to="/catalogue" className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline font-medium">
              Browse catalogue <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status];
              const Icon = cfg.icon;
              const stepIdx = STEPS.indexOf(order.status === 'pending_payment' ? 'placed' : order.status);
              const showProgress = ['confirmed', 'packed', 'delivered'].includes(order.status);

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Header row */}
                  <div className="flex items-center justify-between px-5 py-3 bg-stone-50 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-stone-600 font-medium">{order.id}</span>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs text-stone-400">
                        {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.cls}`}>
                      <Icon size={11} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-600 flex items-center justify-center text-2xl shrink-0">
                        🌿
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-stone-800 leading-snug">{order.skuName}</h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-sm text-stone-500">{order.quantity} {order.unit}</span>
                          <span className="text-stone-300">·</span>
                          <span className="text-sm font-bold text-stone-800">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PAYMENT_CLS[order.paymentStatus]}`}>
                            {PAYMENT_LBL[order.paymentStatus]}
                          </span>
                        </div>
                        {order.deliveryDate && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-stone-400">
                            <Truck size={11} />
                            Delivery: {new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {order.paymentStatus === 'unpaid' && (
                          <Link to={`/orders/${order.id}`}
                            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors">
                            <Upload size={12} />
                            Pay Now
                          </Link>
                        )}
                        <Link to={`/orders/${order.id}`}
                          className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-medium rounded-xl transition-colors">
                          View <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {showProgress && (
                      <div className="mt-4 pt-4 border-t border-stone-100">
                        <div className="flex items-center gap-0">
                          {STEPS.map((step, i) => {
                            const done = i <= stepIdx;
                            const active = i === stepIdx;
                            return (
                              <div key={step} className="flex-1 flex items-center">
                                <div className={`w-3 h-3 rounded-full shrink-0 border-2 transition-all ${
                                  active ? 'bg-emerald-600 border-emerald-600 ring-4 ring-emerald-100' :
                                  done ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-stone-300'
                                }`} />
                                {i < STEPS.length - 1 && (
                                  <div className={`flex-1 h-0.5 ${i < stepIdx ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-1.5">
                          {['Order Placed', 'Confirmed', 'Packed', 'Delivered'].map((l, i) => (
                            <span key={l} className={`text-[9px] font-medium ${i <= stepIdx ? 'text-emerald-600' : 'text-stone-400'}`}>{l}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
