import { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, BarChart2, Package, Leaf, FlaskConical, Settings2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Batch } from '../../types';

// ─── Ingredient cost database per style ($/batch at 7 bbl) ──────────────────
const STYLE_COSTS: Record<string, { grain: number; hops: number; yeast: number; water: number; other: number }> = {
  default:  { grain: 320, hops: 180, yeast: 75, water: 45, other: 80 },
  IPA:      { grain: 350, hops: 320, yeast: 85, water: 45, other: 90 },
  Lager:    { grain: 290, hops: 90,  yeast: 110, water: 45, other: 70 },
  Stout:    { grain: 420, hops: 95,  yeast: 80, water: 45, other: 95 },
  Wheat:    { grain: 310, hops: 70,  yeast: 75, water: 45, other: 65 },
  Sour:     { grain: 340, hops: 60,  yeast: 150, water: 45, other: 110 },
  Porter:   { grain: 400, hops: 110, yeast: 80, water: 45, other: 90 },
  Blonde:   { grain: 280, hops: 80,  yeast: 75, water: 45, other: 65 },
};

const PACKAGING_COST_BBL = 28; // kegs, cleaning, labor per bbl
const OVERHEAD_PER_BATCH = 185; // utilities, equipment amortization
const PINTS_PER_BBL = 248;

function getCosts(batch: Batch) {
  const style = Object.keys(STYLE_COSTS).find(k => batch.style?.toLowerCase().includes(k.toLowerCase()) || batch.beerName?.toLowerCase().includes(k.toLowerCase())) ?? 'default';
  const base = STYLE_COSTS[style] ?? STYLE_COSTS.default;
  const scaleFactor = (batch.volume ?? 7) / 7;
  const ingredient = (base.grain + base.hops + base.yeast + base.water + base.other) * scaleFactor;
  const packaging = PACKAGING_COST_BBL * (batch.volume ?? 7);
  const overhead = OVERHEAD_PER_BATCH;
  const total = ingredient + packaging + overhead;
  return {
    grain: Math.round(base.grain * scaleFactor),
    hops: Math.round(base.hops * scaleFactor),
    yeast: Math.round(base.yeast * scaleFactor),
    water: Math.round(base.water * scaleFactor),
    other: Math.round(base.other * scaleFactor),
    packaging: Math.round(packaging),
    overhead: Math.round(overhead),
    total: Math.round(total),
    perBbl: Math.round(total / (batch.volume ?? 7)),
    perPint: parseFloat((total / ((batch.volume ?? 7) * PINTS_PER_BBL)).toFixed(2)),
  };
}

function margin(price: number, perPint: number) {
  return Math.round(((price - perPint) / price) * 100);
}

// ─── CostBar ─────────────────────────────────────────────────────────────────
function CostBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-brewery-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-brewery-800/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-brewery-200 w-12 text-right">${value}</span>
    </div>
  );
}

