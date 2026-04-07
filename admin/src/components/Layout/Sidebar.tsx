import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package,
  MessageSquare, Users, ChevronRight, Leaf, LogOut,
} from 'lucide-react';
import type { AuthUser } from '../../types';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/orders',    label: 'Orders',       icon: ShoppingCart },
  { to: '/skus',      label: 'SKU Catalogue', icon: Package },
  { to: '/enquiries', label: 'Enquiries',     icon: MessageSquare },
  { to: '/users',     label: 'Users',         icon: Users },
] as const;

interface Props {
  user: AuthUser | null;
  onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: Props) {
  return (
    <aside
      className="w-64 h-full flex flex-col shrink-0"
      style={{ background: 'linear-gradient(180deg, #052e16 0%, #14532d 100%)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
          <Leaf size={18} className="text-emerald-300" />
        </div>
        <div>
          <div className="font-bold text-white text-base tracking-tight">NTFP</div>
          <div className="text-emerald-400/70 text-[10px] font-medium tracking-widest uppercase">Admin · BPSV</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-emerald-700 uppercase tracking-widest">
          Navigation
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/20'
                  : 'text-emerald-100/60 hover:bg-white/5 hover:text-emerald-100 border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-emerald-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600/40 border border-emerald-400/30 flex items-center justify-center text-xs font-bold text-emerald-200">
            {user?.name?.slice(0, 2).toUpperCase() ?? 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name ?? 'Admin'}</div>
            <div className="text-[11px] text-emerald-400/60 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-400/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
