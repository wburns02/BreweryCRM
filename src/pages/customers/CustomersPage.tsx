import { useState, useMemo } from 'react';
import { Search, Plus, Crown, ArrowUpDown, ChevronRight } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';
import CustomerDetailPage from './CustomerDetailPage';

const tierColors = { Bronze: 'gray' as const, Silver: 'blue' as const, Gold: 'amber' as const, Platinum: 'purple' as const };

type SortKey = 'name' | 'ltv' | 'lastVisit' | 'visits' | 'points';

const inputClass = 'w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50';
const labelClass = 'block text-xs font-medium text-brewery-400 mb-1';

export default function CustomersPage() {
  const { customers, addCustomer } = useBrewery();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filtered = useMemo(() => {
    let list = customers.filter(c => {
      const matchSearch = `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase());
      const matchTag = filterTag === 'all' || c.tags.includes(filterTag) || (filterTag === 'mug-club' && c.mugClubMember);
      return matchSearch && matchTag;
    });
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'ltv': return b.totalSpent - a.totalSpent;
        case 'lastVisit': return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        case 'visits': return b.totalVisits - a.totalVisits;
        case 'points': return b.loyaltyPoints - a.loyaltyPoints;
        default: return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      }
    });
    return list;
  }, [customers, search, filterTag, sortBy]);

  const tags = ['all', 'regular', 'vip', 'mug-club', 'family', 'na-drinker', 'new'];

  const resetForm = () => {
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormPhone('');
    setFormNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    addCustomer({
      firstName: formFirstName.trim(),
      lastName: formLastName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      firstVisit: today,
      lastVisit: today,
      totalVisits: 0,
      totalSpent: 0,
      avgTicket: 0,
      favoriteBeers: [],
      dietaryRestrictions: [],
      tags: ['new'],
      loyaltyPoints: 0,
      loyaltyTier: 'Bronze',
      mugClubMember: false,
      notes: formNotes.trim(),
      source: 'walk-in',
    });
    toast('success', `${formFirstName} ${formLastName} added as a new guest!`);
    resetForm();
    setShowAddModal(false);
  };

  if (selectedId) {
    return <CustomerDetailPage customerId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-brewery-500" />
            <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-brewery-200 placeholder-brewery-500 outline-none w-full" />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-brewery-500" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)} className="bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-200 outline-none">
              <option value="name">Name</option>
              <option value="ltv">Lifetime Value</option>
              <option value="lastVisit">Last Visit</option>
              <option value="visits">Total Visits</option>
              <option value="points">Loyalty Points</option>
            </select>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 shadow-lg shadow-amber-600/20">
            <Plus className="w-4 h-4" /> Add Guest
          </button>
        </div>
      </div>

      {/* Filter Tags */}
      <div className="flex gap-2 flex-wrap">
        {tags.map(tag => (
          <button key={tag} onClick={() => setFilterTag(tag)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${filterTag === tag ? 'bg-amber-600/20 text-amber-300 border-amber-500/30' : 'bg-brewery-800/40 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'}`}>
            {tag === 'all' ? 'All Guests' : tag === 'mug-club' ? 'Mug Club' : tag === 'na-drinker' ? 'NA Drinkers' : tag.charAt(0).toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-brewery-50">{customers.length}</p>
          <p className="text-xs text-brewery-400">Total Guests</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{customers.filter(c => c.mugClubMember).length}</p>
          <p className="text-xs text-brewery-400">Mug Club Members</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">${Math.round(customers.reduce((s, c) => s + c.totalSpent, 0)).toLocaleString()}</p>
          <p className="text-xs text-brewery-400">Total Revenue</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">${customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.avgTicket, 0) / customers.length) : 0}</p>
          <p className="text-xs text-brewery-400">Avg Ticket</p>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(customer => (
          <div key={customer.id} onClick={() => setSelectedId(customer.id)} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/20 cursor-pointer transition-all duration-300 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center text-sm font-bold text-amber-400">
                  {customer.firstName[0]}{customer.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brewery-100 group-hover:text-amber-300 transition-colors">{customer.firstName} {customer.lastName}</p>
                  <p className="text-[10px] text-brewery-400">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {customer.mugClubMember && <Crown className="w-4 h-4 text-amber-400" />}
                <ChevronRight className="w-4 h-4 text-brewery-600 group-hover:text-amber-400 transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 rounded-lg bg-brewery-800/30">
                <p className="text-xs font-bold text-brewery-100">{customer.totalVisits}</p>
                <p className="text-[10px] text-brewery-500">Visits</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-brewery-800/30">
                <p className="text-xs font-bold text-emerald-400">${customer.totalSpent.toLocaleString()}</p>
                <p className="text-[10px] text-brewery-500">Spent</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-brewery-800/30">
                <p className="text-xs font-bold text-amber-400">{customer.loyaltyPoints}</p>
                <p className="text-[10px] text-brewery-500">Points</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant={tierColors[customer.loyaltyTier]}>{customer.loyaltyTier}</Badge>
              {customer.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="gray">{tag}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Guest Modal */}
      <Modal open={showAddModal} onClose={() => { resetForm(); setShowAddModal(false); }} title="Add New Guest">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name *</label>
              <input type="text" required value={formFirstName} onChange={e => setFormFirstName(e.target.value)} className={inputClass} placeholder="John" />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input type="text" required value={formLastName} onChange={e => setFormLastName(e.target.value)} className={inputClass} placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className={inputClass} placeholder="john@example.com" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} className={inputClass} placeholder="(555) 123-4567" />
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3} className={inputClass} placeholder="Any preferences, allergies, or special notes..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { resetForm(); setShowAddModal(false); }} className="px-4 py-2 rounded-lg text-sm text-brewery-400 hover:text-brewery-200 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              Add Guest
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
