import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Leaf, Search, Bell, ChevronDown, LogOut, LayoutDashboard,
  ShoppingCart, User, Package, Menu, X, LogIn,
} from 'lucide-react';
import type { BuyerAuth } from '../types';
import notificationsData from '../data/notifications.json';
import categoriesData from '../data/categories.json';

interface Props {
  user: BuyerAuth | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unread = user ? notificationsData.filter(n => n.userId === user.id && !n.read).length : 0;
  const categories = categoriesData.filter(c => c.active);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/catalogue?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* Top banner */}
      <div className="bg-[#052e16] text-emerald-200/70 text-[11px] py-1.5 px-4 text-center tracking-wide">
        FRA-Compliant · Tribal Sourced · 100% Verified NTFP — Wholesale B2B Platform by BPSV
      </div>

      {/* Main nav */}
      <div className="bg-[#0a3d1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Leaf size={18} className="text-emerald-300" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-white text-base leading-none tracking-tight">NTFP</div>
              <div className="text-emerald-400/70 text-[9px] font-medium tracking-widest uppercase leading-none mt-0.5">by BPSV</div>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="flex">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search NTFP products, categories, source states…"
                className="flex-1 h-10 px-4 text-sm bg-white text-stone-800 placeholder-stone-400 rounded-l-xl border-0 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="h-10 px-4 bg-amber-500 hover:bg-amber-400 text-white rounded-r-xl flex items-center gap-1.5 font-medium text-sm transition-colors shrink-0"
              >
                <Search size={15} />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </form>

          {/* Desktop right nav */}
          <div className="hidden lg:flex items-center gap-1 ml-2">
            {/* Categories dropdown */}
            <div className="relative">
              <button
                onClick={() => { setCatMenuOpen(o => !o); setUserMenuOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-emerald-100/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Package size={15} />
                Categories
                <ChevronDown size={13} className={`transition-transform ${catMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {catMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Browse by Category</div>
                  {categories.map(c => (
                    <Link
                      key={c.id}
                      to={`/catalogue?cat=${encodeURIComponent(c.name)}`}
                      onClick={() => setCatMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-sm text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full">{c.skuCount}</span>
                    </Link>
                  ))}
                  <div className="border-t border-stone-100 mt-2 pt-2 px-3">
                    <Link
                      to="/catalogue"
                      onClick={() => setCatMenuOpen(false)}
                      className="text-sm text-emerald-700 font-medium hover:underline"
                    >
                      View all products →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/catalogue"
              className={({ isActive }) =>
                `px-3 py-2 text-sm rounded-lg transition-colors ${isActive ? 'text-white bg-white/10' : 'text-emerald-100/80 hover:text-white hover:bg-white/10'}`
              }
            >
              Catalogue
            </NavLink>

            {user && (
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm rounded-lg transition-colors ${isActive ? 'text-white bg-white/10' : 'text-emerald-100/80 hover:text-white hover:bg-white/10'}`
                }
              >
                My Orders
              </NavLink>
            )}
          </div>

          {/* Auth section */}
          <div className="flex items-center gap-2 ml-auto lg:ml-2 shrink-0">
            {user ? (
              <>
                {/* Notification bell */}
                <Link
                  to="/notifications"
                  className="relative w-9 h-9 flex items-center justify-center rounded-lg text-emerald-100/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unread}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => { setUserMenuOpen(o => !o); setCatMenuOpen(false); }}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-xs font-bold text-emerald-200">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-semibold text-white leading-none">{user.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-emerald-400/70 leading-none mt-0.5 truncate max-w-[100px]">{user.businessName}</div>
                    </div>
                    <ChevronDown size={13} className={`text-emerald-300 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-stone-100">
                        <div className="font-semibold text-stone-800 text-sm">{user.name}</div>
                        <div className="text-xs text-stone-500 mt-0.5 truncate">{user.businessName}</div>
                        <div className="text-xs text-stone-400 mt-0.5">{user.gstin}</div>
                      </div>
                      {[
                        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
                        { to: '/orders', label: 'My Orders', icon: ShoppingCart },
                        { to: '/notifications', label: `Notifications${unread > 0 ? ` (${unread})` : ''}`, icon: Bell },
                      ].map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-emerald-700 transition-colors"
                        >
                          <item.icon size={15} />
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-stone-100 mt-2 pt-2">
                        <button
                          onClick={() => { onLogout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <LogIn size={15} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-emerald-100/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#052e16] px-4 py-3 space-y-1">
            <Link to="/catalogue" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-emerald-100 hover:bg-white/10 rounded-lg">
              <Package size={16} /> Catalogue
            </Link>
            {user && (
              <>
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-emerald-100 hover:bg-white/10 rounded-lg">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-emerald-100 hover:bg-white/10 rounded-lg">
                  <ShoppingCart size={16} /> My Orders
                </Link>
                <Link to="/notifications" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-emerald-100 hover:bg-white/10 rounded-lg">
                  <Bell size={16} /> Notifications {unread > 0 && `(${unread})`}
                </Link>
              </>
            )}
            {!user && (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-amber-400 hover:bg-white/10 rounded-lg font-medium">
                <User size={16} /> Sign In / Register
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Category strip (desktop) */}
      <div className="hidden lg:block bg-[#0d4d25] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center gap-1 overflow-x-auto">
          {categories.slice(0, 8).map(c => (
            <Link
              key={c.id}
              to={`/catalogue?cat=${encodeURIComponent(c.name)}`}
              className="whitespace-nowrap text-xs text-emerald-200/60 hover:text-emerald-100 px-3 py-1 rounded-md hover:bg-white/5 transition-colors shrink-0"
            >
              {c.name}
            </Link>
          ))}
          <Link to="/catalogue" className="whitespace-nowrap text-xs text-amber-400 hover:text-amber-300 px-3 py-1 rounded-md hover:bg-white/5 transition-colors shrink-0 ml-auto">
            All Products →
          </Link>
        </div>
      </div>
    </header>
  );
}
