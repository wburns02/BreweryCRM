import { useState, useMemo } from 'react';
import { Package, Truck, Building2, Wrench, AlertTriangle, Search, Clock, RotateCcw, ChevronDown } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { kegs } from '../../data/mockData';
import type { Keg, KegEvent } from '../../types';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const statusColors: Record<string, string> = {
  'clean-empty': 'border-l-emerald-500',
  'filled': 'border-l-amber-500',
  'on-tap': 'border-l-blue-500',
  'deployed': 'border-l-purple-500',
  'returned-dirty': 'border-l-yellow-500',
  'cleaning': 'border-l-cyan-500',
  'maintenance': 'border-l-gray-500',
  'missing': 'border-l-red-500',
  'retired': 'border-l-gray-600',
};

const statusBadgeVariant: Record<string, 'amber' | 'green' | 'blue' | 'purple' | 'gray' | 'red'> = {
  'clean-empty': 'green',
  'filled': 'amber',
  'on-tap': 'blue',
  'deployed': 'purple',
  'returned-dirty': 'amber',
  'cleaning': 'blue',
  'maintenance': 'gray',
  'missing': 'red',
  'retired': 'gray',
};

const statusLabels: Record<string, string> = {
  'clean-empty': 'Clean/Empty',
  'filled': 'Filled',
  'on-tap': 'On Tap',
  'deployed': 'Deployed',
  'returned-dirty': 'Returned',
  'cleaning': 'Cleaning',
  'maintenance': 'Maintenance',
  'missing': 'Missing',
  'retired': 'Retired',
};

const sizeLabels: Record<string, string> = {
  '1/2': '½ bbl',
  '1/4': '¼ bbl',
  '1/6': '⅙ bbl',
  'slim-1/4': '¼ slim',
};

const eventDotColors: Record<KegEvent['type'], string> = {
  'filled': 'bg-amber-400',
  'tapped': 'bg-blue-400',
  'deployed': 'bg-purple-400',
  'returned': 'bg-emerald-400',
  'cleaned': 'bg-cyan-400',
  'maintenance': 'bg-gray-400',
  'retired': 'bg-gray-500',
  'marked-missing': 'bg-red-500',
};

