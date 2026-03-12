import { useState } from 'react';
import {
  FileText, CheckCircle, Clock, AlertTriangle, Download, ChevronRight,
  FlaskConical, TrendingUp, Package, BarChart3, Info, Send,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../components/ui/ToastProvider';
import { clsx } from 'clsx';

// ─── Constants & types ───────────────────────────────────────────────────────

type ReportType = 'monthly' | 'quarterly' | 'annual';
type ReportStatus = 'filed' | 'pending' | 'overdue' | 'not-due';
type TabId = 'reports' | 'production' | 'removals' | 'calculator';

interface TTBReport {
  id: string;
  period: string;
  type: ReportType;
  status: ReportStatus;
  dueDate: string;
  filedDate?: string;
  totalBarrels: number;
  form: string;
}

interface ProductionEntry {
  month: string;
  beerBarrels: number;
  fermenterStart: number;
  fermenterEnd: number;
  removedTax: number;
  removedExempt: number;
  losses: number;
}

// ─── Mock TTB data (realistic for a ~400 bbl/yr Texas craft brewery) ─────────

const MOCK_REPORTS: TTBReport[] = [
  { id: 'r1', period: 'February 2026', type: 'monthly', status: 'pending', dueDate: '2026-03-15', totalBarrels: 38.4, form: 'TTB F 5130.9' },
  { id: 'r2', period: 'January 2026', type: 'monthly', status: 'filed', dueDate: '2026-02-15', filedDate: '2026-02-12', totalBarrels: 42.1, form: 'TTB F 5130.9' },
  { id: 'r3', period: 'Q4 2025', type: 'quarterly', status: 'filed', dueDate: '2026-01-31', filedDate: '2026-01-28', totalBarrels: 118.7, form: 'TTB F 5000.24' },
  { id: 'r4', period: 'December 2025', type: 'monthly', status: 'filed', dueDate: '2026-01-15', filedDate: '2026-01-10', totalBarrels: 41.2, form: 'TTB F 5130.9' },
  { id: 'r5', period: 'November 2025', type: 'monthly', status: 'filed', dueDate: '2025-12-15', filedDate: '2025-12-11', totalBarrels: 38.8, form: 'TTB F 5130.9' },
  { id: 'r6', period: 'October 2025', type: 'monthly', status: 'filed', dueDate: '2025-11-15', filedDate: '2025-11-14', totalBarrels: 39.3, form: 'TTB F 5130.9' },
  { id: 'r7', period: 'Q3 2025', type: 'quarterly', status: 'filed', dueDate: '2025-10-31', filedDate: '2025-10-25', totalBarrels: 104.2, form: 'TTB F 5000.24' },
  { id: 'r8', period: '2025 Annual', type: 'annual', status: 'not-due', dueDate: '2026-06-01', totalBarrels: 0, form: 'TTB F 5120.17' },
];

const MOCK_PRODUCTION: ProductionEntry[] = [
  { month: 'Feb 2026', beerBarrels: 38.4, fermenterStart: 72.5, fermenterEnd: 68.2, removedTax: 35.0, removedExempt: 2.8, losses: 1.9 },
  { month: 'Jan 2026', beerBarrels: 42.1, fermenterStart: 68.0, fermenterEnd: 72.5, removedTax: 38.5, removedExempt: 3.1, losses: 1.5 },
  { month: 'Dec 2025', beerBarrels: 41.2, fermenterStart: 61.3, fermenterEnd: 68.0, removedTax: 36.9, removedExempt: 2.4, losses: 2.2 },
  { month: 'Nov 2025', beerBarrels: 38.8, fermenterStart: 58.4, fermenterEnd: 61.3, removedTax: 34.7, removedExempt: 2.2, losses: 1.6 },
  { month: 'Oct 2025', beerBarrels: 39.3, fermenterStart: 54.9, fermenterEnd: 58.4, removedTax: 36.1, removedExempt: 1.8, losses: 2.1 },
  { month: 'Sep 2025', beerBarrels: 36.5, fermenterStart: 52.1, fermenterEnd: 54.9, removedTax: 33.2, removedExempt: 1.9, losses: 1.4 },
];

// TTB tax rates 2026 (per barrel, reduced rate for craft breweries <2M bbl/yr)
const TTB_RATE_REDUCED = 3.50; // $3.50/bbl for first 60,000 bbls
const TX_STATE_RATE = 0.198; // $0.198/gallon = ~$6.07/bbl

// ─── Components ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReportStatus }) {
  const variants: Record<ReportStatus, { variant: 'green' | 'amber' | 'red' | 'gray'; label: string }> = {
    filed: { variant: 'green', label: 'Filed' },
    pending: { variant: 'amber', label: 'Pending' },
    overdue: { variant: 'red', label: 'Overdue' },
    'not-due': { variant: 'gray', label: 'Not Due Yet' },
  };
  const { variant, label } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
}

