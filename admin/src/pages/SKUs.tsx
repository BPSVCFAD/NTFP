import { useState, useMemo } from 'react';
import { Search, Plus, Download, Archive, Edit, RotateCcw, Leaf, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import Header from '../components/Layout/Header';
import Modal from '../components/ui/Modal';
import type { SKU, Category, StockStatus } from '../types';
import skusRaw       from '../data/skus.json';
import categoriesRaw from '../data/categories.json';

const INITIAL_SKUS = skusRaw       as SKU[];
const INITIAL_CATS = categoriesRaw as Category[];

const STATES = [
  'West Bengal','Jharkhand','Odisha','Assam','Meghalaya','Manipur',
  'Nagaland','Arunachal Pradesh','Tripura','Mizoram','Bihar','Chhattisgarh','Madhya Pradesh',
];

const STOCK_CFG: Record<StockStatus, { label: string; cls: string }> = {
  in_stock:     { label: 'In Stock',     cls: 'bg-emerald-100 text-emerald-800' },
  low_stock:    { label: 'Low Stock',    cls: 'bg-amber-100 text-amber-800' },
  out_of_stock: { label: 'Out of Stock', cls: 'bg-red-100 text-red-800' },
};

interface SKUForm {
  name: string; displayName: string; category: string; description: string;
  sourceState: string; sourceDistrict: string; batchSize: string;
  unit: string; price: string; moq: string; stockStatus: StockStatus;
}

interface CatForm { name: string; description: string; }

const EMPTY_SKU: SKUForm = { name:'', displayName:'', category:'', description:'', sourceState:'', sourceDistrict:'', batchSize:'', unit:'', price:'', moq:'', stockStatus:'in_stock' };
const EMPTY_CAT: CatForm = { name:'', description:'' };

export default function SKUs() {
  const [skus, setSkus]             = useState<SKU[]>(INITIAL_SKUS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATS);
  const [tab, setTab]               = useState<'skus' | 'categories'>('skus');

  // SKU state
  const [search, setSearch]               = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showArchived, setShowArchived]   = useState(false);
  const [skuModal, setSkuModal]           = useState<'create' | 'edit' | null>(null);
  const [editSku, setEditSku]             = useState<SKU | null>(null);
  const [skuForm, setSkuForm]             = useState<SKUForm>(EMPTY_SKU);
  const [skuErrors, setSkuErrors]         = useState<Partial<Record<keyof SKUForm, string>>>({});
  const [bulkModal, setBulkModal]         = useState(false);
  const [bulkCSV, setBulkCSV]             = useState('');

  // Category state
  const [catModal, setCatModal]   = useState<'create' | 'edit' | null>(null);
  const [editCat, setEditCat]     = useState<Category | null>(null);
  const [catForm, setCatForm]     = useState<CatForm>(EMPTY_CAT);
  const [catErrors, setCatErrors] = useState<Partial<Record<keyof CatForm, string>>>({});

  const [successMsg, setSuccessMsg] = useState('');
  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const activeCategories = useMemo(() => categories.filter(c => c.active).map(c => c.name), [categories]);

  // ── SKU helpers ──────────────────────────────────────────────────────────
  const openCreateSku = () => { setSkuForm(EMPTY_SKU); setSkuErrors({}); setSkuModal('create'); };

  const openEditSku = (sku: SKU, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditSku(sku);
    setSkuForm({ name:sku.name, displayName:sku.displayName, category:sku.category, description:sku.description, sourceState:sku.sourceState, sourceDistrict:sku.sourceDistrict??'', batchSize:String(sku.batchSize), unit:sku.unit, price:String(sku.price), moq:String(sku.moq), stockStatus:sku.stockStatus });
    setSkuErrors({});
    setSkuModal('edit');
  };

  const validateSku = (): boolean => {
    const e: typeof skuErrors = {};
    if (!skuForm.name.trim())        e.name        = 'SKU code is required';
    if (!skuForm.displayName.trim()) e.displayName = 'Display name is required';
    if (!skuForm.category)           e.category    = 'Category is required';
    if (!skuForm.price || isNaN(Number(skuForm.price))) e.price = 'Valid price required';
    if (!skuForm.moq   || isNaN(Number(skuForm.moq)))   e.moq   = 'Valid MOQ required';
    if (!skuForm.unit.trim())        e.unit        = 'Unit is required';
    const conflict = skus.find(s =>
      s.category === skuForm.category &&
      s.name.toLowerCase() === skuForm.name.toLowerCase() &&
      (!editSku || s.id !== editSku.id)
    );
    if (conflict) e.name = 'SKU code must be unique within category';
    setSkuErrors(e);
    return !Object.keys(e).length;
  };

  const saveSku = () => {
    if (!validateSku()) return;
    const now = new Date().toISOString().slice(0, 10);
    if (skuModal === 'create') {
      const newSku: SKU = { ...skuForm, id: `SKU-${String(skus.length + 1).padStart(3,'0')}`, batchSize: Number(skuForm.batchSize), price: Number(skuForm.price), moq: Number(skuForm.moq), archived: false, photos: [], createdAt: now, updatedAt: now };
      setSkus(p => [newSku, ...p]);
      flash('SKU created.');
    } else if (editSku) {
      setSkus(p => p.map(s => s.id === editSku.id ? { ...s, ...skuForm, batchSize: Number(skuForm.batchSize), price: Number(skuForm.price), moq: Number(skuForm.moq), updatedAt: now } : s));
      flash('SKU updated.');
    }
    setSkuModal(null);
  };

  const toggleArchive = (sku: SKU, e: React.MouseEvent) => {
    e.stopPropagation();
    setSkus(p => p.map(s => s.id === sku.id ? { ...s, archived: !s.archived } : s));
    flash(sku.archived ? 'SKU restored.' : 'SKU archived.');
  };

  const applyBulkPrice = () => {
    let updated = 0;
    const lines = bulkCSV.trim().split('\n').filter(Boolean);
    setSkus(prev => {
      let next = [...prev];
      lines.forEach(line => {
        const [name, price] = line.split(',').map(s => s.trim());
        if (!name || isNaN(Number(price))) return;
        next = next.map(s => s.name === name ? { ...s, price: Number(price), updatedAt: new Date().toISOString().slice(0,10) } : s);
        updated++;
      });
      return next;
    });
    setBulkModal(false); setBulkCSV('');
    flash(`${updated} SKU prices updated.`);
  };

  // ── Category helpers ─────────────────────────────────────────────────────
  const openCreateCat = () => { setCatForm(EMPTY_CAT); setCatErrors({}); setCatModal('create'); };
  const openEditCat   = (cat: Category) => { setEditCat(cat); setCatForm({ name: cat.name, description: cat.description }); setCatErrors({}); setCatModal('edit'); };

  const validateCat = (): boolean => {
    const e: typeof catErrors = {};
    if (!catForm.name.trim()) e.name = 'Category name is required';
    const conflict = categories.find(c =>
      c.name.toLowerCase() === catForm.name.toLowerCase() && (!editCat || c.id !== editCat.id)
    );
    if (conflict) e.name = 'Category name must be unique';
    setCatErrors(e);
    return !Object.keys(e).length;
  };

  const saveCat = () => {
    if (!validateCat()) return;
    if (catModal === 'create') {
      const newCat: Category = { ...catForm, id: `CAT-${String(categories.length + 1).padStart(3,'0')}`, active: true, skuCount: 0 };
      setCategories(p => [...p, newCat]);
      flash('Category created.');
    } else if (editCat) {
      setCategories(p => p.map(c => c.id === editCat.id ? { ...c, ...catForm } : c));
      flash('Category updated.');
    }
    setCatModal(null);
  };

  const toggleCatActive = (cat: Category) => {
    setCategories(p => p.map(c => c.id === cat.id ? { ...c, active: !c.active } : c));
    flash(cat.active ? 'Category deactivated.' : 'Category activated.');
  };

  // ── Filtered SKUs ────────────────────────────────────────────────────────
  const filteredSkus = useMemo(() => {
    let data = skus.filter(s => showArchived ? s.archived : !s.archived);
    if (search) { const q = search.toLowerCase(); data = data.filter(s => s.name.toLowerCase().includes(q) || s.displayName.toLowerCase().includes(q)); }
    if (categoryFilter) data = data.filter(s => s.category === categoryFilter);
    return data;
  }, [skus, search, categoryFilter, showArchived]);

  // ── Reusable field wrapper ───────────────────────────────────────────────
  interface FieldProps {
    label: string; required?: boolean; error?: string;
    children: React.ReactNode;
  }
  function Field({ label, required, error, children }: FieldProps) {
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
      </div>
    );
  }

  function inp(name: keyof SKUForm) {
    return (extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
      <input
        value={skuForm[name]} onChange={e => setSkuForm(f => ({ ...f, [name]: e.target.value }))}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${skuErrors[name] ? 'border-red-400' : 'border-stone-200'}`}
        {...extra}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header title="SKU Catalogue" subtitle="Products and category management" breadcrumbs={['Admin', 'SKU Catalogue']} />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {successMsg && (
          <div className="bg-emerald-100 text-emerald-800 text-sm px-4 py-2.5 rounded-xl font-medium">✓ {successMsg}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
          {([['skus', 'SKUs'], ['categories', 'Categories']] as const).map(([t, l]) => (
            <button
              key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* ── SKUs tab ───────────────────────────────────────────────────── */}
        {tab === 'skus' && (
          <>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SKUs…"
                  className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <select
                value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-stone-700"
              >
                <option value="">All Categories</option>
                {activeCategories.map(c => <option key={c}>{c}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer select-none">
                <input type="checkbox" className="rounded accent-emerald-600" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
                Show Archived
              </label>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setBulkModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50">
                  <Download size={14} /> Bulk Price
                </button>
                <button onClick={openCreateSku}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 shadow-sm">
                  <Plus size={15} /> New SKU
                </button>
              </div>
            </div>

            {filteredSkus.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl py-20 text-center">
                <Package size={36} className="text-stone-200 mx-auto mb-3" />
                <p className="text-stone-400 text-sm">No SKUs found</p>
                <button onClick={openCreateSku} className="mt-3 text-sm text-emerald-700 font-semibold hover:text-emerald-900">+ Add your first SKU</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredSkus.map(sku => {
                  const stock = STOCK_CFG[sku.stockStatus];
                  return (
                    <div
                      key={sku.id}
                      className={`bg-white border border-stone-200 rounded-2xl p-5 flex flex-col hover:shadow-md transition-shadow ${sku.archived ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="font-semibold text-stone-800 leading-snug">{sku.displayName}</div>
                          <div className="font-mono text-[10px] text-stone-400 mt-0.5">{sku.name}</div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${stock.cls}`}>{stock.label}</span>
                      </div>

                      <p className="text-xs text-stone-400 mb-4 line-clamp-2 leading-relaxed flex-1">{sku.description}</p>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs mb-4 bg-stone-50 rounded-xl p-3">
                        {([
                          ['Category', sku.category],
                          ['Price', `₹${sku.price.toLocaleString('en-IN')} / ${sku.unit}`],
                          ['MOQ', `${sku.moq} ${sku.unit}`],
                          ['Source', sku.sourceDistrict ? `${sku.sourceDistrict}, ${sku.sourceState}` : sku.sourceState],
                        ] as [string, string][]).map(([k, v]) => (
                          <div key={k}>
                            <div className="text-stone-400 text-[10px] font-medium uppercase tracking-wide">{k}</div>
                            <div className="text-stone-700 font-semibold mt-0.5">{v}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-stone-100">
                        <button onClick={e => openEditSku(sku, e)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors">
                          <Edit size={13} /> Edit
                        </button>
                        <button onClick={e => toggleArchive(sku, e)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-50 rounded-xl transition-colors">
                          {sku.archived ? <><RotateCcw size={13} /> Restore</> : <><Archive size={13} /> Archive</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Categories tab ─────────────────────────────────────────────── */}
        {tab === 'categories' && (
          <>
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">
                  {categories.filter(c => c.active).length} active · {categories.filter(c => !c.active).length} inactive
                </p>
              </div>
              <button
                onClick={openCreateCat}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 shadow-sm"
              >
                <Plus size={15} /> New Category
              </button>
            </div>

            {/* Category cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(cat => {
                const activeSKUs = skus.filter(s => s.category === cat.name && !s.archived).length;
                return (
                  <div
                    key={cat.id}
                    className={`bg-white border rounded-2xl p-5 transition-all hover:shadow-md ${cat.active ? 'border-stone-200' : 'border-stone-100 opacity-70'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.active ? 'bg-emerald-100' : 'bg-stone-100'}`}>
                          <Leaf size={18} className={cat.active ? 'text-emerald-700' : 'text-stone-400'} />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-800">{cat.name}</div>
                          <div className="font-mono text-[10px] text-stone-400 mt-0.5">{cat.id}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
                        {cat.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed mb-4">{cat.description || 'No description added.'}</p>

                    <div className="flex items-center gap-3 py-3 border-t border-stone-100 border-b mb-3">
                      <div className="flex-1 text-center">
                        <div className="text-xl font-bold text-stone-800 tabular-nums">{activeSKUs}</div>
                        <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wide">Active SKUs</div>
                      </div>
                      <div className="w-px h-8 bg-stone-200" />
                      <div className="flex-1 text-center">
                        <div className="text-xl font-bold text-stone-800 tabular-nums">{skus.filter(s => s.category === cat.name && s.archived).length}</div>
                        <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wide">Archived SKUs</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditCat(cat)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-100"
                      >
                        <Edit size={13} /> Edit
                      </button>
                      <button
                        onClick={() => toggleCatActive(cat)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-colors border ${
                          cat.active
                            ? 'text-stone-500 hover:bg-stone-50 border-stone-200'
                            : 'text-emerald-700 hover:bg-emerald-50 border-emerald-100'
                        }`}
                      >
                        {cat.active ? <><ToggleLeft size={14} /> Deactivate</> : <><ToggleRight size={14} /> Activate</>}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add new card */}
              <button
                onClick={openCreateCat}
                className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group min-h-[180px]"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center group-hover:border-emerald-200 transition-colors">
                  <Plus size={18} className="text-stone-400 group-hover:text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-stone-400 group-hover:text-emerald-700 transition-colors">New Category</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* SKU Create/Edit Modal */}
      <Modal
        isOpen={skuModal === 'create' || skuModal === 'edit'}
        onClose={() => setSkuModal(null)}
        title={skuModal === 'create' ? 'New SKU' : `Edit: ${editSku?.displayName}`}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="SKU Code" required error={skuErrors.name}>{inp('name')()}</Field>
          <Field label="Display Name" required error={skuErrors.displayName}>{inp('displayName')()}</Field>

          <Field label="Category" required error={skuErrors.category}>
            <select
              value={skuForm.category} onChange={e => setSkuForm(f => ({ ...f, category: e.target.value }))}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${skuErrors.category ? 'border-red-400' : 'border-stone-200'}`}
            >
              <option value="">Select category</option>
              {activeCategories.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Source State">
            <select
              value={skuForm.sourceState} onChange={e => setSkuForm(f => ({ ...f, sourceState: e.target.value }))}
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Select state</option>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Source District">{inp('sourceDistrict')()}</Field>
          <Field label="Unit" required error={skuErrors.unit}>{inp('unit')()}</Field>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
            <textarea
              value={skuForm.description} onChange={e => setSkuForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <Field label="Batch Size">{inp('batchSize')({ type: 'number' })}</Field>

          <Field label="Stock Status">
            <select
              value={skuForm.stockStatus} onChange={e => setSkuForm(f => ({ ...f, stockStatus: e.target.value as StockStatus }))}
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </Field>

          <Field label="Price (₹)" required error={skuErrors.price}>{inp('price')({ type: 'number' })}</Field>
          <Field label="MOQ" required error={skuErrors.moq}>{inp('moq')({ type: 'number' })}</Field>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Photos <span className="text-stone-400 font-normal">(max 5, JPG/PNG, ≤3MB each)</span>
            </label>
            <div className="border-2 border-dashed border-stone-200 rounded-xl p-5 text-center bg-stone-50 text-xs text-stone-400">
              Click or drag to upload product photos
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={() => setSkuModal(null)} className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50">
            Cancel
          </button>
          <button onClick={saveSku} className="flex-1 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800">
            {skuModal === 'create' ? 'Create SKU' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Bulk Price Modal */}
      <Modal isOpen={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Price Update via CSV">
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Paste CSV rows: <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">SKU_CODE,NEW_PRICE</code>
          </p>
          <textarea
            value={bulkCSV} onChange={e => setBulkCSV(e.target.value)} rows={8}
            className="w-full border border-stone-200 rounded-xl p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder={`NTFP-TEJPATA-BN-25KG,3000\nNTFP-SALSEED-JH-50KG,2000`}
          />
          <div className="flex gap-3">
            <button onClick={() => setBulkModal(false)} className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50">Cancel</button>
            <button onClick={applyBulkPrice} className="flex-1 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800">Apply Updates</button>
          </div>
        </div>
      </Modal>

      {/* Category Create/Edit Modal */}
      <Modal
        isOpen={catModal === 'create' || catModal === 'edit'}
        onClose={() => setCatModal(null)}
        title={catModal === 'create' ? 'New Category' : `Edit: ${editCat?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Category Name <span className="text-red-400">*</span>
            </label>
            <input
              value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Forest Botanicals"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${catErrors.name ? 'border-red-400' : 'border-stone-200'}`}
            />
            {catErrors.name && <p className="text-xs text-red-600 mt-0.5">{catErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
            <textarea
              value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Brief description of what this category covers…"
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCatModal(null)} className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50">Cancel</button>
            <button onClick={saveCat} className="flex-1 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800">
              {catModal === 'create' ? 'Create Category' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