// ─── BatchCostCard ────────────────────────────────────────────────────────────
function BatchCostCard({ batch, overrides, onOverride }: {
  batch: Batch;
  overrides: Record<string, number>;
  onOverride: (key: string, val: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const costs = useMemo(() => {
    const base = getCosts(batch);
    return {
      ...base,
      grain: overrides.grain ?? base.grain,
      hops: overrides.hops ?? base.hops,
      yeast: overrides.yeast ?? base.yeast,
      other: overrides.other ?? base.other,
      total: Math.round((overrides.grain ?? base.grain) + (overrides.hops ?? base.hops) + (overrides.yeast ?? base.yeast) + base.water + (overrides.other ?? base.other) + base.packaging + base.overhead),
      perBbl: 0,
      perPint: 0,
    };
  }, [batch, overrides]);

  const correctedTotal = costs.grain + costs.hops + costs.yeast + costs.water + costs.other + costs.packaging + costs.overhead;
  const correctedPerPint = parseFloat((correctedTotal / ((batch.volume ?? 7) * PINTS_PER_BBL)).toFixed(2));
  const correctedPerBbl = Math.round(correctedTotal / (batch.volume ?? 7));

  const prices = [6, 7, 8];
  const bestMargin = margin(8, correctedPerPint);

  return (
    <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/20 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-brewery-100">{batch.beerName}</h3>
          <p className="text-xs text-brewery-400">{batch.batchNumber} · {batch.volume} bbl · {batch.style}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-emerald-400">${correctedTotal.toLocaleString()}</p>
          <p className="text-[10px] text-brewery-500">Total Batch Cost</p>
        </div>
      </div>

      {/* Per-unit metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-brewery-800/40 rounded-lg p-3 text-center">
          <p className="text-sm font-bold text-amber-400">${correctedPerBbl}</p>
          <p className="text-[10px] text-brewery-500">/ Barrel</p>
        </div>
        <div className="bg-brewery-800/40 rounded-lg p-3 text-center">
          <p className="text-sm font-bold text-blue-400">${correctedPerPint.toFixed(2)}</p>
          <p className="text-[10px] text-brewery-500">/ Pint</p>
        </div>
        <div className="bg-brewery-800/40 rounded-lg p-3 text-center">
          <p className={`text-sm font-bold ${bestMargin >= 70 ? 'text-emerald-400' : bestMargin >= 55 ? 'text-amber-400' : 'text-red-400'}`}>
            {bestMargin}%
          </p>
          <p className="text-[10px] text-brewery-500">Margin @$8</p>
        </div>
      </div>

      {/* Cost breakdown bars */}
      <div className="space-y-2 mb-4">
        <CostBar label="Grain/Malt" value={costs.grain} total={correctedTotal} color="bg-amber-500" />
        <CostBar label="Hops" value={costs.hops} total={correctedTotal} color="bg-green-500" />
        <CostBar label="Yeast" value={costs.yeast} total={correctedTotal} color="bg-blue-500" />
        <CostBar label="Packaging" value={costs.packaging} total={correctedTotal} color="bg-purple-500" />
        <CostBar label="Overhead" value={costs.overhead} total={correctedTotal} color="bg-gray-500" />
      </div>

      {/* Price / margin table */}
      <div className="bg-brewery-800/30 rounded-lg p-3 mb-3">
        <p className="text-[10px] font-semibold text-brewery-400 uppercase tracking-wider mb-2">Margin at Retail Price</p>
        <div className="grid grid-cols-3 gap-2">
          {prices.map(p => {
            const m = margin(p, correctedPerPint);
            return (
              <div key={p} className={`text-center rounded-lg py-2 border ${m >= 70 ? 'border-emerald-500/30 bg-emerald-900/20' : m >= 55 ? 'border-amber-500/30 bg-amber-900/20' : 'border-red-500/30 bg-red-900/20'}`}>
                <p className="text-sm font-bold text-brewery-100">${p}</p>
                <p className={`text-xs font-bold ${m >= 70 ? 'text-emerald-400' : m >= 55 ? 'text-amber-400' : 'text-red-400'}`}>{m}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editable costs toggle */}
      <button
        onClick={() => setEditing(!editing)}
        className="flex items-center gap-1.5 text-xs text-brewery-500 hover:text-brewery-300 transition-colors"
      >
        <Settings2 className="w-3 h-3" />
        {editing ? 'Hide cost editor' : 'Edit ingredient costs'}
      </button>

      {editing && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(['grain', 'hops', 'yeast', 'other'] as const).map(key => (
            <div key={key}>
              <label className="text-[10px] text-brewery-400 mb-0.5 block capitalize">{key} ($)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={overrides[key] ?? getCosts(batch)[key]}
                onChange={e => onOverride(key, parseInt(e.target.value) || 0)}
                className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded px-2 py-1 text-xs text-brewery-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main BatchCostTab ────────────────────────────────────────────────────────
export default function BatchCostTab({ batches }: { batches: Batch[] }) {
  const [overrides, setOverrides] = useState<Record<string, Record<string, number>>>({});

  const activeBatches = batches.filter(b => !['packaged'].includes(b.status));
  const allBatches = batches.slice(0, 8);

  const costData = allBatches.map(b => {
    const ov = overrides[b.id] ?? {};
    const base = getCosts(b);
    const grain = ov.grain ?? base.grain;
    const hops = ov.hops ?? base.hops;
    const yeast = ov.yeast ?? base.yeast;
    const other = ov.other ?? base.other;
    const total = grain + hops + yeast + base.water + other + base.packaging + base.overhead;
    const perPint = total / ((b.volume ?? 7) * PINTS_PER_BBL);
    return {
      batch: b,
      total,
      perPint,
      margin8: margin(8, perPint),
    };
  });

  const chartData = costData
    .sort((a, b) => b.margin8 - a.margin8)
    .map(d => ({ name: d.batch.beerName.split(' ').slice(0, 2).join(' '), margin: d.margin8, cost: d.total }));

  const totalCost = costData.reduce((s, d) => s + d.total, 0);
  const avgMargin = costData.length > 0 ? Math.round(costData.reduce((s, d) => s + d.margin8, 0) / costData.length) : 0;
  const mostProfitable = costData.sort((a, b) => b.margin8 - a.margin8)[0];
  const leastProfitable = costData.sort((a, b) => a.margin8 - b.margin8)[0];

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FlaskConical className="w-12 h-12 text-brewery-600" />
        <p className="text-brewery-400 font-medium">No batches to analyze</p>
        <p className="text-brewery-500 text-sm">Create a batch to see cost analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-emerald-400" /><span className="text-xs text-brewery-400">Total Brew Cost</span></div>
          <p className="text-2xl font-bold text-emerald-400">${totalCost.toLocaleString()}</p>
          <p className="text-[10px] text-brewery-500">{allBatches.length} active batches</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><BarChart2 className="w-4 h-4 text-amber-400" /><span className="text-xs text-brewery-400">Avg Gross Margin</span></div>
          <p className={`text-2xl font-bold ${avgMargin >= 70 ? 'text-emerald-400' : avgMargin >= 55 ? 'text-amber-400' : 'text-red-400'}`}>{avgMargin}%</p>
          <p className="text-[10px] text-brewery-500">At $8 retail</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-blue-400" /><span className="text-xs text-brewery-400">Most Profitable</span></div>
          <p className="text-sm font-bold text-blue-400 leading-tight">{mostProfitable?.batch.beerName ?? '—'}</p>
          <p className="text-[10px] text-brewery-500">{mostProfitable?.margin8 ?? 0}% margin</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-red-400" /><span className="text-xs text-brewery-400">Needs Attention</span></div>
          <p className="text-sm font-bold text-red-400 leading-tight">{leastProfitable?.batch.beerName ?? '—'}</p>
          <p className="text-[10px] text-brewery-500">{leastProfitable?.margin8 ?? 0}% margin</p>
        </div>
      </div>

      {/* Margin comparison chart */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brewery-200 mb-4">Gross Margin by Beer (at $8 retail)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barSize={28}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ background: '#24180b', border: '1px solid #5c3e1940', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [`${v}%`, 'Margin']}
            />
            <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.margin >= 70 ? '#10b981' : entry.margin >= 55 ? '#f59e0b' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-[10px] text-brewery-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />≥70% Great</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />55-70% OK</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />&lt;55% Review pricing</span>
        </div>
      </div>

      {/* Cost insights */}
      <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-amber-300 mb-2">💡 Pricing Insights</h4>
        <div className="space-y-1 text-xs text-amber-200/70">
          {mostProfitable && <p>• <strong className="text-amber-300">{mostProfitable.batch.beerName}</strong> is your most profitable at {mostProfitable.margin8}% margin — consider featuring it in promotions.</p>}
          {leastProfitable && leastProfitable.margin8 < 60 && <p>• <strong className="text-red-300">{leastProfitable.batch.beerName}</strong> margin ({leastProfitable.margin8}%) is below target — consider a $0.50 price increase or ingredient substitution.</p>}
          <p>• Industry benchmark for craft beer gross margin is 65-75% at retail. Your average: <strong className={`${avgMargin >= 65 ? 'text-emerald-300' : 'text-amber-300'}`}>{avgMargin}%</strong></p>
        </div>
      </div>

      {/* Per-batch cards */}
      <div>
        <h3 className="text-sm font-semibold text-brewery-200 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-400" />
          Per-Batch Cost Breakdown
          <span className="text-xs font-normal text-brewery-500 ml-1">Click "Edit ingredient costs" to override estimates</span>
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {allBatches.map(batch => (
            <BatchCostCard
              key={batch.id}
              batch={batch}
              overrides={overrides[batch.id] ?? {}}
              onOverride={(key, val) => setOverrides(prev => ({
                ...prev,
                [batch.id]: { ...(prev[batch.id] ?? {}), [key]: val },
              }))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
