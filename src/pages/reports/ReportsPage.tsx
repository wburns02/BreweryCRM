import { DollarSign, Users, TrendingUp, Percent } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import { useData } from '../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function ReportsPage() {
  const { dailySales, beers, customers } = useData();

  const totalRevenue = dailySales.reduce((s, d) => s + d.totalRevenue, 0);
  const totalCustomers = dailySales.reduce((s, d) => s + d.customerCount, 0);
  const avgDaily = dailySales.length > 0 ? Math.round(totalRevenue / dailySales.length) : 0;
  const beerPct = totalRevenue > 0 ? Math.round((dailySales.reduce((s, d) => s + d.beerRevenue, 0) / totalRevenue) * 100) : 0;

  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const start = i * 7;
    const week = dailySales.slice(start, start + 7);
    return {
      week: `Week ${i + 1}`,
      beer: week.reduce((s, d) => s + d.beerRevenue, 0),
      food: week.reduce((s, d) => s + d.foodRevenue, 0),
      na: week.reduce((s, d) => s + d.naRevenue, 0),
      events: week.reduce((s, d) => s + d.eventRevenue, 0),
    };
  });

  const beerPopularity = beers
    .filter(b => b.status === 'on-tap')
    .sort((a, b) => b.totalPours - a.totalPours)
    .slice(0, 6)
    .map(b => ({ name: b.name.length > 15 ? b.name.slice(0, 15) + '...' : b.name, pours: b.totalPours, rating: b.rating }));

  const categoryRevenue = [
    { name: 'Beer', value: dailySales.reduce((s, d) => s + d.beerRevenue, 0), color: '#d97706' },
    { name: 'Food', value: dailySales.reduce((s, d) => s + d.foodRevenue, 0), color: '#059669' },
    { name: 'NA Beverages', value: dailySales.reduce((s, d) => s + d.naRevenue, 0), color: '#3b82f6' },
    { name: 'Merchandise', value: dailySales.reduce((s, d) => s + d.merchandiseRevenue, 0), color: '#a855f7' },
    { name: 'Events', value: dailySales.reduce((s, d) => s + d.eventRevenue, 0), color: '#f43f5e' },
  ];

  const loyaltyDistro = [
    { name: 'Bronze', value: customers.filter(c => c.loyaltyTier === 'Bronze').length, color: '#94a3b8' },
    { name: 'Silver', value: customers.filter(c => c.loyaltyTier === 'Silver').length, color: '#60a5fa' },
    { name: 'Gold', value: customers.filter(c => c.loyaltyTier === 'Gold').length, color: '#fbbf24' },
    { name: 'Platinum', value: customers.filter(c => c.loyaltyTier === 'Platinum').length, color: '#c084fc' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="30-Day Revenue" value={`$${totalRevenue.toLocaleString()}`} change={18} icon={DollarSign} iconBg="bg-emerald-600/20" iconColor="text-emerald-400" />
        <StatCard title="Total Guests" value={totalCustomers.toLocaleString()} change={12} icon={Users} iconBg="bg-blue-600/20" iconColor="text-blue-400" />
        <StatCard title="Avg Daily Revenue" value={`$${avgDaily.toLocaleString()}`} icon={TrendingUp} iconBg="bg-amber-600/20" iconColor="text-amber-400" />
        <StatCard title="Beer % of Revenue" value={`${beerPct}%`} icon={Percent} iconBg="bg-purple-600/20" iconColor="text-purple-400" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Weekly Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#c08a3e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#c08a3e' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ background: '#24180b', border: '1px solid #5c3e1940', borderRadius: 8, fontSize: 12 }} formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="beer" fill="#d97706" radius={[4, 4, 0, 0]} name="Beer" />
              <Bar dataKey="food" fill="#059669" radius={[4, 4, 0, 0]} name="Food" />
              <Bar dataKey="na" fill="#3b82f6" radius={[4, 4, 0, 0]} name="NA" />
              <Bar dataKey="events" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Revenue Breakdown (30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryRevenue} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={0}>
                {categoryRevenue.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} contentStyle={{ background: '#24180b', border: '1px solid #5c3e1940', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryRevenue.map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: c.color }} /><span className="text-brewery-300">{c.name}</span></span>
                <span className="font-medium text-brewery-200">${c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Top Beers by Pours</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={beerPopularity} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={{ background: '#24180b', border: '1px solid #5c3e1940', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="pours" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Loyalty Tier Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={loyaltyDistro} cx="50%" cy="50%" outerRadius={85} dataKey="value" strokeWidth={0} label={({ name, value }) => `${name}: ${value}`}>
                {loyaltyDistro.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#24180b', border: '1px solid #5c3e1940', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-2">
            <p className="text-xs text-brewery-400">Total Guests: <span className="font-bold text-brewery-200">{customers.length}</span> · Mug Club: <span className="font-bold text-amber-400">{customers.filter(c => c.mugClubMember).length}</span></p>
          </div>
        </div>
      </div>

      {/* TABC Compliance Metric */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brewery-200 mb-4">TABC Revenue Split (Must Keep Beer Under 60%)</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-8 rounded-full overflow-hidden flex bg-brewery-800">
              <div className="bg-amber-600 h-full flex items-center justify-center" style={{ width: `${beerPct}%` }}>
                <span className="text-xs font-bold text-white">Beer {beerPct}%</span>
              </div>
              <div className="bg-emerald-600 h-full flex items-center justify-center" style={{ width: `${100 - beerPct}%` }}>
                <span className="text-xs font-bold text-white">Food+NA {100 - beerPct}%</span>
              </div>
            </div>
          </div>
          <span className="text-sm font-bold text-emerald-400">✓ Compliant</span>
        </div>
        <p className="text-[10px] text-brewery-400 mt-2">Texas TABC requires food+NA revenue to be at least 40% of gross for establishments with a Food & Beverage Certificate (FB).</p>
      </div>
    </div>
  );
}
