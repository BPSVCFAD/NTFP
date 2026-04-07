import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, CreditCard, FileUp, MessageSquare,
  AlertTriangle, TrendingUp, Package, Users, MapPin,
  ArrowUpRight, Clock, Leaf, CheckCircle2, AlertCircle,
} from 'lucide-react';
import Header from '../components/Layout/Header';
import type { Order } from '../types';
import ordersRaw    from '../data/orders.json';
import enquiriesRaw from '../data/enquiries.json';
import usersRaw     from '../data/users.json';

const orders = ordersRaw as Order[];
const TODAY  = new Date('2024-01-17');

// ── colour helpers ────────────────────────────────────────────────────────────
function kpiStyle(count: number) {
  if (count === 0) return {
    wrap: 'bg-white border-emerald-100',
    iconWrap: 'bg-emerald-50',
    icon: 'text-emerald-600',
    num: 'text-emerald-700',
    badge: 'bg-emerald-500',
    bar: 'bg-emerald-400',
    label: 'text-stone-600',
  };
  if (count <= 5) return {
    wrap: 'bg-white border-amber-100',
    iconWrap: 'bg-amber-50',
    icon: 'text-amber-600',
    num: 'text-amber-700',
    badge: 'bg-amber-500',
    bar: 'bg-amber-400',
    label: 'text-stone-600',
  };
  return {
    wrap: 'bg-white border-red-100',
    iconWrap: 'bg-red-50',
    icon: 'text-red-600',
    num: 'text-red-700',
    badge: 'bg-red-500',
    bar: 'bg-red-400',
    label: 'text-stone-600',
  };
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: 'Pending Payment', cls: 'bg-amber-100 text-amber-800' },
  confirmed:       { label: 'Confirmed',        cls: 'bg-blue-100 text-blue-800' },
  packed:          { label: 'Packed',            cls: 'bg-violet-100 text-violet-800' },
  delivered:       { label: 'Delivered',         cls: 'bg-emerald-100 text-emerald-800' },
  rejected:        { label: 'Rejected',          cls: 'bg-red-100 text-red-800' },
};

const SOURCE_REGIONS = [
  { region: 'Northeast India', count: 6, color: '#10b981' },
  { region: 'Odisha',          count: 5, color: '#6366f1' },
  { region: 'Jharkhand',       count: 4, color: '#f59e0b' },
  { region: 'West Bengal',     count: 3, color: '#14b8a6' },
  { region: 'Bihar',           count: 1, color: '#f97316' },
];
const MAX_REGION = Math.max(...SOURCE_REGIONS.map(r => r.count));