const fmtBbl = (n: number) => `${n.toFixed(1)} bbl`;
const fmtDollars = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Tab 1: Reports List ──────────────────────────────────────────────────────

function ReportsTab({ reports, onFile }: { reports: TTBReport[]; onFile: (id: string) => void }) {
  const [filter, setFilter] = useState<'all' | ReportType>('all');
  const filtered = filter === 'all' ? reports : reports.filter(r => r.type === filter);
  const pending = reports.filter(r => r.status === 'pending' || r.status === 'overdue');
  const nextDue = pending[0];

  return (
    <div className="space-y-6">
      {/* Next Due Banner */}
      {nextDue && (
        <div className={clsx(
          'rounded-xl p-4 border flex items-center gap-4',
          nextDue.status === 'overdue'
            ? 'bg-red-950/40 border-red-500/30'
            : 'bg-amber-950/40 border-amber-500/30'
        )}>
          {nextDue.status === 'overdue' ? (
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className={clsx('text-sm font-semibold', nextDue.status === 'overdue' ? 'text-red-300' : 'text-amber-300')}>
              {nextDue.status === 'overdue' ? 'Overdue: ' : 'Due Soon: '}{nextDue.period} — {nextDue.form}
            </p>
            <p className="text-xs text-brewery-400">Due date: {new Date(nextDue.dueDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <button
            onClick={() => onFile(nextDue.id)}
            className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-amber-600/20"
          >
            <Send className="w-4 h-4" /> Mark as Filed
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Reports Filed (YTD)', value: reports.filter(r => r.status === 'filed').length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
          { label: 'Pending Filings', value: pending.length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-600/10' },
          { label: 'Barrels Reported (YTD)', value: reports.filter(r => r.status === 'filed' && r.type === 'monthly').reduce((s, r) => s + r.totalBarrels, 0).toFixed(1) + ' bbl', icon: FlaskConical, color: 'text-blue-400', bg: 'bg-blue-600/10', wide: true },
          { label: 'Federal Tax Paid (Est.)', value: '$' + (reports.filter(r => r.status === 'filed').reduce((s, r) => s + r.totalBarrels, 0) * TTB_RATE_REDUCED).toFixed(0), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-600/10' },
        ].map(s => (
          <div key={s.label} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center mb-2', s.bg)}>
              <s.icon className={clsx('w-4 h-4', s.color)} />
            </div>
            <p className={clsx('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-brewery-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'monthly', 'quarterly', 'annual'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
              filter === f ? 'bg-amber-600/20 text-amber-300 border-amber-500/30' : 'bg-brewery-800/40 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'
            )}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-brewery-500">
          <Info className="w-3.5 h-3.5" />
          TTB reports due 15th of following month
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brewery-700/40">
                {['Period', 'Form', 'Type', 'Status', 'Due Date', 'Filed Date', 'Barrels', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-brewery-400 font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brewery-700/20">
              {filtered.map((report, i) => (
                <tr key={report.id} className={clsx(i % 2 === 0 ? 'bg-brewery-800/10' : '', 'hover:bg-brewery-800/30 transition-colors')}>
                  <td className="py-3 px-4 font-medium text-brewery-100 whitespace-nowrap">{report.period}</td>
                  <td className="py-3 px-4 text-brewery-400 font-mono text-xs whitespace-nowrap">{report.form}</td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-brewery-300 text-xs">{report.type}</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="py-3 px-4 text-brewery-300 whitespace-nowrap text-xs">
                    {new Date(report.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-brewery-400 whitespace-nowrap text-xs">
                    {report.filedDate ? new Date(report.filedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-3 px-4 text-brewery-300 font-mono whitespace-nowrap">
                    {report.totalBarrels > 0 ? fmtBbl(report.totalBarrels) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {(report.status === 'pending' || report.status === 'overdue') && (
                        <button
                          onClick={() => onFile(report.id)}
                          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                        >
                          <Send className="w-3 h-3" /> File
                        </button>
                      )}
                      {report.status === 'filed' && (
                        <button className="text-xs text-brewery-500 hover:text-brewery-300 flex items-center gap-1 transition-colors">
                          <Download className="w-3 h-3" /> PDF
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Production Records ────────────────────────────────────────────────

function ProductionTab() {
  const { batches } = useData();

  // Merge real batch data with mock historical
  const recentBatches = batches.slice(0, 5).map(b => ({
    id: b.id,
    beerName: b.beerName,
    batchNumber: b.batchNumber,
    volume: b.volume,
    status: b.status,
    startDate: b.brewDate,
    actualOG: b.actualOG,
    targetFG: b.targetFG,
    tankId: b.tankId,
  }));

  return (
    <div className="space-y-6">
      {/* Production Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_PRODUCTION.slice(0, 3).map(entry => (
          <div key={entry.month} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-brewery-400 uppercase tracking-wider">{entry.month}</p>
              <FlaskConical className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400 mb-1">{fmtBbl(entry.beerBarrels)}</p>
            <p className="text-xs text-brewery-500">Beer produced</p>
            <div className="mt-3 pt-3 border-t border-brewery-700/30 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-brewery-500">Removed (taxable)</span>
                <span className="text-brewery-300">{fmtBbl(entry.removedTax)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-brewery-500">Removed (exempt)</span>
                <span className="text-brewery-300">{fmtBbl(entry.removedExempt)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-brewery-500">Production losses</span>
                <span className="text-red-400">{fmtBbl(entry.losses)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fermenter Inventory Table */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-brewery-700/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-brewery-200">Fermenter Inventory Record</h3>
            <p className="text-xs text-brewery-500 mt-0.5">TTB Section 11 — Beer on Hand in Production Cellar</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brewery-500 bg-brewery-800/40 px-3 py-1.5 rounded-lg">
            <Info className="w-3.5 h-3.5" />
            Required for TTB F 5130.9
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brewery-700/40">
                {['Month', 'Beginning Inventory', 'Beer Produced', 'Removed Taxable', 'Removed Exempt', 'Losses', 'Ending Inventory'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-brewery-400 font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brewery-700/20">
              {MOCK_PRODUCTION.map((entry, i) => {
                const endInv = entry.fermenterStart + entry.beerBarrels - entry.removedTax - entry.removedExempt - entry.losses;
                return (
                  <tr key={entry.month} className={clsx(i % 2 === 0 ? 'bg-brewery-800/10' : '', 'hover:bg-brewery-800/30 transition-colors')}>
                    <td className="py-3 px-4 font-medium text-brewery-100 whitespace-nowrap">{entry.month}</td>
                    <td className="py-3 px-4 text-brewery-300 font-mono">{fmtBbl(entry.fermenterStart)}</td>
                    <td className="py-3 px-4 text-amber-400 font-mono font-medium">{fmtBbl(entry.beerBarrels)}</td>
                    <td className="py-3 px-4 text-brewery-300 font-mono">{fmtBbl(entry.removedTax)}</td>
                    <td className="py-3 px-4 text-brewery-300 font-mono">{fmtBbl(entry.removedExempt)}</td>
                    <td className="py-3 px-4 text-red-400 font-mono">{fmtBbl(entry.losses)}</td>
                    <td className="py-3 px-4 text-emerald-400 font-mono font-medium">{fmtBbl(endInv)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Batches from API */}
      {recentBatches.length > 0 && (
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-brewery-700/30">
            <h3 className="text-sm font-semibold text-brewery-200">Active Batches — Production Cellar</h3>
            <p className="text-xs text-brewery-500 mt-0.5">Live data from batch records</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brewery-700/40">
                  {['Batch #', 'Beer', 'Tank', 'Volume', 'Status', 'Started'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-brewery-400 font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brewery-700/20">
                {recentBatches.map((b, i) => (
                  <tr key={b.id} className={clsx(i % 2 === 0 ? 'bg-brewery-800/10' : '', 'hover:bg-brewery-800/30')}>
                    <td className="py-3 px-4 text-brewery-400 font-mono text-xs">{b.batchNumber}</td>
                    <td className="py-3 px-4 font-medium text-brewery-100">{b.beerName}</td>
                    <td className="py-3 px-4 text-brewery-400">{b.tankId}</td>
                    <td className="py-3 px-4 text-amber-400 font-mono">{b.volume} bbl</td>
                    <td className="py-3 px-4">
                      <Badge variant={b.status === 'fermenting' ? 'amber' : b.status === 'conditioning' ? 'blue' : b.status === 'ready' ? 'green' : 'gray'}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-brewery-400 text-xs">{b.startDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Tax Calculator ────────────────────────────────────────────────────

function TaxCalculatorTab() {
  const [barrels, setBarrels] = useState('38.4');
  const [period, setPeriod] = useState('monthly');
  const [includeStateHop, setIncludeStateHop] = useState(true);
  const [isSmallBrewery, setIsSmallBrewery] = useState(true);

  const bbl = parseFloat(barrels) || 0;
  const federalRate = isSmallBrewery ? TTB_RATE_REDUCED : 18.00;
  const federalTax = bbl * federalRate;
  // 31 gallons/bbl
  const txStateTax = includeStateHop ? bbl * 31 * TX_STATE_RATE : 0;
  const totalTax = federalTax + txStateTax;
  const effectiveRate = bbl > 0 ? totalTax / bbl : 0;

  // Typical COGS breakdown for a craft brewery
  const materialCost = bbl * 85; // ~$85/bbl ingredients
  const laborCost = bbl * 42;   // ~$42/bbl labor
  const overheadCost = bbl * 28; // ~$28/bbl overhead
  const packagingCost = bbl * 18; // ~$18/bbl packaging
  const totalProductionCost = materialCost + laborCost + overheadCost + packagingCost;
  const costWithTax = totalProductionCost + totalTax;

  // Revenue at ~$7.50/pint avg, 124 pints/bbl
  const revenue = bbl * 124 * 7.5;
  const grossMargin = bbl > 0 ? ((revenue - costWithTax) / revenue) * 100 : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/80">
            Estimates only. Verify with your tax professional. Federal excise tax rates shown are for qualified domestic brewers under the Craft Beverage Modernization Act (CBMA) producing under 2 million barrels annually. Texas state rates current as of 2026.
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-brewery-200">Calculate Tax & Profitability</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-brewery-400 mb-1">Barrels Produced</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={barrels}
              onChange={e => setBarrels(e.target.value)}
              className="w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brewery-400 mb-1">Reporting Period</label>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="w-full bg-brewery-800/50 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isSmallBrewery} onChange={e => setIsSmallBrewery(e.target.checked)} className="w-4 h-4 accent-amber-500" />
            <span className="text-sm text-brewery-300">CBMA Reduced Rate (&lt;2M bbl/yr)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={includeStateHop} onChange={e => setIncludeStateHop(e.target.checked)} className="w-4 h-4 accent-amber-500" />
            <span className="text-sm text-brewery-300">Include Texas State Tax</span>
          </label>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tax Breakdown */}
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-brewery-200">Excise Tax Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-brewery-700/20">
              <div>
                <p className="text-xs font-medium text-brewery-300">Federal TTB</p>
                <p className="text-[11px] text-brewery-500">{fmtDollars(federalRate)}/bbl × {fmtBbl(bbl)}</p>
              </div>
              <p className="text-sm font-bold text-amber-400">{fmtDollars(federalTax)}</p>
            </div>
            {includeStateHop && (
              <div className="flex justify-between py-2 border-b border-brewery-700/20">
                <div>
                  <p className="text-xs font-medium text-brewery-300">Texas State (TABC)</p>
                  <p className="text-[11px] text-brewery-500">$0.198/gal × {(bbl * 31).toFixed(0)} gal</p>
                </div>
                <p className="text-sm font-bold text-amber-400">{fmtDollars(txStateTax)}</p>
              </div>
            )}
            <div className="flex justify-between pt-2">
              <p className="text-sm font-bold text-brewery-100">Total Excise Tax</p>
              <p className="text-sm font-bold text-red-400">{fmtDollars(totalTax)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-xs text-brewery-500">Effective rate per barrel</p>
              <p className="text-xs text-brewery-400 font-mono">{fmtDollars(effectiveRate)}/bbl</p>
            </div>
          </div>
        </div>

        {/* Profitability */}
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-brewery-200">Estimated Profitability</h3>
          <div className="space-y-2">
            {[
              { label: 'Ingredients', value: materialCost, color: 'text-brewery-300' },
              { label: 'Labor', value: laborCost, color: 'text-brewery-300' },
              { label: 'Overhead', value: overheadCost, color: 'text-brewery-300' },
              { label: 'Packaging', value: packagingCost, color: 'text-brewery-300' },
              { label: 'Excise Tax', value: totalTax, color: 'text-red-400' },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-xs">
                <span className="text-brewery-500">{row.label}</span>
                <span className={clsx('font-mono', row.color)}>{fmtDollars(row.value)}</span>
              </div>
            ))}
            <div className="border-t border-brewery-700/30 pt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-brewery-400 font-medium">Total Cost (excl. tax)</span>
                <span className="font-mono text-brewery-300">{fmtDollars(totalProductionCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-brewery-400 font-medium">Taproom Revenue Est.</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{fmtDollars(revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-brewery-100">Gross Margin</span>
                <span className={clsx('text-sm font-bold font-mono', grossMargin > 60 ? 'text-emerald-400' : grossMargin > 40 ? 'text-amber-400' : 'text-red-400')}>
                  {grossMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YTD Tracker */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brewery-200 mb-4">YTD Tax Liability (2026)</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Barrels Produced', value: '80.5 bbl', note: 'Jan + Feb 2026' },
            { label: 'Federal Tax Paid', value: fmtDollars(80.5 * TTB_RATE_REDUCED), note: 'TTB @ $3.50/bbl' },
            { label: 'State Tax Paid', value: fmtDollars(80.5 * 31 * TX_STATE_RATE), note: 'TABC @ $0.198/gal' },
          ].map(item => (
            <div key={item.label} className="text-center p-3 rounded-lg bg-brewery-800/30">
              <p className="text-lg font-bold text-amber-400">{item.value}</p>
              <p className="text-xs text-brewery-400 mt-0.5">{item.label}</p>
              <p className="text-[10px] text-brewery-600 mt-0.5">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 4: Removals Record ───────────────────────────────────────────────────

function RemovalsTab() {
  const REMOVALS = [
    { date: '2026-02-28', description: 'Taproom kegs — Hill Country Honey Wheat', barrels: 12.5, type: 'Taxable Determination', taxPaid: true, destination: 'Taproom — Bulverde, TX' },
    { date: '2026-02-21', description: 'Wholesale — Hill Country Taproom', barrels: 8.0, type: 'Taxable Determination', taxPaid: true, destination: 'San Antonio, TX' },
    { date: '2026-02-14', description: 'Taproom kegs — Alamo Amber', barrels: 9.5, type: 'Taxable Determination', taxPaid: true, destination: 'Taproom — Bulverde, TX' },
    { date: '2026-02-07', description: 'Wholesale — Maverick Bar & Grill', barrels: 4.0, type: 'Taxable Determination', taxPaid: true, destination: 'New Braunfels, TX' },
    { date: '2026-02-03', description: 'Sample — Cicerone exam (employee)', barrels: 0.1, type: 'Exempt (Internal Use)', taxPaid: false, destination: 'On-premises' },
    { date: '2026-01-31', description: 'Taproom kegs — Lone Star Lager', barrels: 14.5, type: 'Taxable Determination', taxPaid: true, destination: 'Taproom — Bulverde, TX' },
    { date: '2026-01-24', description: 'Wholesale — Alamo Drafthouse', barrels: 7.5, type: 'Taxable Determination', taxPaid: true, destination: 'Austin, TX' },
    { date: '2026-01-15', description: 'Taproom kegs — Barrel-Aged Reserve', barrels: 4.5, type: 'Taxable Determination', taxPaid: true, destination: 'Taproom — Bulverde, TX' },
    { date: '2026-01-08', description: 'Event — BBQ Festival charitable', barrels: 1.2, type: 'Exempt (Charitable)', taxPaid: false, destination: 'San Antonio, TX' },
    { date: '2026-01-03', description: 'Wholesale — Wine & Beer Market', barrels: 6.5, type: 'Taxable Determination', taxPaid: true, destination: 'Austin, TX' },
  ];

  const totalTaxable = REMOVALS.filter(r => r.taxPaid).reduce((s, r) => s + r.barrels, 0);
  const totalExempt = REMOVALS.filter(r => !r.taxPaid).reduce((s, r) => s + r.barrels, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{fmtBbl(totalTaxable + totalExempt)}</p>
          <p className="text-xs text-brewery-500">Total Removals (YTD)</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{fmtBbl(totalTaxable)}</p>
          <p className="text-xs text-brewery-500">Taxable Removals</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{fmtBbl(totalExempt)}</p>
          <p className="text-xs text-brewery-500">Exempt Removals</p>
        </div>
      </div>

      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-brewery-700/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-brewery-200">Removal Record</h3>
            <p className="text-xs text-brewery-500 mt-0.5">TTB Section 12 — Beer Removed or Otherwise Disposed Of</p>
          </div>
          <button className="text-xs text-brewery-400 hover:text-brewery-200 flex items-center gap-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brewery-700/40">
                {['Date', 'Description', 'Barrels', 'Removal Type', 'Tax', 'Destination'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-brewery-400 font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brewery-700/20">
              {REMOVALS.map((r, i) => (
                <tr key={i} className={clsx(i % 2 === 0 ? 'bg-brewery-800/10' : '', 'hover:bg-brewery-800/30 transition-colors')}>
                  <td className="py-2.5 px-4 text-brewery-400 whitespace-nowrap text-xs">
                    {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-2.5 px-4 text-brewery-100 text-xs">{r.description}</td>
                  <td className="py-2.5 px-4 text-amber-400 font-mono font-medium whitespace-nowrap">{fmtBbl(r.barrels)}</td>
                  <td className="py-2.5 px-4 text-xs">
                    <span className={clsx('px-2 py-0.5 rounded text-[11px] font-medium', r.taxPaid ? 'bg-blue-600/15 text-blue-300' : 'bg-emerald-600/15 text-emerald-300')}>
                      {r.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {r.taxPaid
                      ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                      : <span className="text-xs text-brewery-500">—</span>
                    }
                  </td>
                  <td className="py-2.5 px-4 text-brewery-400 text-xs">{r.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'reports', label: 'Filing History', icon: FileText },
  { id: 'production', label: 'Production Records', icon: FlaskConical },
  { id: 'removals', label: 'Removals Record', icon: Package },
  { id: 'calculator', label: 'Tax Calculator', icon: BarChart3 },
];

export default function TTBReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('reports');
  const [reports, setReports] = useState<TTBReport[]>(MOCK_REPORTS);
  const { toast } = useToast();

  const handleFile = (id: string) => {
    setReports(prev => prev.map(r =>
      r.id === id
        ? { ...r, status: 'filed' as ReportStatus, filedDate: new Date().toISOString().split('T')[0] }
        : r
    ));
    const report = reports.find(r => r.id === id);
    toast('success', `${report?.period} report marked as filed!`);
  };

  const pending = reports.filter(r => r.status === 'pending' || r.status === 'overdue').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-brewery-100">TTB Compliance Center</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/15 border border-blue-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider">Federal Compliance</span>
            </div>
          </div>
          <p className="text-sm text-brewery-400">Brewer's Reports of Operations — TTB F 5130.9 &amp; related forms</p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">{pending} filing{pending > 1 ? 's' : ''} pending</span>
          </div>
        )}
      </div>

      {/* Regulatory Info Strip */}
      <div className="bg-brewery-800/30 border border-brewery-700/30 rounded-xl px-4 py-3 flex flex-wrap gap-4">
        {[
          { label: 'Brewer Permit #', value: 'TX-B-50-198', icon: ChevronRight },
          { label: 'Permit Issued', value: 'March 15, 2022', icon: ChevronRight },
          { label: 'Monthly Report Due', value: '15th of following month', icon: ChevronRight },
          { label: 'Annual Report Due', value: 'June 1, 2026', icon: ChevronRight },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <span className="text-brewery-500">{item.label}:</span>
            <span className="text-brewery-200 font-medium">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brewery-700/30">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all',
              activeTab === tab.id
                ? 'text-amber-400 border-amber-400'
                : 'text-brewery-400 border-transparent hover:text-brewery-200'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'reports' && <ReportsTab reports={reports} onFile={handleFile} />}
      {activeTab === 'production' && <ProductionTab />}
      {activeTab === 'removals' && <RemovalsTab />}
      {activeTab === 'calculator' && <TaxCalculatorTab />}
    </div>
  );
}
