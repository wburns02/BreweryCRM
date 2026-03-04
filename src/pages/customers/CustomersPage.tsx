import { useState } from 'react';
import { Search, Plus, Crown, Star, Calendar, DollarSign, Heart } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { customers } from '../../data/mockData';
import type { Customer } from '../../types';

const tierColors = { Bronze: 'gray' as const, Silver: 'blue' as const, Gold: 'amber' as const, Platinum: 'purple' as const };

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = customers.filter(c => {
    const matchSearch = `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase());
    const matchTag = filterTag === 'all' || c.tags.includes(filterTag) || (filterTag === 'mug-club' && c.mugClubMember);
    return matchSearch && matchTag;
  });

  const tags = ['all', 'regular', 'vip', 'mug-club', 'family', 'na-drinker', 'new'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-brewery-500" />
            <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-brewery-200 placeholder-brewery-500 outline-none w-full" />
          </div>
          <button className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 shadow-lg shadow-amber-600/20">
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
          <p className="text-2xl font-bold text-blue-400">${Math.round(customers.reduce((s, c) => s + c.avgTicket, 0) / customers.length)}</p>
          <p className="text-xs text-brewery-400">Avg Ticket</p>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(customer => (
          <div key={customer.id} onClick={() => setSelected(customer)} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/20 cursor-pointer transition-all duration-300 group">
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
              {customer.mugClubMember && <Crown className="w-4 h-4 text-amber-400" />}
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

      {/* Customer Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.firstName} ${selected.lastName}` : ''} size="lg">
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-brewery-800/30 text-center">
                <Calendar className="w-4 h-4 text-brewery-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-brewery-100">{selected.totalVisits}</p>
                <p className="text-[10px] text-brewery-500">Total Visits</p>
              </div>
              <div className="p-3 rounded-lg bg-brewery-800/30 text-center">
                <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-emerald-400">${selected.totalSpent.toLocaleString()}</p>
                <p className="text-[10px] text-brewery-500">Total Spent</p>
              </div>
              <div className="p-3 rounded-lg bg-brewery-800/30 text-center">
                <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-amber-400">{selected.loyaltyPoints}</p>
                <p className="text-[10px] text-brewery-500">Loyalty Points</p>
              </div>
              <div className="p-3 rounded-lg bg-brewery-800/30 text-center">
                <Heart className="w-4 h-4 text-red-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-brewery-100">{selected.loyaltyTier}</p>
                <p className="text-[10px] text-brewery-500">Tier</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Contact Info</h4>
              <p className="text-sm text-brewery-200">{selected.email}</p>
              <p className="text-sm text-brewery-200">{selected.phone}</p>
              <p className="text-sm text-brewery-400 mt-1">First visit: {selected.firstVisit} · Last visit: {selected.lastVisit}</p>
              <p className="text-sm text-brewery-400">Source: {selected.source}</p>
            </div>

            {selected.favoriteBeers.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Favorite Beers</h4>
                <div className="flex flex-wrap gap-2">
                  {selected.favoriteBeers.map(beer => <Badge key={beer} variant="amber">{beer}</Badge>)}
                </div>
              </div>
            )}

            {selected.familyMembers && selected.familyMembers.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Family Members</h4>
                <div className="space-y-1">
                  {selected.familyMembers.map(fm => (
                    <p key={fm.name} className="text-sm text-brewery-200">{fm.name} ({fm.relation}{fm.age ? `, age ${fm.age}` : ''})</p>
                  ))}
                </div>
              </div>
            )}

            {selected.notes && (
              <div>
                <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Notes</h4>
                <p className="text-sm text-brewery-200">{selected.notes}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {selected.tags.map(tag => <Badge key={tag} variant="gray">{tag}</Badge>)}
              {selected.dietaryRestrictions.map(d => <Badge key={d} variant="red">{d}</Badge>)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
