import { useState, useMemo } from 'react';
import { Search, UserX, UserCheck, Key, AlertTriangle } from 'lucide-react';
import Header from '../components/Layout/Header';
import Modal from '../components/ui/Modal';
import type { AppUser } from '../types';
import usersRaw from '../data/users.json';

const INITIAL = usersRaw as AppUser[];

export default function Users() {
  const [users, setUsers]             = useState<AppUser[]>(INITIAL);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ type: 'deactivate' | 'reactivate'; user: AppUser } | null>(null);
  const [otpModal, setOtpModal]       = useState<AppUser | null>(null);
  const [successMsg, setSuccessMsg]   = useState('');

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };
  const states = useMemo(() => [...new Set(INITIAL.map(u => u.state))].sort(), []);

  const filtered = useMemo(() => {
    let data = [...users];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.businessName.toLowerCase().includes(q) ||
        u.gstin.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter) data = data.filter(u => u.status === statusFilter);
    if (stateFilter)  data = data.filter(u => u.state === stateFilter);
    return data.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
  }, [users, search, statusFilter, stateFilter]);

  const toggleDeactivate = (user: AppUser) => {
    setUsers(p => p.map(u => u.id === user.id ? { ...u, status: u.status === 'active' ? 'deactivated' : 'active' } : u));
    setConfirmModal(null);
    flash(user.status === 'active' ? `${user.businessName} deactivated.` : `${user.businessName} reactivated.`);
  };

  const sendOTP = (user: AppUser) => {
    setOtpModal(null);
    flash(`OTP sent to ${user.email}`);
  };

  const activeCount      = users.filter(u => u.status === 'active').length;
  const deactivatedCount = users.filter(u => u.status === 'deactivated').length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header
        title="User Management"
        subtitle={`${activeCount} active · ${deactivatedCount} deactivated`}
        breadcrumbs={['Admin', 'Users']}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {successMsg && (
          <div className="bg-emerald-100 text-emerald-800 text-sm px-4 py-2.5 rounded-xl font-medium">✓ {successMsg}</div>
        )}

        {/* Filters */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, business, GSTIN, email…"
              className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-stone-700"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </select>
          <select
            value={stateFilter} onChange={e => setStateFilter(e.target.value)}
            className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-stone-700"
          >
            <option value="">All States</option>
            {states.map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="text-xs text-stone-400 ml-1">{filtered.length} users</span>
        </div>

        {/* Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  {['Business', 'GSTIN', 'Contact', 'Location', 'Registered', 'Last Active', 'Orders', 'Total Spend', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-stone-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-16 text-center text-stone-400 text-sm">No users found</td></tr>
                ) : filtered.map((user, i) => (
                  <tr key={user.id} className={`hover:bg-stone-50 transition-colors ${user.status === 'deactivated' ? 'opacity-60' : ''} ${i < filtered.length - 1 ? 'border-b border-stone-50' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-stone-800">{user.businessName}</div>
                      <div className="text-xs text-stone-400 mt-0.5">{user.name}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-stone-500">{user.gstin}</td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-stone-700">{user.email}</div>
                      <div className="text-xs text-stone-400 mt-0.5">{user.phone}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-stone-500">{user.city}, {user.state}</td>
                    <td className="px-5 py-4 text-xs text-stone-400">{user.registrationDate}</td>
                    <td className="px-5 py-4 text-xs text-stone-400">{user.lastActive}</td>
                    <td className="px-5 py-4 font-bold text-stone-800 tabular-nums">{user.orderCount}</td>
                    <td className="px-5 py-4 font-bold text-stone-800 tabular-nums">
                      ₹{(user.totalSpend / 100000).toFixed(1)}L
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status === 'active' ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setConfirmModal({ type: user.status === 'active' ? 'deactivate' : 'reactivate', user })}
                          title={user.status === 'active' ? 'Deactivate' : 'Reactivate'}
                          className={`p-1.5 rounded-lg transition-colors ${user.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        >
                          {user.status === 'active' ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        <button
                          onClick={() => setOtpModal(user)}
                          title="Reset Password (OTP)"
                          className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <Key size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deactivate/Reactivate confirm */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal?.type === 'deactivate' ? 'Deactivate User' : 'Reactivate User'}
        size="sm"
      >
        {confirmModal && (
          <div className="space-y-4">
            <div className={`flex items-start gap-3 p-4 rounded-xl ${confirmModal.type === 'deactivate' ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
              <AlertTriangle size={17} className={`mt-0.5 shrink-0 ${confirmModal.type === 'deactivate' ? 'text-red-600' : 'text-emerald-600'}`} />
              <div>
                <p className={`font-semibold text-sm ${confirmModal.type === 'deactivate' ? 'text-red-800' : 'text-emerald-800'}`}>
                  {confirmModal.type === 'deactivate' ? 'Deactivate' : 'Reactivate'} {confirmModal.user.businessName}?
                </p>
                <p className={`text-sm mt-1 ${confirmModal.type === 'deactivate' ? 'text-red-600' : 'text-emerald-700'}`}>
                  {confirmModal.type === 'deactivate'
                    ? 'This buyer will lose platform access. This action is reversible.'
                    : 'This buyer will regain full platform access.'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50">Cancel</button>
              <button
                onClick={() => toggleDeactivate(confirmModal.user)}
                className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-semibold ${confirmModal.type === 'deactivate' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-700 hover:bg-emerald-800'}`}
              >
                {confirmModal.type === 'deactivate' ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* OTP reset */}
      <Modal isOpen={!!otpModal} onClose={() => setOtpModal(null)} title="Reset Password via OTP" size="sm">
        {otpModal && (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">Send a password reset OTP to <strong>{otpModal.name}</strong> at:</p>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5">
              <div className="text-sm font-semibold text-stone-800">{otpModal.email}</div>
              <div className="text-xs text-stone-400 mt-0.5">{otpModal.phone}</div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Admin cannot view or set passwords. The buyer will receive a one-time OTP to set a new password.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setOtpModal(null)} className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50">Cancel</button>
              <button onClick={() => sendOTP(otpModal)} className="flex-1 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800">Send OTP</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
