import { Truck, DollarSign, Package, Store, MapPin, Phone, Mail } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import { wholesaleAccounts } from '../../data/mockData';

const typeColors: Record<string, 'amber' | 'green' | 'blue' | 'purple' | 'red' | 'gray'> = {
  bar: 'purple', restaurant: 'amber', 'bottle-shop': 'green', grocery: 'blue', 'event-venue': 'red',
};

export default function DistributionPage() {
  const active = wholesaleAccounts.filter(a => a.status === 'active');
  const totalRevenue = wholesaleAccounts.reduce((s, a) => s + a.totalRevenue, 0);
  const totalKegsOut = wholesaleAccounts.reduce((s, a) => s + a.kegsOut, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Accounts" value={active.length} icon={Store} iconBg="bg-amber-600/20" iconColor="text-amber-400" />
        <StatCard title="Wholesale Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} iconBg="bg-emerald-600/20" iconColor="text-emerald-400" />
        <StatCard title="Kegs Out" value={totalKegsOut} icon={Package} iconBg="bg-blue-600/20" iconColor="text-blue-400" />
        <StatCard title="Prospects" value={wholesaleAccounts.filter(a => a.status === 'prospect').length} icon={Truck} iconBg="bg-purple-600/20" iconColor="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {wholesaleAccounts.map(account => (
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
              <p className="flex items-center gap-2 text-xs text-brewery-300"><MapPin className="w-3 h-3 text-brewery-500" />{account.address}</p>
              <p className="flex items-center gap-2 text-xs text-brewery-300"><Phone className="w-3 h-3 text-brewery-500" />{account.phone}</p>
              <p className="flex items-center gap-2 text-xs text-brewery-300"><Mail className="w-3 h-3 text-brewery-500" />{account.email}</p>
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
    </div>
  );
}
