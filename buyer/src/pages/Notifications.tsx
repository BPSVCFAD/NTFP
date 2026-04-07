import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, ShoppingCart, CreditCard, Package, MessageSquare,
  ArrowRight, CheckCheck, ChevronRight,
} from 'lucide-react';
import type { BuyerAuth, Notification, NotificationType } from '../types';
import notificationsData from '../data/notifications.json';

interface Props { user: BuyerAuth; }

const TYPE_CONFIG: Record<NotificationType, { label: string; icon: any; iconCls: string; bg: string; border: string }> = {
  order_status:     { label: 'Order Update', icon: ShoppingCart,  iconCls: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
  payment_reminder: { label: 'Payment',      icon: CreditCard,    iconCls: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  new_sku:          { label: 'New Product',  icon: Package,       iconCls: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  enquiry_resolved: { label: 'Enquiry',      icon: MessageSquare, iconCls: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-100' },
};

export default function Notifications({ user }: Props) {
  const [items, setItems] = useState<Notification[]>(
    (notificationsData as Notification[]).filter(n => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

  const unread = items.filter(n => !n.read).length;

  const markRead = (id: string) => setItems(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setItems(p => p.map(n => ({ ...n, read: true })));

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-3">
            <Link to="/" className="hover:text-emerald-700">Home</Link>
            <ChevronRight size={14} />
            <span className="text-stone-800 font-medium">Notifications</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
                Notifications
                {unread > 0 && (
                  <span className="w-7 h-7 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition-colors"
              >
                <CheckCheck size={15} />
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 py-20 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell size={28} className="text-stone-400" />
            </div>
            <p className="font-semibold text-stone-600 text-lg">No notifications yet</p>
            <p className="text-stone-400 text-sm mt-1">We'll notify you about order updates and new products</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Unread section */}
            {unread > 0 && (
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1 mb-2">Unread</div>
            )}
            {items.filter(n => !n.read).map(n => <NotifCard key={n.id} n={n} onRead={markRead} />)}

            {/* Read section */}
            {items.some(n => n.read) && (
              <>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1 mt-6 mb-2">Earlier</div>
                {items.filter(n => n.read).map(n => <NotifCard key={n.id} n={n} onRead={markRead} />)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotifCard({ n, onRead }: { n: Notification; onRead: (id: string) => void }) {
  const cfg = TYPE_CONFIG[n.type];
  const Icon = cfg.icon;

  const content = (
    <div
      onClick={() => onRead(n.id)}
      className={`flex gap-4 p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
        n.read
          ? 'bg-white border-stone-200 hover:border-stone-300'
          : 'bg-white border-l-4 border-l-emerald-500 border-t-stone-200 border-r-stone-200 border-b-stone-200 shadow-sm hover:shadow-md'
      }`}
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
        <Icon size={20} className={cfg.iconCls} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-bold text-stone-800 text-sm">{n.title}</span>
            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.bg} ${cfg.iconCls}`}>
              {cfg.label}
            </span>
          </div>
          {!n.read && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-1 shrink-0" />}
        </div>
        <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">{n.message}</p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[11px] text-stone-400">
            {new Date(n.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
          {n.orderId && (
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              View order <ArrowRight size={11} />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (n.orderId) return <Link to={`/orders/${n.orderId}`}>{content}</Link>;
  return <div>{content}</div>;
}