// ── sub-components ────────────────────────────────────────────────────────────
interface KPIProps {
  title: string; count: number; icon: React.ElementType;
  hint: string; onClick: () => void;
}
function KPICard({ title, count, icon: Icon, hint, onClick }: KPIProps) {
  const s = kpiStyle(count);
  return (
    <button
      onClick={onClick}
      className={`${s.wrap} border rounded-2xl p-5 text-left w-full hover:shadow-md active:scale-[.98] transition-all duration-150 group`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${s.iconWrap} w-10 h-10 rounded-xl flex items-center justify-center`}>
          <Icon size={18} className={s.icon} />
        </div>
        <span className={`${s.badge} text-white text-xs font-bold px-2.5 py-0.5 rounded-full tabular-nums`}>
          {count}
        </span>
      </div>
      <div className={`text-3xl font-extrabold ${s.num} leading-none mb-2 tabular-nums`}>{count}</div>
      <div className="text-xs font-semibold text-stone-700 mb-0.5">{title}</div>
      <div className="text-[11px] text-stone-400 group-hover:text-stone-500 transition-colors">{hint}</div>
      {/* bottom accent bar */}
      <div className={`mt-4 h-0.5 rounded-full ${count === 0 ? 'bg-stone-100' : s.bar} opacity-60`} />
    </button>
  );
}

interface MetricProps { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string; }
function MetricCard({ label, value, sub, icon: Icon, color }: MetricProps) {
  return (
    <div className="bg-white border border-stone-100 rounded-2xl px-5 py-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold text-stone-800 tabular-nums leading-none">{value}</div>
        <div className="text-xs text-stone-500 mt-0.5 truncate">{label}</div>
        {sub && <div className="text-[10px] text-stone-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  const activeOrders      = orders.filter(o => !['delivered','rejected'].includes(o.status)).length;
  const pendingPayment    = orders.filter(o => o.paymentStatus === 'pending_verification').length;
  const pendingChallan    = orders.filter(o => o.status === 'packed' && !o.challanUploaded).length;
  const openEnquiries     = (enquiriesRaw as { status: string }[]).filter(e => e.status === 'open').length;
  const overdueDeliveries = orders.filter(o =>
    o.deliveryDate && !['delivered','rejected'].includes(o.status) && new Date(o.deliveryDate) < TODAY
  ).length;

  const totalRevenue  = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);
  const activeUsers   = (usersRaw as { status: string }[]).filter(u => u.status === 'active').length;
  const recentOrders  = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  const allClear = [activeOrders, pendingPayment, pendingChallan, openEnquiries, overdueDeliveries].every(n => n === 0);
  const criticalCount = [pendingPayment, overdueDeliveries].reduce((s, n) => s + n, 0);

  const dateStr = TODAY.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full min-h-0">
      <Header title="Dashboard" subtitle="NTFP Supply Chain · BPSV" />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">

        {/* ── Welcome banner ──────────────────────────────────────────── */}
        <div
          className="relative px-8 py-6 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 60%, #166534 100%)' }}
        >
          {/* decorative blobs */}
          <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at right, #4ade80, transparent)' }} />
          <div className="absolute right-32 bottom-0 w-32 h-32 opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #d97706, transparent)' }} />

          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Leaf size={14} className="text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">
                  Admin · VanOS
                </span>
              </div>
              <h2 className="text-white text-2xl font-bold leading-tight">Good morning 👋</h2>
              <p className="text-emerald-200/70 text-sm mt-1">{dateStr}</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {allClear ? (
                <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-sm px-4 py-2 rounded-xl">
                  <CheckCircle2 size={15} /> All clear — no urgent actions
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-200 text-sm px-4 py-2 rounded-xl">
                  <AlertCircle size={15} /> {criticalCount} item{criticalCount !== 1 ? 's' : ''} need immediate attention
                </div>
              )}

              {/* Mini metrics */}
              {[
                { label: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L` },
                { label: 'Orders', value: orders.length },
                { label: 'Buyers', value: activeUsers },
              ].map(m => (
                <div key={m.label} className="bg-white/10 border border-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl text-center min-w-[72px]">
                  <div className="text-white font-bold text-lg leading-none">{m.value}</div>
                  <div className="text-emerald-300/70 text-[10px] mt-0.5 font-medium uppercase tracking-wide">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="px-8 py-6 space-y-6">

          {/* KPI tiles */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Needs Attention</p>
              <button onClick={() => navigate('/orders')} className="text-xs text-emerald-700 font-semibold hover:text-emerald-900 flex items-center gap-1">
                All orders <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-4">
              <KPICard title="Active Orders"      count={activeOrders}        icon={ShoppingCart}  hint="Currently in progress"         onClick={() => navigate('/orders?status=active')} />
              <KPICard title="Pending Payment"    count={pendingPayment}      icon={CreditCard}    hint="Awaiting UTR verification"     onClick={() => navigate('/orders?paymentStatus=pending_verification')} />
              <KPICard title="Pending Challan"    count={pendingChallan}      icon={FileUp}        hint="Packed, challan needed"        onClick={() => navigate('/orders?status=packed')} />
              <KPICard title="Open Enquiries"     count={openEnquiries}       icon={MessageSquare} hint="Awaiting admin response"       onClick={() => navigate('/enquiries?status=open')} />
              <KPICard title="Overdue Deliveries" count={overdueDeliveries}   icon={AlertTriangle} hint="Past expected delivery date"   onClick={() => navigate('/orders?overdue=true')} />
            </div>
          </section>

          {/* Metric cards row */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Total Revenue (Paid)"  value={`₹${(totalRevenue/100000).toFixed(1)}L`} icon={TrendingUp} color="bg-gradient-to-br from-emerald-500 to-emerald-700" />
            <MetricCard label="Orders This Period"    value={orders.length}   sub={`${orders.filter(o => o.status === 'delivered').length} delivered`} icon={ShoppingCart} color="bg-gradient-to-br from-blue-500 to-blue-700" />
            <MetricCard label="Active SKUs"           value={12}              sub="1 archived"   icon={Package}      color="bg-gradient-to-br from-violet-500 to-violet-700" />
            <MetricCard label="Registered Buyers"     value={activeUsers}     sub="1 deactivated" icon={Users}       color="bg-gradient-to-br from-amber-500 to-amber-700" />
          </div>

          {/* Bottom section: Recent Orders + Source Regions */}
          <div className="grid grid-cols-3 gap-5">

            {/* Recent Orders — spans 2 cols */}
            <div className="col-span-2 bg-white border border-stone-100 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <span className="font-semibold text-stone-800 text-sm">Recent Orders</span>
                </div>
                <button
                  onClick={() => navigate('/orders')}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                >
                  View all <ArrowUpRight size={12} />
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-50">
                    {['Order ID', 'Buyer', 'Product', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50/50">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => {
                    const s = STATUS_MAP[order.status] ?? { label: order.status, cls: 'bg-stone-100 text-stone-700' };
                    return (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className={`cursor-pointer hover:bg-stone-50 transition-colors ${i < recentOrders.length - 1 ? 'border-b border-stone-50' : ''}`}
                      >
                        <td className="px-5 py-3 font-mono text-[11px] font-bold text-emerald-700">{order.id}</td>
                        <td className="px-5 py-3">
                          <div className="text-sm font-medium text-stone-800 truncate max-w-[130px]">{order.buyer}</div>
                        </td>
                        <td className="px-5 py-3 text-xs text-stone-400 truncate max-w-[120px]">{order.skuName}</td>
                        <td className="px-5 py-3 font-semibold text-stone-800 text-sm tabular-nums">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.cls}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[11px] text-stone-400 tabular-nums">{order.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Right column: Source Regions + status breakdown */}
            <div className="flex flex-col gap-4">

              {/* Source Regions */}
              <div className="bg-white border border-stone-100 rounded-2xl p-5 flex-1">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <span className="font-semibold text-stone-800 text-sm">Source Regions</span>
                </div>
                <div className="space-y-3.5">
                  {SOURCE_REGIONS.map(r => (
                    <div key={r.region}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-stone-600 font-medium">{r.region}</span>
                        <span className="text-xs font-bold text-stone-500 tabular-nums">{r.count}</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(r.count / MAX_REGION) * 100}%`, background: r.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1 text-[11px] text-stone-400">
                  <Clock size={11} /> Updated Jan 17, 2024
                </div>
              </div>

              {/* Order status breakdown */}
              <div className="bg-white border border-stone-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-4 bg-violet-500 rounded-full" />
                  <span className="font-semibold text-stone-800 text-sm">Order Status</span>
                </div>
                <div className="space-y-2.5">
                  {Object.entries(STATUS_MAP).map(([key, { label, cls }]) => {
                    const n = orders.filter(o => o.status === key).length;
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{label}</span>
                        </div>
                        <span className="text-sm font-bold text-stone-700 tabular-nums">{n}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
