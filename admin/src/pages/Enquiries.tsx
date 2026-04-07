import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Download, MessageSquare, CheckCircle, Tag, Mail, Phone } from 'lucide-react';
import Header from '../components/Layout/Header';
import Modal from '../components/ui/Modal';
import type { Enquiry, EnquiryStatus, EnquiryCategory } from '../types';
import enquiriesRaw from '../data/enquiries.json';

const INITIAL = enquiriesRaw as Enquiry[];

const STATUS_CFG: Record<EnquiryStatus, { label: string; cls: string; dot: string }> = {
  open:        { label: 'Open',        cls: 'bg-red-100 text-red-800',     dot: 'bg-red-500' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  resolved:    { label: 'Resolved',    cls: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
};

const CAT_CFG: Record<EnquiryCategory, { label: string; cls: string }> = {
  pricing:      { label: 'Pricing',      cls: 'bg-blue-100 text-blue-800' },
  product_info: { label: 'Product Info', cls: 'bg-violet-100 text-violet-800' },
  compliance:   { label: 'Compliance',   cls: 'bg-stone-100 text-stone-700' },
  logistics:    { label: 'Logistics',    cls: 'bg-orange-100 text-orange-800' },
  partnership:  { label: 'Partnership',  cls: 'bg-pink-100 text-pink-800' },
};

const CATEGORIES = Object.keys(CAT_CFG) as EnquiryCategory[];

export default function Enquiries() {
  const [searchParams] = useSearchParams();
  const [enquiries, setEnquiries] = useState<Enquiry[]>(INITIAL);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter]   = useState(searchParams.get('status') ?? '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selected, setSelected]       = useState<Enquiry | null>(null);
  const [noteInput, setNoteInput]     = useState('');
  const [successMsg, setSuccessMsg]   = useState('');

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const filtered = useMemo(() => {
    let data = [...enquiries];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(e =>
        e.id.toLowerCase().includes(q) ||
        e.businessName.toLowerCase().includes(q) ||
        e.skuRef.toLowerCase().includes(q) ||
        e.userName.toLowerCase().includes(q)
      );
    }
    if (statusFilter) data = data.filter(e => e.status === statusFilter);
    if (categoryFilter) data = data.filter(e => e.category === categoryFilter);
    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [enquiries, search, statusFilter, categoryFilter]);

  const openDetail = (enq: Enquiry) => {
    setSelected(enq);
    setNoteInput(enq.adminNotes);
  };

  const update = (patch: Partial<Enquiry>) => {
    setEnquiries(prev => prev.map(e => e.id === selected!.id ? { ...e, ...patch } : e));
    setSelected(prev => prev ? { ...prev, ...patch } : null);
  };

  const saveNote = () => {
    update({ adminNotes: noteInput });
    flash('Notes saved.');
  };

  const setCategory = (category: EnquiryCategory) => {
    update({ category });
    flash('Category updated.');
  };

  const resolve = () => {
    const resolvedAt = new Date().toISOString();
    update({ status: 'resolved', resolvedAt });
    flash('Enquiry resolved.');
  };

  const markInProgress = () => {
    update({ status: 'in_progress' });
    flash('Marked in progress.');
  };

  const exportCSV = () => {
    const headers = ['ID','Date','Business','GSTIN','Email','SKU Ref','Status','Category','Message'];
    const rows = filtered.map(e => [e.id, e.date, e.businessName, e.gstin, e.email, e.skuRef, e.status, e.category, `"${e.message}"`]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'vanos_enquiries.csv';
    a.click();
  };

  // counts for summary pills
  const counts = useMemo(() => ({
    open:        enquiries.filter(e => e.status === 'open').length,
    in_progress: enquiries.filter(e => e.status === 'in_progress').length,
    resolved:    enquiries.filter(e => e.status === 'resolved').length,
  }), [enquiries]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header title="Enquiry Management" subtitle="Buyer enquiries and support requests" breadcrumbs={['Admin', 'Enquiries']} />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {successMsg && (
          <div className="bg-emerald-100 text-emerald-800 text-sm px-4 py-2.5 rounded-xl font-medium">✓ {successMsg}</div>
        )}

        {/* Status summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {(Object.entries(STATUS_CFG) as [EnquiryStatus, typeof STATUS_CFG[EnquiryStatus]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all hover:shadow-md ${
                statusFilter === key
                  ? `${cfg.cls} border-current`
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} shrink-0`} />
              <div>
                <div className="text-2xl font-bold text-stone-800 tabular-nums">{counts[key]}</div>
                <div className="text-xs text-stone-500 font-medium">{cfg.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, business, SKU, name…"
              className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-stone-700"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CFG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
          <select
            value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-stone-700"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_CFG[c].label}</option>)}
          </select>
          <span className="text-xs text-stone-400 ml-1">{filtered.length} results</span>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 ml-auto shadow-sm"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  {['ID', 'Date', 'Business', 'SKU Reference', 'Category', 'Status', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-bold text-stone-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <MessageSquare size={32} className="text-stone-200 mx-auto mb-2" />
                      <p className="text-stone-400 text-sm">No enquiries found</p>
                    </td>
                  </tr>
                ) : filtered.map((enq, i) => {
                  const s = STATUS_CFG[enq.status];
                  const c = CAT_CFG[enq.category];
                  return (
                    <tr
                      key={enq.id}
                      onClick={() => openDetail(enq)}
                      className={`hover:bg-stone-50 cursor-pointer transition-colors ${i < filtered.length - 1 ? 'border-b border-stone-50' : ''}`}
                    >
                      <td className="px-6 py-3.5 font-mono text-xs font-semibold text-emerald-700">{enq.id}</td>
                      <td className="px-6 py-3.5 text-stone-400 text-xs">{enq.date}</td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-stone-800">{enq.businessName}</div>
                        <div className="text-xs text-stone-400">{enq.userName}</div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-[11px] text-stone-500">{enq.skuRef}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>{c.label}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <button onClick={e => { e.stopPropagation(); openDetail(enq); }} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold">
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Enquiry ${selected?.id ?? ''}`} size="lg">
        {selected && (
          <div className="space-y-5">
            {/* Buyer info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Buyer</p>
                <div className="font-semibold text-stone-800 text-sm">{selected.businessName}</div>
                <div className="font-mono text-[11px] text-stone-400 mt-0.5">{selected.gstin}</div>
                <div className="text-xs text-stone-500 mt-1">{selected.userName}</div>
              </div>
              <div className="bg-stone-50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Contact</p>
                <div className="flex items-center gap-1.5 text-xs text-stone-700 mb-1">
                  <Mail size={12} className="text-stone-400" /> {selected.email}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-700">
                  <Phone size={12} className="text-stone-400" /> {selected.phone}
                </div>
                <div className="text-[11px] text-stone-400 mt-2">
                  {new Date(selected.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            </div>

            {/* SKU + Status row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-400 mb-1">SKU Reference</p>
                <div className="font-mono text-sm font-semibold text-emerald-700">{selected.skuRef}</div>
                <div className="text-xs text-stone-500 mt-0.5">{selected.skuName}</div>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1">Current Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${STATUS_CFG[selected.status].dot}`} />
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CFG[selected.status].cls}`}>
                    {STATUS_CFG[selected.status].label}
                  </span>
                </div>
                {selected.resolvedAt && (
                  <div className="text-[11px] text-stone-400 mt-1">
                    Resolved {new Date(selected.resolvedAt).toLocaleDateString('en-IN')}
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                <MessageSquare size={11} /> Customer Message
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">{selected.message}</p>
            </div>

            {/* Category tag */}
            <div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 mb-2">
                <Tag size={13} /> Category Tag
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      selected.category === c
                        ? `${CAT_CFG[c].cls} border-current ring-2 ring-offset-1 ring-emerald-400`
                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {CAT_CFG[c].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal notes */}
            <div>
              <div className="text-sm font-semibold text-stone-700 mb-1.5">
                Internal Notes{' '}
                <span className="text-xs text-stone-400 font-normal">(not visible to buyer)</span>
              </div>
              <textarea
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                rows={3}
                className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Add internal notes…"
              />
              <button onClick={saveNote} className="mt-2 px-4 py-1.5 bg-stone-100 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors">
                Save Notes
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-stone-100">
              {selected.status === 'open' && (
                <button onClick={markInProgress} className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700">
                  Mark In Progress
                </button>
              )}
              {selected.status !== 'resolved' && (
                <button onClick={resolve} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800">
                  <CheckCircle size={15} /> Mark Resolved
                </button>
              )}
              {selected.status === 'resolved' && (
                <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                  <CheckCircle size={16} />
                  Resolved on {selected.resolvedAt ? new Date(selected.resolvedAt).toLocaleDateString('en-IN') : '—'}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
