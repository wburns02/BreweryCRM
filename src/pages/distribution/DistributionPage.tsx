import { useState } from 'react';
import { Truck, DollarSign, Package, Store, MapPin, Phone, Mail, Plus, ClipboardList, Calendar, FileText, ShoppingCart } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';
import SlidePanel from '../../components/ui/SlidePanel';
import { useData } from '../../context/DataContext';
import { useToast } from '../../components/ui/ToastProvider';
import type { WholesaleAccount } from '../../types';

interface WholesaleOrder {
  id: string;
  accountId: string;
  accountName: string;
  date: string;
  deliveryDate: string;
  beer: string;
  kegs: number;
  pricePerKeg: number;
  amount: number;
  status: 'pending' | 'shipped' | 'delivered';
  notes: string;
}

// Mock order history per account (last 5 orders)
function mockOrders(account: WholesaleAccount) {
  if (account.totalOrders === 0) return [];
  const beers = ['Hill Country Haze', 'Bulverde Blonde', 'Citra Smash IPA', 'Smoked Porter', 'Texas Sunset Wheat'];
  return Array.from({ length: Math.min(account.totalOrders, 5) }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i + 1) * 12);
    return {
      id: `ORD-${account.id.substring(0, 4).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      date: d.toISOString().split('T')[0],
      beers: [beers[i % beers.length]],
      kegs: Math.floor(Math.random() * 3) + 1,
      amount: (Math.floor(Math.random() * 3) + 1) * 180,
      status: i === 0 ? 'pending' : i === 1 ? 'shipped' : 'delivered',
    };
  });
}

const typeColors: Record<string, 'amber' | 'green' | 'blue' | 'purple' | 'red' | 'gray'> = {
  bar: 'purple', restaurant: 'amber', 'bottle-shop': 'green', grocery: 'blue', 'event-venue': 'red',
};

const inputClass = 'w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50';
const labelClass = 'block text-xs font-medium text-brewery-400 mb-1';

export default function DistributionPage() {
  const { wholesaleAccounts: apiAccounts } = useData();
  const { toast } = useToast();
  const [localAccounts, setLocalAccounts] = useState<WholesaleAccount[]>([]);
  const [localOrders, setLocalOrders] = useState<WholesaleOrder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'accounts' | 'orders'>('accounts');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'prospect' | 'inactive'>('all');
  const [orderFilterStatus, setOrderFilterStatus] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');
  const [orderFilterAccount, setOrderFilterAccount] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<WholesaleAccount | null>(null);

  // Account form state
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

  // Order form state
  const [orderAccount, setOrderAccount] = useState('');
  const [orderBeer, setOrderBeer] = useState('');
  const [orderKegs, setOrderKegs] = useState('1');
  const [orderPricePerKeg, setOrderPricePerKeg] = useState('180');
  const [orderDeliveryDate, setOrderDeliveryDate] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
  const [orderStatus, setOrderStatus] = useState<WholesaleOrder['status']>('pending');
  const [orderNotes, setOrderNotes] = useState('');

  const allAccounts = [...apiAccounts, ...localAccounts];
  const filtered = filterStatus === 'all' ? allAccounts : allAccounts.filter(a => a.status === filterStatus);

  // Build all orders: seed mock orders from API accounts + local orders
  const allMockOrders: WholesaleOrder[] = apiAccounts.flatMap(acc =>
    mockOrders(acc).map((o) => ({
      id: o.id,
      accountId: acc.id,
      accountName: acc.businessName,
      date: o.date,
      deliveryDate: (() => { const d = new Date(o.date); d.setDate(d.getDate() + 3); return d.toISOString().split('T')[0]; })(),
      beer: o.beers[0],
      kegs: o.kegs,
      pricePerKeg: Math.round(o.amount / o.kegs),
      amount: o.amount,
      status: o.status as WholesaleOrder['status'],
      notes: '',
    }))
  );
  const allOrders = [...localOrders, ...allMockOrders].sort((a, b) => b.date.localeCompare(a.date));
  const filteredOrders = allOrders.filter(o => {
    if (orderFilterStatus !== 'all' && o.status !== orderFilterStatus) return false;
    if (orderFilterAccount !== 'all' && o.accountId !== orderFilterAccount) return false;
    return true;
  });

  const pendingOrders = allOrders.filter(o => o.status === 'pending');
  const shippedOrders = allOrders.filter(o => o.status === 'shipped');
  const orderRevenue = allOrders.reduce((s, o) => s + o.amount, 0);
  const pendingKegs = pendingOrders.reduce((s, o) => s + o.kegs, 0) + shippedOrders.reduce((s, o) => s + o.kegs, 0);

  const updateOrderStatus = (orderId: string, newStatus: WholesaleOrder['status']) => {
    setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast('success', `Order ${orderId} marked as ${newStatus}`);
  };
  const active = allAccounts.filter(a => a.status === 'active');

  const resetForm = () => {
    setBusinessName(''); setContactName(''); setEmail(''); setPhone('');
    setAddress(''); setType('bar'); setStatus('prospect');
    setCreditLimit(''); setPaymentTerms('Net 30'); setNotes('');
  };

  const resetOrderForm = () => {
    setOrderAccount(''); setOrderBeer(''); setOrderKegs('1'); setOrderPricePerKeg('180');
    setOrderDeliveryDate(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
    setOrderStatus('pending'); setOrderNotes('');
  };

  const openOrderModal = (prefilledAccountId?: string) => {
    resetOrderForm();
    setOrderAccount(prefilledAccountId ?? '');
    setShowOrderModal(true);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acctId = orderAccount;
    const acct = allAccounts.find(a => a.id === acctId);
    if (!acctId || !orderBeer.trim()) { toast('error', 'Select an account and enter a beer/product'); return; }
    const kegs = parseInt(orderKegs) || 1;
    const ppk = parseFloat(orderPricePerKeg) || 180;
    const amount = kegs * ppk;
    const newOrder: WholesaleOrder = {
      id: `ORD-${acctId.substring(0, 4).toUpperCase()}-${String(Date.now()).slice(-4)}`,
      accountId: acctId,
      accountName: acct?.businessName ?? '',
      date: new Date().toISOString().split('T')[0],
      deliveryDate: orderDeliveryDate,
      beer: orderBeer.trim(),
      kegs,
      pricePerKeg: ppk,
      amount,
      status: orderStatus,
      notes: orderNotes.trim(),
    };
    setLocalOrders(prev => [newOrder, ...prev]);
    // Update account stats locally
    setLocalAccounts(prev => {
      const existing = prev.find(a => a.id === acctId);
      if (existing) {
        return prev.map(a => a.id === acctId ? { ...a, totalOrders: a.totalOrders + 1, totalRevenue: a.totalRevenue + amount, kegsOut: a.kegsOut + kegs } : a);
      }
      return prev;
    });
    toast('success', `Order logged: ${kegs} keg${kegs > 1 ? 's' : ''} of ${orderBeer.trim()} → ${acct?.businessName}`);
    resetOrderForm();
    setShowOrderModal(false);
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
        <StatCard title="Wholesale Revenue" value={`$${orderRevenue.toLocaleString()}`} icon={DollarSign} iconBg="bg-emerald-600/20" iconColor="text-emerald-400" />
        <StatCard title="Kegs In Transit" value={pendingKegs} icon={Package} iconBg="bg-blue-600/20" iconColor="text-blue-400" />
        <StatCard title="Open Orders" value={pendingOrders.length + shippedOrders.length} icon={ShoppingCart} iconBg="bg-purple-600/20" iconColor="text-purple-400" />
      </div>

      {/* Tab Nav + Action Buttons */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 bg-brewery-800/40 p-1 rounded-xl border border-brewery-700/30">
          <button onClick={() => setActiveTab('accounts')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'accounts' ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30' : 'text-brewery-400 hover:text-brewery-200'}`}>
            <Store className="w-4 h-4 inline mr-1.5" />Accounts ({allAccounts.length})
          </button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-brewery-400 hover:text-brewery-200'}`}>
            <ClipboardList className="w-4 h-4 inline mr-1.5" />Orders ({allOrders.length})
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openOrderModal()} disabled={allAccounts.length === 0} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 whitespace-nowrap">
            <ShoppingCart className="w-4 h-4" /> Log Order
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 shadow-lg shadow-amber-600/20 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </div>
      </div>

      {/* ── ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-1">
              {(['all', 'pending', 'shipped', 'delivered'] as const).map(s => (
                <button key={s} onClick={() => setOrderFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${orderFilterStatus === s ? 'bg-blue-600/20 text-blue-300 border-blue-500/30' : 'bg-brewery-800/40 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  {s !== 'all' && ` (${allOrders.filter(o => o.status === s).length})`}
                </button>
              ))}
            </div>
            <select
              value={orderFilterAccount}
              onChange={e => setOrderFilterAccount(e.target.value)}
              className="bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-1.5 text-xs text-brewery-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            >
              <option value="all">All Accounts</option>
              {allAccounts.map(a => <option key={a.id} value={a.id}>{a.businessName}</option>)}
            </select>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-brewery-900/40 rounded-xl border border-brewery-700/30 border-dashed">
              <ClipboardList className="w-10 h-10 text-brewery-600" />
              <p className="text-brewery-400 font-medium">No orders found</p>
              <button onClick={() => openOrderModal()} disabled={allAccounts.length === 0} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Log First Order
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 hover:border-blue-500/20 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-brewery-500">{order.id}</span>
                        <Badge variant={order.status === 'delivered' ? 'green' : order.status === 'shipped' ? 'blue' : 'amber'}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-brewery-100">{order.accountName}</p>
                      <p className="text-xs text-brewery-300 mt-0.5">
                        {order.beer} · {order.kegs} keg{order.kegs !== 1 ? 's' : ''} @ ${order.pricePerKeg}/keg
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-brewery-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Ordered {order.date}</span>
                        <span className="flex items-center gap-1"><Truck className="w-3 h-3" />Deliver by {order.deliveryDate}</span>
                      </div>
                      {order.notes && <p className="text-xs text-brewery-500 mt-1 italic">{order.notes}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-emerald-400">${order.amount.toLocaleString()}</p>
                      {/* Status advancement — only for local orders */}
                      {localOrders.some(lo => lo.id === order.id) && order.status !== 'delivered' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, order.status === 'pending' ? 'shipped' : 'delivered')}
                          className="mt-2 text-xs px-2.5 py-1 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/20 text-blue-300 rounded-lg font-medium transition-all"
                        >
                          Mark {order.status === 'pending' ? 'Shipped' : 'Delivered'} →
                        </button>
                      )}
                      {(order.status === 'delivered' || order.status === 'shipped') && (
                        <button
                          onClick={() => {
                            const acc = allAccounts.find(a => a.id === order.accountId);
                            const lines = [
                              `INVOICE — Bearded Hop Brewery`,
                              `To: ${order.accountName}`,
                              `Contact: ${acc?.contactName ?? ''}`,
                              `Date: ${new Date().toLocaleDateString()}`,
                              ``,
                              `Order: ${order.id}`,
                              `Order Date: ${order.date}`,
                              `Delivery Date: ${order.deliveryDate}`,
                              `Items: ${order.beer}`,
                              `Kegs: ${order.kegs} × $${order.pricePerKeg}`,
                              `Amount Due: $${order.amount}`,
                              `Payment Terms: ${acc?.paymentTerms ?? 'Net 30'}`,
                              ``,
                              `Thank you for your business!`,
                              `Bearded Hop Brewery · Bulverde, TX`,
                            ];
                            const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = `Invoice-${order.id}.txt`; a.click();
                            URL.revokeObjectURL(url);
                            toast('success', `Invoice ${order.id} downloaded`);
                          }}
                          className="mt-1 flex items-center gap-1 text-[10px] text-brewery-500 hover:text-brewery-300 transition-colors"
                        >
                          <FileText className="w-3 h-3" /> Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ACCOUNTS TAB ── */}
      {activeTab === 'accounts' && (
        <div className="flex gap-2">
          {(['all', 'active', 'prospect', 'inactive'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${filterStatus === s ? 'bg-amber-600/20 text-amber-300 border-amber-500/30' : 'bg-brewery-800/40 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}
      {activeTab === 'accounts' && (filtered.length === 0 ? (
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
            <div key={account.id} onClick={() => setSelectedAccount(account)} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/20 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-brewery-100 group-hover:text-amber-300 transition-colors">{account.businessName}</h3>
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
      ))}

      {/* Account Detail Panel */}
      <SlidePanel isOpen={!!selectedAccount} onClose={() => setSelectedAccount(null)} title={selectedAccount?.businessName ?? ''}>
        {selectedAccount && (() => {
          const mock = mockOrders(selectedAccount);
          const logged = localOrders.filter(o => o.accountId === selectedAccount.id).map(o => ({
            id: o.id, date: o.date, beers: [o.beer], kegs: o.kegs, amount: o.amount, status: o.status,
          }));
          const orders = [...logged, ...mock];
          return (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Badge variant={typeColors[selectedAccount.type]}>{selectedAccount.type.replace('-', ' ')}</Badge>
                <Badge variant={selectedAccount.status === 'active' ? 'green' : selectedAccount.status === 'prospect' ? 'amber' : 'gray'}>{selectedAccount.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-brewery-800/40 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-brewery-100">{selectedAccount.totalOrders}</p>
                  <p className="text-xs text-brewery-400">Total Orders</p>
                </div>
                <div className="bg-brewery-800/40 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">${selectedAccount.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-brewery-400">Revenue</p>
                </div>
                <div className="bg-brewery-800/40 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-blue-400">{selectedAccount.kegsOut}</p>
                  <p className="text-xs text-brewery-400">Kegs Out</p>
                </div>
                <div className="bg-brewery-800/40 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-amber-400">{selectedAccount.paymentTerms}</p>
                  <p className="text-xs text-brewery-400">Terms</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {selectedAccount.contactName && (
                  <div className="flex items-center gap-2 text-brewery-300"><Store className="w-4 h-4 text-brewery-500" />{selectedAccount.contactName}</div>
                )}
                {selectedAccount.phone && (
                  <div className="flex items-center gap-2 text-brewery-300"><Phone className="w-4 h-4 text-brewery-500" />{selectedAccount.phone}</div>
                )}
                {selectedAccount.email && (
                  <div className="flex items-center gap-2 text-brewery-300"><Mail className="w-4 h-4 text-brewery-500" />{selectedAccount.email}</div>
                )}
                {selectedAccount.address && (
                  <div className="flex items-center gap-2 text-brewery-300"><MapPin className="w-4 h-4 text-brewery-500" />{selectedAccount.address}</div>
                )}
              </div>

              {selectedAccount.tapsCarrying.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Currently Carrying</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAccount.tapsCarrying.map(t => <Badge key={t} variant="amber">{t}</Badge>)}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider">Order History</h4>
                  <button
                    onClick={() => { setSelectedAccount(null); openOrderModal(selectedAccount.id); }}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" /> Log Order
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-6 bg-brewery-800/20 rounded-xl border border-brewery-700/20 border-dashed">
                    <ClipboardList className="w-8 h-8 text-brewery-600 mx-auto mb-2" />
                    <p className="text-sm text-brewery-400">No orders yet</p>
                    <button
                      onClick={() => { setSelectedAccount(null); openOrderModal(selectedAccount.id); }}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                    >Log first order →</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map(order => (
                      <div key={order.id} className="p-3 bg-brewery-800/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-brewery-200">{order.id}</p>
                            <p className="text-[10px] text-brewery-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{order.date}</p>
                            <p className="text-[10px] text-brewery-400">{order.beers.join(', ')} · {order.kegs} keg{order.kegs > 1 ? 's' : ''}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-400">${order.amount}</p>
                            <Badge variant={order.status === 'delivered' ? 'green' : order.status === 'shipped' ? 'blue' : 'amber'}>{order.status}</Badge>
                          </div>
                        </div>
                        {(order.status === 'delivered' || order.status === 'shipped') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const acc = selectedAccount!;
                              const lines = [
                                `INVOICE — Bearded Hop Brewery`,
                                `To: ${acc.businessName}`,
                                `Contact: ${acc.contactName}`,
                                `Date: ${new Date().toLocaleDateString()}`,
                                ``,
                                `Order: ${order.id}`,
                                `Order Date: ${order.date}`,
                                `Items: ${order.beers.join(', ')}`,
                                `Kegs: ${order.kegs}`,
                                `Amount Due: $${order.amount}`,
                                `Payment Terms: ${acc.paymentTerms}`,
                                ``,
                                `Thank you for your business!`,
                              ];
                              const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `Invoice-${order.id}.txt`;
                              a.click();
                              URL.revokeObjectURL(url);
                              toast('success', `Invoice ${order.id} downloaded`);
                            }}
                            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/20 text-blue-300 rounded-lg text-xs font-semibold transition-all"
                          >
                            <FileText className="w-3 h-3" /> Download Invoice
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedAccount.notes && (
                <div className="bg-brewery-800/20 rounded-xl p-3">
                  <p className="text-xs text-brewery-400 italic">{selectedAccount.notes}</p>
                </div>
              )}
            </div>
          );
        })()}
      </SlidePanel>

      {/* Log Order Modal */}
      <Modal open={showOrderModal} onClose={() => { setShowOrderModal(false); resetOrderForm(); }} title="Log Wholesale Order">
        <form onSubmit={handleOrderSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Account *</label>
            <select className={inputClass} value={orderAccount} onChange={e => setOrderAccount(e.target.value)} required>
              <option value="">Select account...</option>
              {allAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.businessName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Beer / Product *</label>
            <input className={inputClass} value={orderBeer} onChange={e => setOrderBeer(e.target.value)} placeholder="Hill Country Haze IPA" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Quantity (kegs)</label>
              <input className={inputClass} type="number" min="1" value={orderKegs} onChange={e => setOrderKegs(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Price / Keg ($)</label>
              <input className={inputClass} type="number" min="0" step="5" value={orderPricePerKeg} onChange={e => setOrderPricePerKeg(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Delivery Date</label>
              <input className={inputClass} type="date" value={orderDeliveryDate} onChange={e => setOrderDeliveryDate(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={orderStatus} onChange={e => setOrderStatus(e.target.value as WholesaleOrder['status'])}>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea className={inputClass + ' resize-none'} rows={2} value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="Any special instructions..." />
          </div>
          {orderAccount && orderKegs && orderPricePerKeg && (
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm font-semibold text-blue-300">
                Order Total: ${(parseInt(orderKegs) * parseFloat(orderPricePerKeg) || 0).toLocaleString()}
              </p>
              <p className="text-xs text-brewery-400">{orderKegs} keg{parseInt(orderKegs) !== 1 ? 's' : ''} × ${orderPricePerKeg}/keg</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowOrderModal(false); resetOrderForm(); }} className="flex-1 px-4 py-2 rounded-lg border border-brewery-700/50 text-brewery-300 hover:text-brewery-100 text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-blue-600/20">
              Log Order
            </button>
          </div>
        </form>
      </Modal>

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
