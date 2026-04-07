import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, Package,
  FileUp, Truck, Clock, Building, CreditCard,
} from 'lucide-react';
import Header from '../components/Layout/Header';
import Modal from '../components/ui/Modal';
import type { Order, OrderStatus, PaymentStatus } from '../types';
import ordersRaw from '../data/orders.json';

const INITIAL_ORDERS = ordersRaw as Order[];

const STATUS_FLOW: OrderStatus[] = ['pending_payment', 'confirmed', 'packed', 'delivered'];

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending Payment',
  confirmed: 'Confirmed',
  packed: 'Packed',
  delivered: 'Delivered',
  rejected: 'Rejected',
};

const PAYMENT_LABELS: Record<PaymentStatus, { label: string; cls: string }> = {
  paid:                 { label: 'Paid',                 cls: 'bg-emerald-100 text-emerald-800' },
  unpaid:               { label: 'Unpaid',               cls: 'bg-stone-100 text-stone-600' },
  pending_verification: { label: 'Pending Verification', cls: 'bg-amber-100 text-amber-800' },
};

interface ActionBtnProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color: 'emerald' | 'red' | 'amber' | 'violet';
  ghost?: boolean;
}

function ActionBtn({ icon: Icon, label, onClick, color, ghost = false }: ActionBtnProps) {
  const cls: Record<string, string> = {
    emerald: ghost ? 'border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'bg-emerald-600 text-white hover:bg-emerald-700',
    red:     ghost ? 'border border-red-200 text-red-700 bg-red-50 hover:bg-red-100'                 : 'bg-red-600 text-white hover:bg-red-700',
    amber:   ghost ? 'border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'         : 'bg-amber-600 text-white hover:bg-amber-700',
    violet:  ghost ? 'border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100'     : 'bg-violet-600 text-white hover:bg-violet-700',
  };
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${cls[color]}`}
    >
      <Icon size={15} /> {label}
    </button>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [orders, setOrders]       = useState<Order[]>(INITIAL_ORDERS);
  const [rejectModal, setRejectModal] = useState(false);
  const [challanModal, setChallanModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError]   = useState('');
  const [successMsg, setSuccessMsg]     = useState('');

  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center text-stone-400">
        Order not found.{' '}
        <button onClick={() => navigate('/orders')} className="text-emerald-700 underline ml-1">
          Back to Orders
        </button>
      </div>
    );
  }

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const addLog = (status: OrderStatus) =>
    setOrders(prev =>
      prev.map(o =>
        o.id === id
          ? { ...o, status, statusHistory: [...o.statusHistory, { status, timestamp: new Date().toISOString(), by: 'admin' }] }
          : o
      )
    );

  const handleConfirm = () => { addLog('confirmed'); flash('Order confirmed. Buyer notified.'); };
  const handlePack    = () => { addLog('packed');    flash('Order marked as packed.'); };
  const handleDeliver = () => { addLog('delivered'); flash('Order marked as delivered.'); };

  const handleReject = () => {
    if (rejectReason.trim().length < 20) { setRejectError('Rejection reason must be at least 20 characters.'); return; }
    setOrders(prev => prev.map(o =>
      o.id === id
        ? { ...o, status: 'rejected', rejectionReason: rejectReason, statusHistory: [...o.statusHistory, { status: 'rejected', timestamp: new Date().toISOString(), by: 'admin' }] }
        : o
    ));
    setRejectModal(false); setRejectReason(''); setRejectError('');
    flash('Order rejected.');
  };

  const handleChallan = () => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, challanUploaded: true } : o));
    setChallanModal(false);
    flash('Challan uploaded.');
  };

  const p        = PAYMENT_LABELS[order.paymentStatus];
  const statusIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header title={order.id} subtitle={`${order.buyer} · ${order.date}`} breadcrumbs={['Orders', order.id]} />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-700 transition-colors">
            <ArrowLeft size={16} /> Back to Orders
          </button>
          {successMsg && (
            <div className="bg-emerald-100 text-emerald-800 text-sm px-4 py-2 rounded-xl font-medium">
              ✓ {successMsg}
            </div>
          )}
        </div>

        {/* Stepper */}
        {order.status !== 'rejected' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-5">Order Progress</p>
            <div className="flex items-start">
              {STATUS_FLOW.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                      i <= statusIdx
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100'
                        : 'bg-white border-stone-200 text-stone-400'
                    }`}>
                      {i < statusIdx ? '✓' : i + 1}
                    </div>
                    <div className={`text-xs mt-2 font-semibold whitespace-nowrap ${i <= statusIdx ? 'text-emerald-700' : 'text-stone-400'}`}>
                      {STATUS_LABELS[s]}
                    </div>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`h-0.5 flex-1 mb-5 mx-2 ${i < statusIdx ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {order.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <XCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-red-800 text-sm mb-1">Order Rejected</div>
              <p className="text-sm text-red-600">{order.rejectionReason}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-5">
          {/* Left: details */}
          <div className="col-span-2 space-y-4">
            {/* Order details */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">Order Details</p>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                {([
                  ['Order ID',   <span className="font-mono font-semibold text-emerald-700">{order.id}</span>],
                  ['Date',       order.date],
                  ['Product',    <span className="font-medium">{order.skuName}</span>],
                  ['SKU Code',   <span className="font-mono text-xs">{order.sku}</span>],
                  ['Quantity',   `${order.quantity} ${order.unit}`],
                  ['Amount',     <span className="font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</span>],
                  ['Delivery',   order.deliveryDate ?? '—'],
                  ['Challan',    order.challanUploaded ? <span className="text-emerald-600 font-semibold">Uploaded ✓</span> : <span className="text-amber-600">Not uploaded</span>],
                ] as [string, React.ReactNode][]).map(([dt, dd]) => (
                  <div key={dt}>
                    <dt className="text-stone-400 text-xs mb-0.5">{dt}</dt>
                    <dd className="text-stone-700">{dd}</dd>
                  </div>
                ))}
                {order.notes && (
                  <div className="col-span-2">
                    <dt className="text-stone-400 text-xs mb-0.5">Notes</dt>
                    <dd className="text-stone-600">{order.notes}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Payment */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <CreditCard size={12} /> Payment
              </p>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div>
                  <dt className="text-stone-400 text-xs mb-1">Status</dt>
                  <dd><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.cls}`}>{p.label}</span></dd>
                </div>
                <div>
                  <dt className="text-stone-400 text-xs mb-0.5">UTR / Reference</dt>
                  <dd className="font-mono text-sm text-stone-700">{order.utr ?? '—'}</dd>
                </div>
              </dl>
            </div>

            {/* History */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Clock size={12} /> Status History
              </p>
              <ol className="relative border-l border-stone-200 space-y-4 pl-5 ml-1">
                {order.statusHistory.map((h, i) => (
                  <li key={i} className="relative">
                    <div className="absolute -left-[23px] w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow" />
                    <span className="font-semibold text-stone-700 text-sm">{STATUS_LABELS[h.status] ?? h.status}</span>
                    <span className="text-stone-400 text-xs ml-2">{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                    <span className="text-stone-400 text-xs ml-1">· {h.by}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right: buyer + actions */}
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Building size={12} /> Buyer
              </p>
              <div className="font-semibold text-stone-800 text-sm">{order.buyer}</div>
              <div className="font-mono text-[11px] text-stone-400 mt-1">{order.gstin}</div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">Actions</p>
              <div className="space-y-2.5">
                {order.status === 'pending_payment' && (
                  <>
                    <ActionBtn icon={CheckCircle} label="Confirm Order"  onClick={handleConfirm}             color="emerald" />
                    <ActionBtn icon={XCircle}     label="Reject Order"   onClick={() => setRejectModal(true)} color="red" ghost />
                  </>
                )}
                {order.status === 'confirmed' && (
                  <>
                    <ActionBtn icon={Package}  label="Mark as Packed"  onClick={handlePack}               color="violet" />
                    <ActionBtn icon={XCircle}  label="Reject Order"    onClick={() => setRejectModal(true)} color="red" ghost />
                  </>
                )}
                {order.status === 'packed' && (
                  <>
                    {!order.challanUploaded && (
                      <ActionBtn icon={FileUp} label="Upload Challan"     onClick={() => setChallanModal(true)} color="amber" />
                    )}
                    <ActionBtn icon={Truck} label="Mark as Delivered"     onClick={handleDeliver}              color="emerald" />
                  </>
                )}
                {['delivered','rejected'].includes(order.status) && (
                  <p className="text-xs text-stone-400 text-center py-2">No further actions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject modal */}
      <Modal isOpen={rejectModal} onClose={() => { setRejectModal(false); setRejectReason(''); setRejectError(''); }} title="Reject Order">
        <div className="space-y-4">
          <p className="text-sm text-stone-600">Provide a reason for rejecting <strong>{order.id}</strong>. The buyer will be notified.</p>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Rejection Reason <span className="text-stone-400 font-normal">(min 20 chars)</span>
            </label>
            <textarea
              value={rejectReason} onChange={e => { setRejectReason(e.target.value); setRejectError(''); }} rows={4}
              className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              placeholder="Describe the reason clearly…"
            />
            <div className="flex justify-between mt-1">
              {rejectError && <p className="text-xs text-red-600">{rejectError}</p>}
              <span className={`text-xs ml-auto ${rejectReason.length >= 20 ? 'text-emerald-600' : 'text-stone-400'}`}>
                {rejectReason.length} / 20 min
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setRejectModal(false); setRejectReason(''); setRejectError(''); }} className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50">Cancel</button>
            <button onClick={handleReject} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Confirm Rejection</button>
          </div>
        </div>
      </Modal>

      {/* Challan modal */}
      <Modal isOpen={challanModal} onClose={() => setChallanModal(false)} title="Upload Delivery Challan">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-stone-200 rounded-xl p-10 text-center bg-stone-50">
            <FileUp size={30} className="text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-500 mb-1">Drag & drop or browse</p>
            <p className="text-xs text-stone-400">JPG, PNG, PDF · max 5MB</p>
            <button className="mt-4 px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-100 shadow-sm">Browse Files</button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setChallanModal(false)} className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50">Cancel</button>
            <button onClick={handleChallan} className="flex-1 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800">Upload</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
