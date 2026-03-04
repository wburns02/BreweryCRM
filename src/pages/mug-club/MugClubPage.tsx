import { Crown, Users, DollarSign, TrendingUp, Gift } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import { mugClubMembers } from '../../data/mockData';

const tierColors: Record<string, 'amber' | 'purple' | 'blue'> = { Standard: 'blue', Premium: 'amber', Founding: 'purple' };
const tierPrices = { Standard: 99, Premium: 199, Founding: 299 };

export default function MugClubPage() {
  const activeMembers = mugClubMembers.filter(m => m.status === 'active');
  const totalSaved = mugClubMembers.reduce((s, m) => s + m.totalSaved, 0);
  const totalReferrals = mugClubMembers.reduce((s, m) => s + m.referrals, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/40 via-purple-900/30 to-brewery-900 border border-amber-500/20 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-8 h-8 text-amber-400" />
          <h2 className="text-2xl font-bold text-brewery-50" style={{ fontFamily: 'var(--font-display)' }}>Bulverde Brew Society</h2>
        </div>
        <p className="text-sm text-brewery-300 max-w-2xl">Exclusive mug club membership program. Members enjoy oversized pours, discounts, member-only releases, and VIP access to special events.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Members" value={activeMembers.length} icon={Users} iconBg="bg-amber-600/20" iconColor="text-amber-400" change={15} />
        <StatCard title="Total Saved (Members)" value={`$${totalSaved.toLocaleString()}`} icon={DollarSign} iconBg="bg-emerald-600/20" iconColor="text-emerald-400" />
        <StatCard title="Referrals" value={totalReferrals} icon={Gift} iconBg="bg-purple-600/20" iconColor="text-purple-400" />
        <StatCard title="Annual Revenue" value={`$${(activeMembers.length * 150).toLocaleString()}`} icon={TrendingUp} iconBg="bg-blue-600/20" iconColor="text-blue-400" />
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['Standard', 'Premium', 'Founding'] as const).map(tier => {
          const members = mugClubMembers.filter(m => m.tier === tier);
          return (
            <div key={tier} className={`bg-brewery-900/80 border rounded-xl p-5 ${tier === 'Founding' ? 'border-purple-500/30' : tier === 'Premium' ? 'border-amber-500/30' : 'border-brewery-700/30'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Crown className={`w-5 h-5 ${tier === 'Founding' ? 'text-purple-400' : tier === 'Premium' ? 'text-amber-400' : 'text-blue-400'}`} />
                  <h3 className="text-lg font-semibold text-brewery-100">{tier}</h3>
                </div>
                <span className="text-sm font-bold text-brewery-300">${tierPrices[tier]}/yr</span>
              </div>
              <p className="text-xs text-brewery-400 mb-3">{members.length} members</p>
              <div className="space-y-2">
                {tier === 'Standard' && (
                  <>
                    <p className="text-xs text-brewery-300">• 20oz pour at pint price</p>
                    <p className="text-xs text-brewery-300">• Birthday free pint</p>
                    <p className="text-xs text-brewery-300">• Member newsletter</p>
                  </>
                )}
                {tier === 'Premium' && (
                  <>
                    <p className="text-xs text-brewery-300">• 20oz pour at pint price</p>
                    <p className="text-xs text-brewery-300">• 10% off merchandise</p>
                    <p className="text-xs text-brewery-300">• Member-only releases</p>
                    <p className="text-xs text-brewery-300">• 2 guest passes/month</p>
                  </>
                )}
                {tier === 'Founding' && (
                  <>
                    <p className="text-xs text-brewery-300">• 20oz pour at pint price</p>
                    <p className="text-xs text-brewery-300">• 15% off everything</p>
                    <p className="text-xs text-brewery-300">• All member-only releases</p>
                    <p className="text-xs text-brewery-300">• Annual appreciation dinner</p>
                    <p className="text-xs text-brewery-300">• Founding member plaque</p>
                    <p className="text-xs text-brewery-300">• Name on brewery wall</p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Member List */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-brewery-700/30 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brewery-200">All Members</h3>
          <button className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2">
            <Crown className="w-3.5 h-3.5" /> Add Member
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brewery-700/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Mug #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Since</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Renewal</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-brewery-400 uppercase">Visits</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-brewery-400 uppercase">Saved</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-brewery-400 uppercase">Referrals</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brewery-700/20">
              {mugClubMembers.map(member => (
                <tr key={member.id} className="hover:bg-brewery-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-amber-400">#{member.mugNumber.toString().padStart(3, '0')}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-brewery-100">{member.customerName}</p>
                    <p className="text-[10px] text-brewery-400">{member.mugLocation}</p>
                  </td>
                  <td className="px-4 py-3"><Badge variant={tierColors[member.tier]}>{member.tier}</Badge></td>
                  <td className="px-4 py-3 text-sm text-brewery-300">{member.memberSince}</td>
                  <td className="px-4 py-3 text-sm text-brewery-300">{member.renewalDate}</td>
                  <td className="px-4 py-3 text-sm text-brewery-200 text-right">{member.visitsAsMemeber}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400 text-right font-medium">${member.totalSaved.toFixed(0)}</td>
                  <td className="px-4 py-3 text-sm text-brewery-200 text-right">{member.referrals}</td>
                  <td className="px-4 py-3"><Badge variant={member.status === 'active' ? 'green' : member.status === 'expiring-soon' ? 'amber' : 'red'}>{member.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
