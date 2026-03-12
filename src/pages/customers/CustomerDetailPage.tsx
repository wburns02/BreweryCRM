import { useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Star, Crown, Beer, MessageSquare, TrendingUp, Cake } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { useData } from '../../context/DataContext';

const tierColors = { Bronze: 'gray' as const, Silver: 'blue' as const, Gold: 'amber' as const, Platinum: 'purple' as const };

type Tab = 'overview' | 'visits' | 'notes' | 'preferences';

interface CustomerDetailPageProps {
  customerId: string;
  onBack: () => void;
}

export default function CustomerDetailPage({ customerId, onBack }: CustomerDetailPageProps) {
  const { customers, visitHistory, customerNotes } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const customer = customers.find(c => c.id === customerId);
  const visits = visitHistory[customerId] || [];
  const notes = customerNotes[customerId] || [];

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="text-brewery-400">Customer not found.</p>
        <button onClick={onBack} className="mt-4 text-amber-400 hover:text-amber-300 text-sm">Go Back</button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'visits', label: `Visits (${visits.length})` },
    { id: 'notes', label: `Notes (${notes.length})` },
    { id: 'preferences', label: 'Preferences' },
  ];

  const daysSinceVisit = Math.floor((Date.now() - new Date(customer.lastVisit).getTime()) / 86400000);

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-brewery-400 hover:text-amber-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-amber-600/20 flex items-center justify-center text-xl font-bold text-amber-400 flex-shrink-0">
            {customer.firstName[0]}{customer.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-brewery-50">{customer.firstName} {customer.lastName}</h1>
              {customer.mugClubMember && <Crown className="w-5 h-5 text-amber-400" />}
              <Badge variant={tierColors[customer.loyaltyTier]}>{customer.loyaltyTier}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-brewery-400">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {customer.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {customer.phone}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Member since {customer.firstVisit}</span>
              {customer.dateOfBirth && (() => {
                const dob = customer.dateOfBirth!;
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const parts = dob.split('-').map(Number);
                let bday = new Date(today.getFullYear(), parts[1] - 1, parts[2]);
                if (bday < today) bday = new Date(today.getFullYear() + 1, parts[1] - 1, parts[2]);
                const days = Math.round((bday.getTime() - today.getTime()) / 86400000);
                const age = bday.getFullYear() - parts[0];
                return (
                  <span className={`flex items-center gap-1 ${days === 0 ? 'text-rose-400 font-semibold' : days <= 7 ? 'text-pink-400' : 'text-brewery-400'}`}>
                    <Cake className="w-3.5 h-3.5" />
                    {days === 0 ? `Birthday today! (Turning ${age})` : days === 1 ? `Birthday tomorrow (Turning ${age})` : `Birthday in ${days} days (Turning ${age})`}
                  </span>
                );
              })()}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {customer.tags.map(tag => <Badge key={tag} variant="gray">{tag}</Badge>)}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
            <div className="text-center p-3 rounded-lg bg-brewery-800/40 border border-brewery-700/20">
              <p className="text-lg font-bold text-brewery-100">{customer.totalVisits}</p>
              <p className="text-[10px] text-brewery-500">Visits</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-brewery-800/40 border border-brewery-700/20">
              <p className="text-lg font-bold text-emerald-400">${Math.round(customer.totalSpent).toLocaleString()}</p>
              <p className="text-[10px] text-brewery-500">Total Spent</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-brewery-800/40 border border-brewery-700/20">
              <p className="text-lg font-bold text-amber-400">{customer.loyaltyPoints}</p>
              <p className="text-[10px] text-brewery-500">Points</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-brewery-800/40 border border-brewery-700/20">
              <p className="text-lg font-bold text-blue-400">${customer.avgTicket.toFixed(0)}</p>
              <p className="text-[10px] text-brewery-500">Avg Ticket</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brewery-700/30">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id ? 'text-amber-400 border-amber-500' : 'text-brewery-400 border-transparent hover:text-brewery-200'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-amber-400" /> Customer Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-brewery-400">Last Visit</span><span className="text-brewery-200">{customer.lastVisit} ({daysSinceVisit}d ago)</span></div>
              <div className="flex justify-between"><span className="text-brewery-400">Source</span><span className="text-brewery-200">{customer.source}</span></div>
              <div className="flex justify-between"><span className="text-brewery-400">Mug Club</span><span className="text-brewery-200">{customer.mugClubMember ? `${customer.mugClubTier} Member` : 'Not a member'}</span></div>
              {customer.dietaryRestrictions.length > 0 && (
                <div className="flex justify-between"><span className="text-brewery-400">Dietary</span><span className="text-brewery-200">{customer.dietaryRestrictions.join(', ')}</span></div>
              )}
              {customer.familyMembers && customer.familyMembers.length > 0 && (
                <div className="flex justify-between"><span className="text-brewery-400">Family</span><span className="text-brewery-200">{customer.familyMembers.map(f => `${f.name} (${f.relation}${f.age ? `, ${f.age}` : ''})`).join(', ')}</span></div>
              )}
            </div>
          </div>
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4 flex items-center gap-2"><Beer className="w-4 h-4 text-amber-400" /> Favorite Beers</h3>
            <div className="space-y-2">
              {customer.favoriteBeers.map(beer => (
                <div key={beer} className="flex items-center gap-2 p-2 rounded-lg bg-brewery-800/30">
                  <Beer className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-sm text-brewery-200">{beer}</span>
                </div>
              ))}
            </div>
            {customer.notes && (
              <div className="mt-4 p-3 rounded-lg bg-brewery-800/30 border border-brewery-700/20">
                <p className="text-xs text-brewery-400 mb-1">Staff Notes</p>
                <p className="text-sm text-brewery-300">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visits Tab */}
      {activeTab === 'visits' && (
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
          {visits.length === 0 ? (
            <p className="p-8 text-center text-brewery-400 text-sm">No visit history recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brewery-700/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Day</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-brewery-400 uppercase">Party</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-brewery-400 uppercase">Spent</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Beers</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-brewery-400 uppercase">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brewery-700/20">
                  {visits.map(v => (
                    <tr key={v.id} className="hover:bg-brewery-800/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-brewery-200">{v.date}</td>
                      <td className="px-4 py-3 text-sm text-brewery-400">{v.dayOfWeek}</td>
                      <td className="px-4 py-3 text-center text-sm text-brewery-300">{v.partySize}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-emerald-400">${v.totalSpent.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-brewery-300">{v.beersOrdered.map(b => b.beerName).join(', ')}</td>
                      <td className="px-4 py-3 text-center">{v.rating ? <span className="text-amber-400 text-sm">{v.rating}<Star className="w-3 h-3 inline ml-0.5" /></span> : <span className="text-brewery-600 text-sm">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-8 text-center">
              <p className="text-brewery-400 text-sm">No notes recorded yet.</p>
            </div>
          ) : (
            notes.map(note => {
              const typeColors: Record<string, string> = { note: 'text-blue-400', call: 'text-green-400', email: 'text-purple-400', complaint: 'text-red-400', compliment: 'text-amber-400', milestone: 'text-emerald-400' };
              return (
                <div key={note.id} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className={`w-4 h-4 ${typeColors[note.type] || 'text-brewery-400'}`} />
                      <Badge variant="gray">{note.type}</Badge>
                      <span className="text-xs text-brewery-400">{note.author}</span>
                    </div>
                    <span className="text-xs text-brewery-500">{note.date}</span>
                  </div>
                  <p className="text-sm text-brewery-300">{note.content}</p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4">Beer Preferences</h3>
            <div className="space-y-2">
              {customer.favoriteBeers.map(beer => (
                <div key={beer} className="flex items-center gap-2 p-2.5 rounded-lg bg-brewery-800/30">
                  <Beer className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-brewery-200">{beer}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {customer.dietaryRestrictions.length > 0 && (
              <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-brewery-200 mb-3">Dietary Restrictions</h3>
                <div className="flex flex-wrap gap-2">
                  {customer.dietaryRestrictions.map(d => <Badge key={d} variant="red">{d}</Badge>)}
                </div>
              </div>
            )}
            {customer.familyMembers && customer.familyMembers.length > 0 && (
              <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-brewery-200 mb-3">Family Members</h3>
                <div className="space-y-2">
                  {customer.familyMembers.map(fm => (
                    <div key={fm.name} className="flex justify-between items-center p-2.5 rounded-lg bg-brewery-800/30">
                      <span className="text-sm text-brewery-200">{fm.name}</span>
                      <span className="text-xs text-brewery-400">{fm.relation}{fm.age ? `, age ${fm.age}` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-brewery-200 mb-3">Visit Patterns</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-brewery-400">Average Ticket</span><span className="text-brewery-200">${customer.avgTicket.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-brewery-400">Total Visits</span><span className="text-brewery-200">{customer.totalVisits}</span></div>
                <div className="flex justify-between"><span className="text-brewery-400">Days Since Last Visit</span><span className={`${daysSinceVisit > 14 ? 'text-red-400' : 'text-brewery-200'}`}>{daysSinceVisit} days</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
