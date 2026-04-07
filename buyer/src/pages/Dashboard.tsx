import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart, Clock, Bell, ArrowRight, Package,
  TrendingUp, CheckCircle, AlertTriangle, XCircle,
} from 'lucide-react';
import type { BuyerAuth, Order } from '../types';
import ordersData from '../data/orders.json';
import notificationsData from '../data/notifications.json';

interface Props { user: BuyerAuth; }

const STATUS_COLOR: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed:       'bg-blue-100 text-blue-700 border-blue-200',
  packed:          'bg-purple-100 text-purple-700 border-purple-200',
  delivered:       'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected:        'bg-red-100 text-red-600 border-red-200',
};

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Pending Payment',
  confirmed: 'Confirmed',
  packed: 'Packed',
  delivered: 'Delivered',
  rejected: 'Rejected',
};

const STATUS_ICON: Record<string, any> = {
  pending_payment: AlertTriangle,
  confirmed: CheckCircle,
  packed: Package,
  delivered: CheckCircle,
  rejected: XCircle,
};

export default function Dashboard({ user }: Props) {
  const navigate = useNavigate();
  const myOrders = (ordersData as any[]).filter(o => o.buyerId === user.id) as Order[];
  const pendingPayment = myOrders.filter(o => o.paymentStatus === 'unpaid');
  const activeOrders = myOrders.filter(o => ['confirmed', 'packed'].includes(o.status));
  const unread = notificationsData.filter(n => n.userId === user.id && !n.read);
  const recentOrders = myOrders.slice(0, 5);
  const totalSpend = myOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header band */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-stone-500">Welcome back,</p>
              <h1 className="text-2xl font-bold text-stone-800 mt-0.5">{user.name}</h1>
              <p className="text-sm text-stone-500 mt-0.5">{user.businessName} · GSTIN: <span className="font-mono text-stone-700">{user.gstin}</span></p>
            </div>
            <button
              onClick={() => navigate('/catalogue')}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
            >
              <Package size={16} />
              Browse Catalogue
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: myOrders.length, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'All time' },
            { label: 'Pending Payment', value: pendingPayment.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', sub: pendingPayment.length > 0 ? 'Action required' : 'All clear' },
            { label: 'Active Shipments', value: activeOrders.length, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', sub: 'In transit' },
            { label: 'Total Spend', value: `₹${(totalSpend / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Paid orders' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <Icon size={18} className={stat.color} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-stone-800">{stat.value}</div>
                <div className="text-xs font-medium text-stone-600 mt-0.5">{stat.label}</div>
                <div className="text-[11px] text-stone-400 mt-0.5">{stat.sub}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-bold text-stone-800 flex items-center gap-2">
                <ShoppingCart size={16} className="text-stone-500" />
                Recent Orders
              </h2>
              <Link to="/orders" className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center text-stone-400">
                <ShoppingCart size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No orders yet</p>
                <button onClick={() => navigate('/catalogue')} className="mt-2 text-xs text-emerald-700 hover:underline">
                  Browse catalogue to get started →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {recentOrders.map(order => {
                  const Icon = STATUS_ICON[order.status] ?? Clock;
                  return (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${STATUS_COLOR[order.status].split(' ')[0]}`}>
                        <Icon size={16} className={STATUS_COLOR[order.status].split(' ')[1]} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stone-800 truncate">{order.skuName}</div>
                        <div className="text-xs text-stone-400 mt-0.5">
                          {order.id} · {order.quantity} {order.unit}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-stone-800">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[order.status]}`}>
                          {STATUS_LABEL[order.status]}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-stone-300 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                <h2 className="font-bold text-stone-800 flex items-center gap-2">
                  <Bell size={16} className="text-stone-500" />
                  Notifications
                  {unread.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unread.length}
                    </span>
                  )}
                </h2>
                <Link to="/notifications" className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  All <ArrowRight size={11} />
                </Link>
              </div>
              <div className="divide-y divide-stone-100">
                {unread.slice(0, 3).map(n => (
                  <Link
                    key={n.id}
                    to={n.orderId ? `/orders/${n.orderId}` : '/notifications'}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-stone-50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-stone-800">{n.title}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">{n.message}</div>
                    </div>
                  </Link>
                ))}
                {unread.length === 0 && (
                  <div className="px-5 py-6 text-center text-xs text-stone-400">All caught up ✓</div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="font-bold text-stone-800 mb-3 text-sm">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Browse Catalogue', to: '/catalogue', icon: Package, cls: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                  { label: 'Track My Orders', to: '/orders', icon: TrendingUp, cls: 'text-blue-700 bg-blue-50 border-blue-100' },
                  { label: 'View Notifications', to: '/notifications', icon: Bell, cls: 'text-purple-700 bg-purple-50 border-purple-100' },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${item.cls} hover:opacity-80 transition-opacity`}
                  >
                    <item.icon size={15} />
                    <span className="text-sm font-medium">{item.label}</span>
                    <ArrowRight size={13} className="ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
