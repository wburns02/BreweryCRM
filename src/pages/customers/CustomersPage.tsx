import { useState, useMemo } from 'react';
import { Search, Plus, Crown, ArrowUpDown, ChevronRight, Cake, Gift, Mail, Bell } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';
import CustomerDetailPage from './CustomerDetailPage';

const tierColors = { Bronze: 'gray' as const, Silver: 'blue' as const, Gold: 'amber' as const, Platinum: 'purple' as const };

type SortKey = 'name' | 'ltv' | 'lastVisit' | 'visits' | 'points';

function getBirthdayInfo(dateOfBirth?: string): { daysUntil: number; age: number } | null {
  if (!dateOfBirth) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const parts = dateOfBirth.split('-').map(Number);
  const birthYear = parts[0], month = parts[1], day = parts[2];
  let bday = new Date(today.getFullYear(), month - 1, day);
  if (bday < today) bday = new Date(today.getFullYear() + 1, month - 1, day);
  const daysUntil = Math.round((bday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const age = bday.getFullYear() - birthYear;
  return { daysUntil, age };
}

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
  const [formBirthday, setFormBirthday] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [showBirthdayPanel, setShowBirthdayPanel] = useState(true);

  // Upcoming birthdays (next 30 days)
  const upcomingBirthdays = useMemo(() => {
    return customers
      .filter(c => c.dateOfBirth)
      .map(c => ({ customer: c, ...getBirthdayInfo(c.dateOfBirth)! }))
      .filter(x => x.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [customers]);

  const todayBirthdays = upcomingBirthdays.filter(x => x.daysUntil === 0);
  const weekBirthdays = upcomingBirthdays.filter(x => x.daysUntil > 0 && x.daysUntil <= 7);

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
    setFormBirthday('');
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
      dateOfBirth: formBirthday || undefined,
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
        <div
          onClick={() => upcomingBirthdays.length > 0 && setShowBirthdayPanel(p => !p)}
          className={`bg-brewery-900/80 border rounded-xl p-4 text-center transition-all ${upcomingBirthdays.length > 0 ? 'border-pink-500/30 cursor-pointer hover:border-pink-500/50' : 'border-brewery-700/30'}`}
        >
          <div className="flex items-center justify-center gap-1">
            <p className={`text-2xl font-bold ${upcomingBirthdays.length > 0 ? 'text-pink-400' : 'text-brewery-400'}`}>{upcomingBirthdays.length}</p>
            {upcomingBirthdays.length > 0 && <Cake className="w-4 h-4 text-pink-400" />}
          </div>
          <p className="text-xs text-brewery-400">Birthdays (30d)</p>
        </div>
      </div>

      {/* Birthday Hub */}
      {upcomingBirthdays.length > 0 && showBirthdayPanel && (
        <div className="bg-gradient-to-r from-pink-900/30 via-rose-900/20 to-amber-900/20 border border-pink-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-400" />
              <h3 className="text-sm font-semibold text-pink-300">Birthday Hub</h3>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-xs font-medium">
                {upcomingBirthdays.length} upcoming
              </span>
              {todayBirthdays.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 text-xs font-bold animate-pulse">
                  {todayBirthdays.length} TODAY!
                </span>
              )}
            </div>
            <button onClick={() => setShowBirthdayPanel(false)} className="text-xs text-brewery-500 hover:text-brewery-300">Dismiss</button>
          </div>

          {/* Today's birthdays */}
          {todayBirthdays.map(({ customer, age }) => (
            <div key={customer.id} className="flex items-center justify-between p-3 mb-2 rounded-lg bg-rose-900/30 border border-rose-500/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-600/20 flex items-center justify-center text-sm font-bold text-rose-400">
                  {customer.firstName[0]}{customer.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-200">{customer.firstName} {customer.lastName}</p>
                  <p className="text-[10px] text-rose-400">🎂 Turning {age} today! {customer.mugClubMember ? '· Mug Club Member' : ''}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedId(customer.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg text-xs font-medium transition-colors"
                >
                  <Gift className="w-3 h-3" /> Send Perk
                </button>
                <button className="flex items-center gap-1 px-2 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg text-xs font-medium transition-colors">
                  <Mail className="w-3 h-3" /> Email
                </button>
              </div>
            </div>
          ))}

          {/* Upcoming birthdays list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            {upcomingBirthdays.filter(x => x.daysUntil > 0).map(({ customer, daysUntil, age }) => (
              <div key={customer.id}
                onClick={() => setSelectedId(customer.id)}
                className="flex items-center gap-2 p-2 rounded-lg bg-pink-900/20 border border-pink-500/10 hover:border-pink-500/30 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-pink-600/20 flex items-center justify-center text-xs font-bold text-pink-400 shrink-0">
                  {customer.firstName[0]}{customer.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-pink-200 truncate">{customer.firstName} {customer.lastName}</p>
                  <p className="text-[10px] text-pink-500">
                    {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`} · Turning {age}
                    {weekBirthdays.some(x => x.customer.id === customer.id) && (
                      <span className="ml-1 text-amber-400">· This week</span>
                    )}
                  </p>
                </div>
                {customer.mugClubMember && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-pink-500/10 flex items-center gap-4 text-[10px] text-pink-500">
            <span className="flex items-center gap-1"><Bell className="w-3 h-3" /> Auto-alerts: 7 days before</span>
            <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Free pint perk for Mug Club members</span>
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email campaigns linked to Marketing</span>
          </div>
        </div>
      )}

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
                {(() => { const b = getBirthdayInfo(customer.dateOfBirth); return b && b.daysUntil <= 7 ? <Cake className={`w-4 h-4 ${b.daysUntil === 0 ? 'text-rose-400 animate-bounce' : 'text-pink-400'}`} /> : null; })()}
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
                <p className="text-xs font-bold text-emerald-400">${Math.round(customer.totalSpent).toLocaleString()}</p>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} className={inputClass} placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className={labelClass}>Birthday <span className="text-brewery-500">(optional)</span></label>
              <input type="date" value={formBirthday} onChange={e => setFormBirthday(e.target.value)} className={inputClass} />
            </div>
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