function LocationIcon({ location }: { location: Keg['location'] }) {
  switch (location) {
    case 'deployed': return <Truck className="w-3.5 h-3.5 text-purple-400" />;
    case 'maintenance-bay': return <Wrench className="w-3.5 h-3.5 text-gray-400" />;
    default: return <Building2 className="w-3.5 h-3.5 text-brewery-400" />;
  }
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

// ──── FLEET SUMMARY CALCULATIONS ────
function useFleetSummary() {
  return useMemo(() => {
    const deployed = kegs.filter(k => k.status === 'deployed');
    const missing = kegs.filter(k => k.status === 'missing');
    const byStatus: Record<string, number> = {};
    const bySize: Record<string, number> = {};
    kegs.forEach(k => {
      byStatus[k.status] = (byStatus[k.status] || 0) + 1;
      bySize[k.size] = (bySize[k.size] || 0) + 1;
    });
    const turnaroundDays = deployed.filter(k => k.deployedDate).map(k => daysSince(k.deployedDate!));
    const avgTurnaround = turnaroundDays.length ? Math.round(turnaroundDays.reduce((a, b) => a + b, 0) / turnaroundDays.length) : 0;
    const depositsOut = deployed.reduce((sum, k) => sum + (k.depositStatus === 'held' ? k.deposit : 0), 0) + missing.reduce((sum, k) => sum + (k.depositStatus === 'held' ? k.deposit : 0), 0);
    return {
      totalKegs: kegs.length,
      byStatus,
      bySize,
      deployed: deployed.length,
      missingCount: missing.length,
      missingValue: missing.reduce((s, k) => s + k.purchaseCost, 0),
      avgTurnaroundDays: avgTurnaround,
      depositsOutstanding: depositsOut,
      fillsThisMonth: kegs.filter(k => k.fillDate && k.fillDate >= '2026-03-01').length,
    };
  }, []);
}

// ──── KPI STAT CARD ────
function KpiCard({ label, value, subtitle, icon: Icon, color = 'amber', danger = false }: { label: string; value: string | number; subtitle?: string; icon: React.ElementType; color?: string; danger?: boolean }) {
  const colorMap: Record<string, string> = { amber: 'text-amber-400', blue: 'text-blue-400', red: 'text-red-400', emerald: 'text-emerald-400', purple: 'text-purple-400' };
  return (
    <div className={`bg-brewery-900/80 border rounded-xl p-4 ${danger ? 'border-red-500/40' : 'border-brewery-700/30'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colorMap[color] || 'text-amber-400'}`} />
        <span className="text-xs text-brewery-400">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${colorMap[color] || 'text-brewery-50'}`}>{value}</p>
      {subtitle && <p className="text-[10px] text-brewery-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ──── KEG CARD ────
function KegCard({ keg, onClick }: { keg: Keg; onClick: () => void }) {
  const daysOut = keg.deployedDate ? daysSince(keg.deployedDate) : 0;
  const overdue = keg.expectedReturnDate ? new Date(keg.expectedReturnDate) < new Date() : false;
  const isMissing = keg.status === 'missing';

  return (
    <div
      onClick={onClick}
      className={`bg-brewery-900/80 border-l-4 border border-brewery-700/30 rounded-xl p-4 cursor-pointer hover:border-amber-500/20 transition-all ${statusColors[keg.status]} ${isMissing ? 'animate-pulse ring-1 ring-red-500/30' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-brewery-100">{keg.kegNumber}</span>
        <Badge variant={statusBadgeVariant[keg.status]}>{statusLabels[keg.status]}</Badge>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-brewery-400">{sizeLabels[keg.size]}</span>
        <span className="text-brewery-600">·</span>
        <span className="text-xs text-brewery-300">{keg.currentBeerName || 'Empty'}</span>
      </div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <LocationIcon location={keg.location} />
        <span className="text-[10px] text-brewery-400">
          {keg.location === 'deployed' ? keg.deployedToName : keg.location.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-brewery-500">{keg.fillCount} fills</span>
        {keg.status === 'deployed' && (
          <span className={`text-[10px] font-medium ${overdue ? 'text-red-400' : 'text-brewery-400'}`}>
            {daysOut}d out{overdue ? ' (overdue)' : ''}
          </span>
        )}
        {isMissing && <span className="text-[10px] font-medium text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{daysOut}d missing</span>}
      </div>
    </div>
  );
}

// ──── KEG DETAIL MODAL ────
function KegDetailModal({ keg, onClose }: { keg: Keg; onClose: () => void }) {
  const lifetimeDays = daysSince(keg.purchaseDate);
  return (
    <Modal open={true} title={`Keg ${keg.kegNumber}`} onClose={onClose} size="lg">
      <div className="space-y-5">
        {/* Header info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-lg bg-brewery-800/30"><p className="text-xs font-bold text-brewery-200">{sizeLabels[keg.size]}</p><p className="text-[10px] text-brewery-500">Size</p></div>
          <div className="text-center p-2 rounded-lg bg-brewery-800/30"><Badge variant={statusBadgeVariant[keg.status]}>{statusLabels[keg.status]}</Badge></div>
          <div className="text-center p-2 rounded-lg bg-brewery-800/30"><p className="text-xs font-bold text-brewery-200">{keg.currentBeerName || 'Empty'}</p><p className="text-[10px] text-brewery-500">Beer</p></div>
          <div className="text-center p-2 rounded-lg bg-brewery-800/30"><p className="text-xs font-bold text-brewery-200">{keg.fillCount}</p><p className="text-[10px] text-brewery-500">Lifetime Fills</p></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-brewery-800/20 border border-brewery-700/20">
            <p className="text-[10px] text-brewery-500 mb-1">Days Since Clean</p>
            <p className="text-sm font-bold text-brewery-200">{keg.lastCleaned ? daysSince(keg.lastCleaned) : '—'}</p>
          </div>
          <div className="p-3 rounded-lg bg-brewery-800/20 border border-brewery-700/20">
            <p className="text-[10px] text-brewery-500 mb-1">Lifetime</p>
            <p className="text-sm font-bold text-brewery-200">{lifetimeDays} days</p>
          </div>
          <div className="p-3 rounded-lg bg-brewery-800/20 border border-brewery-700/20">
            <p className="text-[10px] text-brewery-500 mb-1">Asset Value</p>
            <p className="text-sm font-bold text-brewery-200">${keg.purchaseCost}</p>
          </div>
        </div>

        {keg.deployedToName && (
          <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/20">
            <p className="text-xs text-purple-300"><Truck className="w-3.5 h-3.5 inline mr-1" />Deployed to <strong>{keg.deployedToName}</strong> {keg.deployedDate && <>on {keg.deployedDate}</>}</p>
            {keg.expectedReturnDate && <p className="text-[10px] text-purple-400 mt-1">Expected return: {keg.expectedReturnDate}</p>}
            {keg.depositStatus === 'held' && <p className="text-[10px] text-amber-400 mt-1">Deposit held: ${keg.deposit}</p>}
          </div>
        )}

        {/* Lifecycle Timeline */}
        <div>
          <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">Lifecycle Timeline</h4>
          <div className="space-y-0 relative pl-5">
            <div className="absolute left-[7px] top-2 bottom-2 w-px border-l border-dashed border-brewery-700/40" />
            {keg.history.map((evt) => (
              <div key={evt.id} className="relative flex items-start gap-3 py-2">
                <div className={`absolute left-[-13px] top-3 w-3 h-3 rounded-full ${eventDotColors[evt.type]} ring-2 ring-brewery-950 z-10`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-brewery-200">{evt.description}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-brewery-500">{evt.date}</span>
                    {evt.performedBy && <span className="text-[10px] text-brewery-600">by {evt.performedBy}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {keg.notes && <p className="text-xs text-brewery-300 italic border-t border-brewery-700/20 pt-3">"{keg.notes}"</p>}
      </div>
    </Modal>
  );
}

// ──── FLEET TAB ────
function FleetTab({ onSelectKeg }: { onSelectKeg: (k: Keg) => void }) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return kegs.filter(k => {
      if (statusFilter !== 'all' && k.status !== statusFilter) return false;
      if (sizeFilter !== 'all' && k.size !== sizeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!k.kegNumber.toLowerCase().includes(q) && !(k.currentBeerName || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [statusFilter, sizeFilter, search]);

  const statuses = ['all', 'clean-empty', 'filled', 'on-tap', 'deployed', 'returned-dirty', 'cleaning', 'missing'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${statusFilter === s ? 'bg-amber-600 text-white' : 'bg-brewery-800/50 text-brewery-400 hover:text-brewery-200'}`}>
            {s === 'all' ? 'All' : statusLabels[s] || s}
          </button>
        ))}
        <div className="relative ml-auto">
          <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)} className="bg-brewery-800/50 text-brewery-300 text-xs border border-brewery-700/30 rounded-lg px-3 py-1.5 pr-7 appearance-none">
            <option value="all">All Sizes</option>
            <option value="1/2">½ bbl</option>
            <option value="1/4">¼ bbl</option>
            <option value="1/6">⅙ bbl</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-brewery-500 pointer-events-none" />
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brewery-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keg # or beer..." className="w-full bg-brewery-800/30 border border-brewery-700/30 rounded-lg pl-9 pr-3 py-2 text-sm text-brewery-200 placeholder-brewery-600 focus:outline-none focus:border-amber-500/30" />
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(keg => <KegCard key={keg.id} keg={keg} onClick={() => onSelectKeg(keg)} />)}
      </div>
      {filtered.length === 0 && <p className="text-center text-sm text-brewery-500 py-8">No kegs match your filters.</p>}
    </div>
  );
}

// ──── DEPLOYED TAB ────
function DeployedTab({ onSelectKeg }: { onSelectKeg: (k: Keg) => void }) {
  const deployed = useMemo(() => kegs.filter(k => k.status === 'deployed' || k.status === 'missing'), []);
  const grouped = useMemo(() => {
    const map: Record<string, { name: string; kegs: Keg[]; totalDeposit: number }> = {};
    deployed.forEach(k => {
      const name = k.deployedToName || 'Unknown';
      if (!map[name]) map[name] = { name, kegs: [], totalDeposit: 0 };
      map[name].kegs.push(k);
      if (k.depositStatus === 'held') map[name].totalDeposit += k.deposit;
    });
    return Object.values(map).sort((a, b) => b.kegs.length - a.kegs.length);
  }, [deployed]);

  const totalDeposit = deployed.reduce((s, k) => s + (k.depositStatus === 'held' ? k.deposit : 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-purple-400">{deployed.length}</p><p className="text-[10px] text-brewery-500">Kegs Out</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-amber-400">${totalDeposit}</p><p className="text-[10px] text-brewery-500">Deposits Held</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-brewery-200">{grouped.length}</p><p className="text-[10px] text-brewery-500">Accounts</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-blue-400">{deployed.length > 0 ? Math.round(deployed.filter(k => k.deployedDate).reduce((s, k) => s + daysSince(k.deployedDate!), 0) / deployed.length) : 0}d</p><p className="text-[10px] text-brewery-500">Avg Days Out</p>
        </div>
      </div>
      {/* Grouped by account */}
      {grouped.map(group => (
        <div key={group.name} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-brewery-100">{group.name}</h3>
              <Badge variant="purple">{group.kegs.length} kegs</Badge>
            </div>
            <span className="text-xs text-amber-400">${group.totalDeposit} deposit</span>
          </div>
          <div className="space-y-2">
            {group.kegs.map(keg => {
              const daysOut = keg.deployedDate ? daysSince(keg.deployedDate) : 0;
              const overdue = keg.expectedReturnDate ? new Date(keg.expectedReturnDate) < new Date() : false;
              return (
                <div key={keg.id} onClick={() => onSelectKeg(keg)}
                  className={`flex items-center justify-between p-2.5 rounded-lg bg-brewery-800/30 cursor-pointer hover:bg-brewery-800/50 transition-colors ${keg.status === 'missing' ? 'ring-1 ring-red-500/30' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-brewery-200">{keg.kegNumber}</span>
                    <span className="text-xs text-brewery-300">{keg.currentBeerName}</span>
                    <span className="text-[10px] text-brewery-500">{sizeLabels[keg.size]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${overdue ? 'text-red-400 font-medium' : 'text-brewery-400'}`}>{daysOut}d{overdue ? ' overdue' : ''}</span>
                    {keg.status === 'missing' && <Badge variant="red">Missing</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ──── RETURNS TAB ────
function ReturnsTab({ onSelectKeg }: { onSelectKeg: (k: Keg) => void }) {
  const pendingReturns = useMemo(() =>
    kegs.filter(k => k.status === 'deployed' && k.expectedReturnDate && new Date(k.expectedReturnDate) < new Date())
      .sort((a, b) => daysSince(a.expectedReturnDate!) - daysSince(b.expectedReturnDate!)).reverse(),
  []);
  const recentlyReturned = useMemo(() => kegs.filter(k => k.status === 'returned-dirty' || k.status === 'cleaning'), []);

  return (
    <div className="space-y-6">
      {/* Pending Returns */}
      <div>
        <h3 className="text-sm font-semibold text-brewery-200 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" /> Pending Returns ({pendingReturns.length})
        </h3>
        {pendingReturns.length === 0 ? (
          <p className="text-xs text-brewery-500 bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-6 text-center">No overdue kegs</p>
        ) : (
          <div className="space-y-2">
            {pendingReturns.map(keg => {
              const daysOverdue = daysSince(keg.expectedReturnDate!);
              return (
                <div key={keg.id} onClick={() => onSelectKeg(keg)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer hover:border-amber-500/20 transition-all bg-brewery-900/80 border ${daysOverdue >= 30 ? 'border-red-500/40 bg-red-900/10' : 'border-brewery-700/30'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-brewery-200">{keg.kegNumber}</span>
                    <span className="text-xs text-brewery-300">{keg.currentBeerName}</span>
                    <span className="text-[10px] text-brewery-500">{sizeLabels[keg.size]}</span>
                    <span className="text-[10px] text-purple-400">{keg.deployedToName}</span>
                  </div>
                  <span className={`text-xs font-bold ${daysOverdue >= 30 ? 'text-red-400' : 'text-amber-400'}`}>{daysOverdue}d overdue</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Returned */}
      <div>
        <h3 className="text-sm font-semibold text-brewery-200 mb-3 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-cyan-400" /> Recently Returned ({recentlyReturned.length})
        </h3>
        {recentlyReturned.length === 0 ? (
          <p className="text-xs text-brewery-500 bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-6 text-center">No kegs awaiting cleaning</p>
        ) : (
          <div className="space-y-2">
            {recentlyReturned.map(keg => (
              <div key={keg.id} onClick={() => onSelectKeg(keg)}
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:border-amber-500/20 transition-all bg-brewery-900/80 border border-brewery-700/30">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-brewery-200">{keg.kegNumber}</span>
                  <span className="text-xs text-brewery-300">{sizeLabels[keg.size]}</span>
                  <Badge variant={keg.status === 'cleaning' ? 'blue' : 'amber'}>{keg.status === 'cleaning' ? 'In CIP' : 'Needs Cleaning'}</Badge>
                </div>
                {keg.history[0] && <span className="text-[10px] text-brewery-500">{keg.history[0].date}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ──── ANALYTICS TAB ────
function AnalyticsTab() {
  // Fleet status donut
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    kegs.forEach(k => { counts[k.status] = (counts[k.status] || 0) + 1; });
    const colors: Record<string, string> = { 'clean-empty': '#34d399', 'filled': '#f59e0b', 'on-tap': '#3b82f6', 'deployed': '#a855f7', 'returned-dirty': '#eab308', 'cleaning': '#22d3ee', 'maintenance': '#6b7280', 'missing': '#ef4444', 'retired': '#4b5563' };
    return Object.entries(counts).map(([status, count]) => ({ name: statusLabels[status] || status, value: count, fill: colors[status] || '#6b7280' }));
  }, []);

  // Size distribution
  const sizeData = useMemo(() => {
    const counts: Record<string, number> = {};
    kegs.forEach(k => { counts[k.size] = (counts[k.size] || 0) + 1; });
    return Object.entries(counts).map(([size, count]) => ({ name: sizeLabels[size], count, fill: size === '1/2' ? '#f59e0b' : size === '1/4' ? '#3b82f6' : '#a855f7' }));
  }, []);

  // Top accounts by kegs deployed
  const accountData = useMemo(() => {
    const counts: Record<string, number> = {};
    kegs.filter(k => k.status === 'deployed').forEach(k => {
      const name = k.deployedToName || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + '…' : name, kegs: count }));
  }, []);

  // Monthly activity (mock 6 months)
  const monthlyData = useMemo(() => [
    { month: 'Oct', fills: 18, deployments: 12, returns: 10 },
    { month: 'Nov', fills: 22, deployments: 15, returns: 13 },
    { month: 'Dec', fills: 28, deployments: 20, returns: 16 },
    { month: 'Jan', fills: 24, deployments: 18, returns: 15 },
    { month: 'Feb', fills: 30, deployments: 22, returns: 19 },
    { month: 'Mar', fills: 8, deployments: 6, returns: 5 },
  ], []);

  // Turnaround trend
  const turnaroundData = useMemo(() => [
    { month: 'Oct', days: 16 },
    { month: 'Nov', days: 14 },
    { month: 'Dec', days: 15 },
    { month: 'Jan', days: 13 },
    { month: 'Feb', days: 12 },
    { month: 'Mar', days: 11 },
  ], []);

  const missingCount = kegs.filter(k => k.status === 'missing').length;
  const missingValue = kegs.filter(k => k.status === 'missing').reduce((s, k) => s + k.purchaseCost, 0);
  const depositsHeld = kegs.filter(k => k.depositStatus === 'held').reduce((s, k) => s + k.deposit, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Status Donut */}
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Fleet Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2} dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#24180b', border: '1px solid #5c3e1940', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Activity */}
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Monthly Keg Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#24180b', border: '1px solid #5c3e1940', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="fills" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Fills" />
              <Bar dataKey="deployments" fill="#a855f7" radius={[4, 4, 0, 0]} name="Deployments" />
              <Bar dataKey="returns" fill="#34d399" radius={[4, 4, 0, 0]} name="Returns" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Turnaround Trend */}
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Turnaround Time Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={turnaroundData}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} unit="d" />
              <Tooltip contentStyle={{ background: '#24180b', border: '1px solid #5c3e1940', borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} name="Avg Days" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Size Distribution + Top Accounts */}
        <div className="space-y-6">
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4">Size Distribution</h3>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={sizeData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={{ background: '#24180b', border: '1px solid #5c3e1940', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {sizeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4">Top Accounts by Kegs Out</h3>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={accountData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ background: '#24180b', border: '1px solid #5c3e1940', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="kegs" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Loss & Deposit Summary */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brewery-200 mb-3">Loss & Deposit Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-red-400">{missingCount}</p>
            <p className="text-[10px] text-brewery-500">Currently Missing</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-red-400">${missingValue}</p>
            <p className="text-[10px] text-brewery-500">Missing Keg Value</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-amber-400">${depositsHeld}</p>
            <p className="text-[10px] text-brewery-500">Deposits Outstanding</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-emerald-400">97.5%</p>
            <p className="text-[10px] text-brewery-500">Lifetime Return Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──── MAIN PAGE ────
export default function KegsPage() {
  const [activeTab, setActiveTab] = useState<'fleet' | 'deployed' | 'returns' | 'analytics'>('fleet');
  const [selectedKeg, setSelectedKeg] = useState<Keg | null>(null);
  const summary = useFleetSummary();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Fleet" value={summary.totalKegs} subtitle={`${summary.totalKegs - summary.missingCount} active`} icon={Package} color="amber" />
        <KpiCard label="Deployed" value={summary.deployed} subtitle={`$${summary.depositsOutstanding} deposits held`} icon={Truck} color="purple" />
        <KpiCard label="Missing Kegs" value={summary.missingCount} subtitle={summary.missingCount > 0 ? `~$${summary.missingValue} exposure` : 'All accounted for'} icon={AlertTriangle} color="red" danger={summary.missingCount > 0} />
        <KpiCard label="Avg Turnaround" value={`${summary.avgTurnaroundDays}d`} subtitle={`${summary.fillsThisMonth} fills this month`} icon={Clock} color="blue" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brewery-700/30">
        {(['fleet', 'deployed', 'returns', 'analytics'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === tab ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'fleet' && <FleetTab onSelectKeg={setSelectedKeg} />}
      {activeTab === 'deployed' && <DeployedTab onSelectKeg={setSelectedKeg} />}
      {activeTab === 'returns' && <ReturnsTab onSelectKeg={setSelectedKeg} />}
      {activeTab === 'analytics' && <AnalyticsTab />}

      {selectedKeg && <KegDetailModal keg={selectedKeg} onClose={() => setSelectedKeg(null)} />}
    </div>
  );
}
