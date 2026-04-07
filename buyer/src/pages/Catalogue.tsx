import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ChevronRight, MapPin,
  ShoppingCart, Eye, X, ArrowUpDown,
} from 'lucide-react';
import type { BuyerAuth, SKU } from '../types';
import skusData from '../data/skus.json';
import categoriesData from '../data/categories.json';

interface Props { user: BuyerAuth | null; }

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

const STOCK_BADGE: Record<string, { label: string; cls: string; dot: string }> = {
  in_stock:     { label: 'In Stock',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  low_stock:    { label: 'Low Stock',    cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  out_of_stock: { label: 'Out of Stock', cls: 'bg-red-50 text-red-600 border-red-200',             dot: 'bg-red-500' },
};

const SORT_OPTIONS = [
  { value: 'default',     label: 'Default' },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'name_asc',    label: 'Name: A to Z' },
];

export default function Catalogue({ user }: Props) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch]           = useState(searchParams.get('q') ?? '');
  const [selCat, setSelCat]           = useState(searchParams.get('cat') ?? '');
  const [stockFilter, setStockFilter] = useState('all');
  const [sort, setSort]               = useState('default');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('cat');
    if (q) setSearch(q);
    if (cat) setSelCat(cat);
  }, [searchParams]);

  const skus = (skusData as SKU[]).filter(s => !s.archived);
  const categories = categoriesData.filter(c => c.active);
  const sourceStates = Array.from(new Set(skus.map(s => s.sourceState))).sort();

  const [selStates, setSelStates] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let list = skus;
    if (selCat) list = list.filter(s => s.category === selCat);
    if (stockFilter !== 'all') list = list.filter(s => s.stockStatus === stockFilter);
    if (selStates.length) list = list.filter(s => selStates.includes(s.sourceState));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.displayName.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.sourceState.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    if (sort === 'price_asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name_asc')   list = [...list].sort((a, b) => a.displayName.localeCompare(b.displayName));
    return list;
  }, [skus, selCat, stockFilter, selStates, search, sort]);

  const clearFilters = () => {
    setSelCat(''); setStockFilter('all'); setSelStates([]); setSearch('');
    setSearchParams({});
  };
  const hasFilters = selCat || stockFilter !== 'all' || selStates.length > 0 || search;

  const Sidebar = () => (
    <div className="w-64 shrink-0 space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelCat('')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${!selCat ? 'bg-emerald-700 text-white font-semibold' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            All Categories
            <span className={`text-xs ${!selCat ? 'text-emerald-200' : 'text-stone-400'}`}>{skus.length}</span>
          </button>
          {categories.map(cat => {
            const count = skus.filter(s => s.category === cat.name).length;
            const style = CAT_STYLE[cat.name];
            return (
              <button
                key={cat.id}
                onClick={() => setSelCat(cat.name === selCat ? '' : cat.name)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${selCat === cat.name ? 'bg-emerald-700 text-white font-semibold' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                <span>{style?.emoji}</span>
                <span className="flex-1 text-left">{cat.name}</span>
                <span className={`text-xs ${selCat === cat.name ? 'text-emerald-200' : 'text-stone-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Availability</h3>
        <div className="space-y-2">
          {[
            { value: 'all',          label: 'All Products' },
            { value: 'in_stock',     label: 'In Stock' },
            { value: 'low_stock',    label: 'Low Stock' },
            { value: 'out_of_stock', label: 'Out of Stock' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-stone-100 cursor-pointer">
              <input
                type="radio"
                name="stock"
                value={opt.value}
                checked={stockFilter === opt.value}
                onChange={e => setStockFilter(e.target.value)}
                className="accent-emerald-700"
              />
              <span className="text-sm text-stone-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Source State */}
      <div>
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Source State</h3>
        <div className="space-y-1.5">
          {sourceStates.map(state => (
            <label key={state} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-stone-100 cursor-pointer">
              <input
                type="checkbox"
                checked={selStates.includes(state)}
                onChange={e => setSelStates(prev =>
                  e.target.checked ? [...prev, state] : prev.filter(s => s !== state)
                )}
                className="accent-emerald-700 rounded"
              />
              <span className="text-sm text-stone-700 flex items-center gap-1.5">
                <MapPin size={11} className="text-stone-400" />
                {state}
              </span>
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
        >
          <X size={14} />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-1.5 text-sm text-stone-500">
          <Link to="/" className="hover:text-emerald-700 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-stone-800 font-medium">Catalogue</span>
          {selCat && (
            <>
              <ChevronRight size={14} />
              <span className="text-stone-800 font-medium">{selCat}</span>
            </>
          )}
        </div>
      </div>

      {/* Search bar (full-width) */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products, categories, source states…"
                className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-3 bg-white">
              <ArrowUpDown size={14} className="text-stone-400" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-sm text-stone-700 bg-transparent py-2 focus:outline-none pr-1"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-medium"
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sticky top-28">
            <Sidebar />
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative bg-white w-72 h-full overflow-y-auto p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-stone-800">Filters</h2>
                <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-500">
                  <X size={18} />
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-stone-600">
              <span className="font-semibold text-stone-800">{filtered.length}</span> products found
              {selCat && <span> in <span className="text-emerald-700 font-medium">{selCat}</span></span>}
            </p>
            {!user && (
              <Link to="/login" className="text-xs text-emerald-700 hover:underline font-medium flex items-center gap-1">
                Sign in to place orders <ChevronRight size={12} />
              </Link>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 py-20 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-semibold text-stone-700 text-lg">No products found</p>
              <p className="text-stone-400 text-sm mt-2">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="mt-4 px-5 py-2 bg-emerald-700 text-white text-sm rounded-xl hover:bg-emerald-800 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(sku => {
                const style = CAT_STYLE[sku.category] ?? { gradient: 'from-emerald-800 to-emerald-600', emoji: '🌿' };
                const stock = STOCK_BADGE[sku.stockStatus];
                return (
                  <div
                    key={sku.id}
                    className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-stone-300 transition-all"
                  >
                    {/* Image */}
                    <div className={`relative bg-gradient-to-br ${style.gradient} h-48 flex items-center justify-center`}>
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                        {style.emoji}
                      </span>
                      <div className="absolute top-3 left-3">
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${stock.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />
                          {stock.label}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-black/30 text-white text-[9px] font-medium rounded-full backdrop-blur-sm">
                          {sku.sourceState}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1.5">{sku.category}</div>
                      <h3 className="font-bold text-stone-800 text-sm leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors min-h-[2.5rem]">
                        {sku.displayName}
                      </h3>

                      <div className="flex items-center gap-1 mt-2 text-xs text-stone-400">
                        <MapPin size={11} />
                        {sku.sourceDistrict ? `${sku.sourceDistrict}, ` : ''}{sku.sourceState}
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-end justify-between">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-stone-800">₹{sku.price.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-stone-400">/ {sku.unit}</span>
                          </div>
                          <div className="text-[10px] text-stone-400 mt-0.5">MOQ: {sku.moq} {sku.unit}</div>
                        </div>
                        <div className="flex gap-2">
                          {user && sku.stockStatus !== 'out_of_stock' && (
                            <button
                              onClick={() => navigate(`/catalogue/${sku.id}?action=order`)}
                              title="Place Order"
                              className="w-9 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center text-white transition-colors shadow-sm"
                            >
                              <ShoppingCart size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/catalogue/${sku.id}`)}
                            className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
