import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Download, ChevronUp, ChevronDown } from 'lucide-react';
import Header from '../components/Layout/Header';
import type { Order, OrderStatus, PaymentStatus } from '../types';
import ordersRaw from '../data/orders.json';

const orders = ordersRaw as Order[];

const STATUS_LABELS: Record<OrderStatus, { label: string; cls: string }> = {
  pending_payment: { label: 'Pending Payment', cls: 'bg-amber-100 text-amber-800' },
  confirmed:       { label: 'Confirmed',        cls: 'bg-blue-100 text-blue-800' },
  packed:          { label: 'Packed',            cls: 'bg-violet-100 text-violet-800' },
  delivered:       { label: 'Delivered',         cls: 'bg-emerald-100 text-emerald-800' },
  rejected:        { label: 'Rejected',          cls: 'bg-red-100 text-red-800' },
};

const PAYMENT_LABELS: Record<PaymentStatus, { label: string; cls: string }> = {
  paid:                 { label: 'Paid',                 cls: 'bg-emerald-100 text-emerald-800' },
  unpaid:               { label: 'Unpaid',               cls: 'bg-stone-100 text-stone-600' },
  pending_verification: { label: 'Pending Verification', cls: 'bg-amber-100 text-amber-800' },
};

type SortField = 'id' | 'date' | 'buyer' | 'sku' | 'totalAmount' | 'status' | 'paymentStatus';

interface SortIconProps { field: SortField; sortField: SortField; sortDir: 'asc' | 'desc'; }
function SortIcon({ field, sortField, sortDir }: SortIconProps) {
  if (sortField !== field) return <ChevronUp size={13} className="text-stone-300" />;
  return sortDir === 'asc' ? <ChevronUp size={13} className="text-emerald-600" /> : <ChevronDown size={13} className="text-emerald-600" />;
}

const TODAY = new Date('2024-01-17');

export default function Orders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter]   = useState(searchParams.get('status') ?? '');
  const [paymentFilter, setPaymentFilter] = useState(searchParams.get('paymentStatus') ?? '');
  const [sortField, setSortField]     = useState<SortField>('date');
  const [sortDir, setSortDir]         = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let data = [...orders];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.buyer.toLowerCase().includes(q) ||
        o.gstin.toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'active') {
      data = data.filter(o => !['delivered','rejected'].includes(o.status));
    } else if (statusFilter) {
      data = data.filter(o => o.status === statusFilter);
    }

    if (paymentFilter) data = data.filter(o => o.paymentStatus === paymentFilter);

    if (searchParams.get('overdue') === 'true') {
      data = data.filter(o =>
        o.deliveryDate &&
        !['delivered','rejected'].includes(o.status) &&
        new Date(o.deliveryDate) < TODAY
      );
    }

    data.sort((a, b) => {
      let vA: number | string = a[sortField] as string;
      let vB: number | string = b[sortField] as string;
      if (sortField === 'date')        { vA = new Date(a.date).getTime(); vB = new Date(b.date).getTime(); }
      if (sortField === 'totalAmount') { vA = a.totalAmount; vB = b.totalAmount; }
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [search, statusFilter, paymentFilter, sortField, sortDir, searchParams]);

  const exportCSV = () => {
    const h = ['Order ID','Date','Buyer','GSTIN','SKU','SKU Name','Qty','Unit','Total Amount','Status','Payment Status','UTR','Challan','Delivery Date'];
    const rows = filtered.map(o => [o.id,o.date,o.buyer,o.gstin,o.sku,o.skuName,o.quantity,o.unit,o.totalAmount,o.status,o.paymentStatus,o.utr??'',o.challanUploaded?'Yes':'No',o.deliveryDate??'']);
    const csv = [h,...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'vanos_orders.csv';
    a.click();
  };

  const COLS: { key: SortField; label: string }[] = [
    { key: 'id',            label: 'Order ID' },
    { key: 'date',          label: 'Date' },
    { key: 'buyer',         label: 'Buyer' },
    { key: 'sku',           label: 'Product' },
    { key: 'totalAmount',   label: 'Amount' },
    { key: 'status',        label: 'Status' },
    { key: 'paymentStatus', label: 'Payment' },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        title="Order Management"
        subtitle={`${filtered.length} orders`}
        breadcrumbs={['Admin', 'Orders']}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Filters */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search Order ID, buyer, GSTIN…"
              className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-stone-700"
          >
            {[['','All Statuses'],['active','Active'],['pending_payment','Pending Payment'],['confirmed','Confirmed'],['packed','Packed'],['delivered','Delivered'],['rejected','Rejected']].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <select
            value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
            className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-stone-700"
          >
            {[['','All Payment'],['paid','Paid'],['unpaid','Unpaid'],['pending_verification','Pending Verification']].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-colors ml-auto shadow-sm"
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
                  {COLS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-6 py-3 text-left text-[11px] font-bold text-stone-400 uppercase tracking-widest cursor-pointer hover:bg-stone-100 select-none transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />
                      </span>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-stone-400 uppercase tracking-widest" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-stone-400">
                      No orders found
                    </td>
                  </tr>
                ) : filtered.map((order, i) => {
                  const isOverdue =
                    order.deliveryDate &&
                    !['delivered','rejected'].includes(order.status) &&
                    new Date(order.deliveryDate) < TODAY;
                  const s = STATUS_LABELS[order.status]  ?? { label: order.status, cls: 'bg-stone-100 text-stone-700' };
                  const p = PAYMENT_LABELS[order.paymentStatus] ?? { label: order.paymentStatus, cls: 'bg-stone-100 text-stone-700' };

                  return (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className={`cursor-pointer transition-colors hover:bg-stone-50 ${isOverdue ? 'bg-red-50/30' : ''} ${i < filtered.length - 1 ? 'border-b border-stone-50' : ''}`}
                    >
                      <td className="px-6 py-3.5 font-mono text-xs font-semibold text-emerald-700">{order.id}</td>
                      <td className="px-6 py-3.5 text-stone-500 text-xs">
                        {order.date}
                        {isOverdue && <span className="ml-1.5 text-red-600 font-semibold text-[10px]">OVERDUE</span>}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-stone-800">{order.buyer}</div>
                        <div className="text-[10px] text-stone-400 font-mono mt-0.5">{order.gstin}</div>
                      </td>
                      <td className="px-6 py-3.5 text-stone-500 text-xs max-w-[180px] truncate">{order.skuName}</td>
                      <td className="px-6 py-3.5 font-semibold text-stone-800">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.cls}`}>{p.label}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/orders/${order.id}`); }}
                          className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
                        >
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
    </div>
  );
}
