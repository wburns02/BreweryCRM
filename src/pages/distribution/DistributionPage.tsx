import { useState } from 'react';
import { Truck, DollarSign, Package, Store, MapPin, Phone, Mail, Plus } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../components/ui/ToastProvider';
import type { WholesaleAccount } from '../../types';

const typeColors: Record<string, 'amber' | 'green' | 'blue' | 'purple' | 'red' | 'gray'> = {
  bar: 'purple', restaurant: 'amber', 'bottle-shop': 'green', grocery: 'blue', 'event-venue': 'red',
};

const inputClass = 'w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50';
const labelClass = 'block text-xs font-medium text-brewery-400 mb-1';

export default function DistributionPage() {
  const { wholesaleAccounts: apiAccounts } = useData();
  const { toast } = useToast();
  const [localAccounts, setLocalAccounts] = useState<WholesaleAccount[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'prospect' | 'inactive'>('all');

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<WholesaleAccount['type']>('bar');
  const [status, setStatus] = useState<WholesaleAccount['status']>('prospect');
  const [creditLimit, setCreditLimit] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [notes, setNotes] = useState('');

  const allAccounts = [...apiAccounts, ...localAccounts];
  const filtered = filterStatus === 'all' ? allAccounts : allAccounts.filter(a => a.status === filterStatus);
  const active = allAccounts.filter(a => a.status === 'active');
  const totalRevenue = allAccounts.reduce((s, a) => s + a.totalRevenue, 0);
  const totalKegsOut = allAccounts.reduce((s, a) => s + a.kegsOut, 0);

  const resetForm = () => {
    setBusinessName(''); setContactName(''); setEmail(''); setPhone('');
    setAddress(''); setType('bar'); setStatus('prospect');
    setCreditLimit(''); setPaymentTerms('Net 30'); setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    const newAccount: WholesaleAccount = {
      id: crypto.randomUUID(),
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      type,
      status,
      totalOrders: 0,
      totalRevenue: 0,
      kegsOut: 0,
      creditLimit: parseFloat(creditLimit) || 5000,
      paymentTerms,
      notes: notes.trim(),
      tapsCarrying: [],
    };
    setLocalAccounts(prev => [...prev, newAccount]);
    toast('success', `${businessName} added as a wholesale account!`);
    resetForm();
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Accounts" value={active.length} icon={Store} iconBg="bg-amber-600/20" iconColor="text-amber-400" />
        <StatCard title="Wholesale Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} iconBg="bg-emerald-600/20" iconColor="text-emerald-400" />
        <StatCard title="Kegs Out" value={totalKegsOut} icon={Package} iconBg="bg-blue-600/20" iconColor="text-blue-400" />
        <StatCard title="Prospects" value={allAccounts.filter(a => a.status === 'prospect').length} icon={Truck} iconBg="bg-purple-600/20" iconColor="text-purple-400" />
      </div>

      {/* Filter + Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {(['all', 'active', 'prospect', 'inactive'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${filterStatus === s ? 'bg-amber-600/20 text-amber-300 border-amber-500/30' : 'bg-brewery-800/40 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 shadow-lg shadow-amber-600/20 whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-brewery-900/40 rounded-xl border border-brewery-700/30 border-dashed">
          <Truck className="w-10 h-10 text-brewery-600" />
          <p className="text-brewery-400 font-medium">No accounts yet</p>
          <p className="text-brewery-500 text-sm text-center max-w-xs">Add your first wholesale or distribution account to get started.</p>
          <button onClick={() => setShowAddModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(account => (
            <div key={account.id} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-brewery-100">{account.businessName}</h3>
                    <Badge variant={typeColors[account.type]}>{account.type.replace('-', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-brewery-400">{account.contactName}</p>
                </div>
                <Badge variant={account.status === 'active' ? 'green' : account.status === 'prospect' ? 'amber' : 'gray'}>{account.status}</Badge>
              </div>

              <div className="space-y-1 mb-3">
                {account.address && <p className="flex items-center gap-2 text-xs text-brewery-300"><MapPin className="w-3 h-3 text-brewery-500" />{account.address}</p>}
                {account.phone && <p className="flex items-center gap-2 text-xs text-brewery-300"><Phone className="w-3 h-3 text-brewery-500" />{account.phone}</p>}
                {account.email && <p className="flex items-center gap-2 text-xs text-brewery-300"><Mail className="w-3 h-3 text-brewery-500" />{account.email}</p>}
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="text-center p-2 rounded-lg bg-brewery-800/30">
                  <p className="text-xs font-bold text-brewery-200">{account.totalOrders}</p>
                  <p className="text-[10px] text-brewery-500">Orders</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-brewery-800/30">
                  <p className="text-xs font-bold text-emerald-400">${account.totalRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-brewery-500">Revenue</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-brewery-800/30">
                  <p className="text-xs font-bold text-blue-400">{account.kegsOut}</p>
                  <p className="text-[10px] text-brewery-500">Kegs Out</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-brewery-800/30">
                  <p className="text-xs font-bold text-brewery-200">{account.paymentTerms}</p>
                  <p className="text-[10px] text-brewery-500">Terms</p>
                </div>
              </div>

              {account.tapsCarrying.length > 0 && (
                <div>
                  <p className="text-[10px] text-brewery-500 mb-1">Currently Carrying:</p>
                  <div className="flex flex-wrap gap-1">
                    {account.tapsCarrying.map(tap => <Badge key={tap} variant="amber">{tap}</Badge>)}
                  </div>
                </div>
              )}

              {account.notes && <p className="text-xs text-brewery-400 mt-2 italic">{account.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title="Add Wholesale Account">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Business Name *</label>
            <input className={inputClass} value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Hill Country Taproom" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Contact Name</label>
              <input className={inputClass} value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Mike Johnson" />
            </div>
            <div>
              <label className={labelClass}>Account Type</label>
              <select className={inputClass} value={type} onChange={e => setType(e.target.value as WholesaleAccount['type'])}>
                {(['bar', 'restaurant', 'bottle-shop', 'grocery', 'event-venue'] as const).map(t => (
                  <option key={t} value={t}>{t.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="orders@taproom.com" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(830) 555-0100" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input className={inputClass} value={address} onChange={e => setAddress(e.target.value)} placeholder="456 Main St, San Antonio, TX 78201" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={status} onChange={e => setStatus(e.target.value as WholesaleAccount['status'])}>
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Credit Limit ($)</label>
              <input className={inputClass} type="number" min="0" step="500" value={creditLimit} onChange={e => setCreditLimit(e.target.value)} placeholder="5000" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Payment Terms</label>
            <select className={inputClass} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}>
              {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Prepaid'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea className={inputClass + ' resize-none'} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 px-4 py-2 rounded-lg border border-brewery-700/50 text-brewery-300 hover:text-brewery-100 text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-amber-600/20">
              Add Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
