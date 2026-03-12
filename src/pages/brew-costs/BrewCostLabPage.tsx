import { useState, useMemo } from 'react';
import {
  Calculator, TrendingUp, TrendingDown, DollarSign, FlaskConical,
  ChevronDown, ChevronUp, Edit3, Check, X, BarChart3,
  Info, Download,
} from 'lucide-react';
import { useBrewery } from '../../context/BreweryContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../components/ui/ToastProvider';
import Badge from '../../components/ui/Badge';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PINT_PRICE = 7.0;    // Taproom pint price
const LABOR_PER_BATCH = 320; // $320 estimated labor per batch (40 hrs @ $8/hr brewer)
const OVERHEAD_RATE = 0.15;  // 15% overhead on ingredient cost

// Ingredient category colors
const CAT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  grain: { bg: 'bg-amber-900/30', text: 'text-amber-300', dot: 'bg-amber-400' },
  hops: { bg: 'bg-emerald-900/30', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  yeast: { bg: 'bg-blue-900/30', text: 'text-blue-300', dot: 'bg-blue-400' },
  other: { bg: 'bg-purple-900/30', text: 'text-purple-300', dot: 'bg-purple-400' },
};

type IngredientCost = {
  category: 'grain' | 'hops' | 'yeast' | 'other';
  name: string;
  amount: number; // lbs or oz
  unit: string;
  unitCost: number; // $/lb or $/oz
  total: number;
};

type RecipeCost = {
  id: string;
  name: string;
  style: string;
  category: string;
  batchSizeBbl: number;
  pints: number;
  ingredients: IngredientCost[];
  laborCost: number;
  overheadCost: number;
  totalIngredientCost: number;
  totalCost: number;
  costPerBbl: number;
  costPerPint: number;
  revenuePerBbl: number;
  grossMargin: number;
  marginPct: number;
  lastBrewed: string;
  totalBatches: number;
};

function bblToPints(bbl: number): number {
  return Math.round(bbl * 124); // ~124 pints per half-barrel
}

function computeRecipeCost(r: import('../../types').DetailedRecipe): RecipeCost {
  const ingredients: IngredientCost[] = [];

  // Grain bill
  for (const g of r.grainBill) {
    ingredients.push({
      category: 'grain',
      name: g.name,
      amount: g.amount,
      unit: g.unit || 'lbs',
      unitCost: g.costPerLb,
      total: g.amount * g.costPerLb,
    });
  }

  // Hop schedule
  const hopsByName: Record<string, { oz: number; costPerOz: number }> = {};
  for (const h of r.hopSchedule) {
    if (!hopsByName[h.name]) hopsByName[h.name] = { oz: 0, costPerOz: h.costPerOz };
    hopsByName[h.name].oz += h.amount;
  }
  for (const [name, data] of Object.entries(hopsByName)) {
    ingredients.push({
      category: 'hops',
      name,
      amount: data.oz,
      unit: 'oz',
      unitCost: data.costPerOz,
      total: data.oz * data.costPerOz,
    });
  }

  // Yeast
  if (r.yeast) {
    const yeastCost = (r.yeast.costPerPack ?? 12) * (r.yeast.packsNeeded ?? 1);
    ingredients.push({
      category: 'yeast',
      name: r.yeast.name ?? 'Yeast',
      amount: r.yeast.packsNeeded ?? 1,
      unit: 'pkg',
      unitCost: r.yeast.costPerPack ?? 12,
      total: yeastCost,
    });
  }

  const totalIngredientCost = ingredients.reduce((s, i) => s + i.total, 0);
  const overheadCost = Math.round(totalIngredientCost * OVERHEAD_RATE * 100) / 100;
  const laborCost = LABOR_PER_BATCH;
  const totalCost = totalIngredientCost + overheadCost + laborCost;

  const batchBbl = r.batchSize ?? 10;
  const pints = bblToPints(batchBbl);
  const costPerBbl = totalCost / batchBbl;
  const costPerPint = totalCost / pints;
  const revenuePerBbl = PINT_PRICE * 124;
  const grossMargin = revenuePerBbl - costPerBbl;
  const marginPct = (grossMargin / revenuePerBbl) * 100;

  return {
    id: r.id,
    name: r.name,
    style: r.style,
    category: r.category,
    batchSizeBbl: batchBbl,
    pints,
    ingredients,
    laborCost,
    overheadCost,
    totalIngredientCost: Math.round(totalIngredientCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    costPerBbl: Math.round(costPerBbl * 100) / 100,
    costPerPint: Math.round(costPerPint * 100) / 100,
    revenuePerBbl: Math.round(revenuePerBbl * 100) / 100,
    grossMargin: Math.round(grossMargin * 100) / 100,
    marginPct: Math.round(marginPct * 10) / 10,
    lastBrewed: r.lastBrewed ?? '—',
    totalBatches: r.totalBatches ?? 0,
  };
}

// ─── MARGIN BAR ───────────────────────────────────────────────────────────────

function MarginBar({ pct }: { pct: number }) {
  const color = pct >= 60 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-brewery-700/50 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
      <span className={`text-xs font-bold w-10 text-right ${pct >= 60 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

// ─── COST DONUT ───────────────────────────────────────────────────────────────

function CostDonut({ recipe }: { recipe: RecipeCost }) {
  const grainTotal = recipe.ingredients.filter(i => i.category === 'grain').reduce((s, i) => s + i.total, 0);
  const hopsTotal = recipe.ingredients.filter(i => i.category === 'hops').reduce((s, i) => s + i.total, 0);
  const yeastTotal = recipe.ingredients.filter(i => i.category === 'yeast').reduce((s, i) => s + i.total, 0);
  const otherTotal = recipe.ingredients.filter(i => i.category === 'other').reduce((s, i) => s + i.total, 0);

  const segments = [
    { label: 'Grain', value: grainTotal, color: '#d97706' },
    { label: 'Hops', value: hopsTotal, color: '#10b981' },
    { label: 'Yeast', value: yeastTotal, color: '#3b82f6' },
    { label: 'Labor', value: recipe.laborCost, color: '#8b5cf6' },
    { label: 'Overhead', value: recipe.overheadCost, color: '#6b7280' },
    ...(otherTotal > 0 ? [{ label: 'Other', value: otherTotal, color: '#ec4899' }] : []),
  ].filter(s => s.value > 0);

  const total = segments.reduce((s, x) => s + x.value, 0);
  const R = 40, cx = 50, cy = 50, strokeWidth = 12;

  let angle = -90;
  const arcs = segments.map(seg => {
    const pct = seg.value / total;
    const startAngle = angle;
    angle += pct * 360;
    const endAngle = angle;
    const r = R - strokeWidth / 2;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const large = pct > 0.5 ? 1 : 0;
    const circumference = 2 * Math.PI * r;
    const dashLen = pct * circumference;

    return { ...seg, pct, x1, y1, x2, y2, large, dashLen };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="100" height="100" viewBox="0 0 100 100">
          {arcs.map((arc, i) => {
            const r = R - strokeWidth / 2;
            const circumference = 2 * Math.PI * r;
            const startOffset = arcs.slice(0, i).reduce((s, a) => s + a.dashLen, 0);
            return (
              <circle
                key={arc.label}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arc.dashLen} ${circumference - arc.dashLen}`}
                strokeDashoffset={-(startOffset - circumference / 4)}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-brewery-100">${recipe.totalCost.toFixed(0)}</span>
          <span className="text-[8px] text-brewery-500">total</span>
        </div>
      </div>
      <div className="space-y-1 flex-1">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[10px] text-brewery-400">{seg.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-brewery-300">${seg.value.toFixed(0)}</span>
              <span className="text-[9px] text-brewery-600">({((seg.value / total) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RECIPE ROW (expandable) ──────────────────────────────────────────────────

function RecipeRow({ recipe, rank }: { recipe: RecipeCost; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const [editingCost, setEditingCost] = useState<number | null>(null);
  const [draftCost, setDraftCost] = useState('');

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${expanded ? 'border-amber-500/30 shadow-lg shadow-amber-600/5' : 'border-brewery-700/30'}`}>
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-brewery-800/20 transition-colors"
      >
        {/* Rank */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
          rank === 1 ? 'bg-amber-500 text-black' :
          rank === 2 ? 'bg-slate-400 text-black' :
          rank === 3 ? 'bg-amber-700/80 text-white' :
          'bg-brewery-700/50 text-brewery-400'
        }`}>
          {rank}
        </div>

        {/* Name + style */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-brewery-100 truncate">{recipe.name}</h3>
            <Badge variant={recipe.category === 'flagship' ? 'amber' : recipe.category === 'seasonal' ? 'blue' : 'gray'}>
              {recipe.category}
            </Badge>
          </div>
          <p className="text-xs text-brewery-400 truncate">{recipe.style} · {recipe.batchSizeBbl} bbl · {recipe.pints} pints</p>
        </div>

        {/* Cost metrics */}
        <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-brewery-500">Cost/BBL</p>
            <p className="text-sm font-bold text-brewery-200">${recipe.costPerBbl.toFixed(0)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-brewery-500">Cost/Pint</p>
            <p className="text-sm font-bold text-red-400">${recipe.costPerPint.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-brewery-500">Margin/BBL</p>
            <p className={`text-sm font-bold ${recipe.marginPct >= 60 ? 'text-emerald-400' : recipe.marginPct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
              ${recipe.grossMargin.toFixed(0)}
            </p>
          </div>
          <div className="w-28">
            <p className="text-xs text-brewery-500 mb-1">Margin</p>
            <MarginBar pct={recipe.marginPct} />
          </div>
        </div>

        {expanded ? <ChevronUp className="w-4 h-4 text-brewery-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-brewery-400 flex-shrink-0" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-brewery-700/30 p-4 bg-brewery-900/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cost donut */}
            <div>
              <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">Cost Breakdown</h4>
              <CostDonut recipe={recipe} />
            </div>

            {/* Profitability */}
            <div>
              <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">Per-Pint Economics</h4>
              <div className="space-y-2">
                {[
                  { label: 'Sale Price', value: PINT_PRICE, color: 'text-emerald-400' },
                  { label: 'Ingredient Cost', value: -(recipe.totalIngredientCost / recipe.pints), color: 'text-red-400' },
                  { label: 'Labor', value: -(recipe.laborCost / recipe.pints), color: 'text-red-400' },
                  { label: 'Overhead', value: -(recipe.overheadCost / recipe.pints), color: 'text-red-400' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between text-xs">
                    <span className="text-brewery-400">{row.label}</span>
                    <span className={`font-bold ${row.color}`}>{row.value >= 0 ? '+' : ''}${row.value.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-brewery-700/30 pt-2 flex items-center justify-between text-sm font-bold">
                  <span className="text-brewery-200">Net Margin / Pint</span>
                  <span className={recipe.costPerPint < PINT_PRICE ? 'text-emerald-400' : 'text-red-400'}>
                    +${(PINT_PRICE - recipe.costPerPint).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Suggested price */}
              <div className="mt-4 p-3 rounded-xl bg-amber-900/20 border border-amber-700/20">
                <p className="text-xs font-semibold text-amber-300 mb-1">Suggested Prices</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Break-even', price: recipe.costPerPint },
                    { label: '50% Margin', price: recipe.costPerPint / 0.5 },
                    { label: '60% Margin', price: recipe.costPerPint / 0.4 },
                  ].map(p => (
                    <div key={p.label}>
                      <p className="text-[10px] text-brewery-500">{p.label}</p>
                      <p className="text-sm font-bold text-amber-300">${p.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ingredient table */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">Ingredient Costs</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-brewery-500 border-b border-brewery-700/30">
                      <th className="text-left pb-2">Ingredient</th>
                      <th className="text-center pb-2">Category</th>
                      <th className="text-right pb-2">Amount</th>
                      <th className="text-right pb-2">$/unit</th>
                      <th className="text-right pb-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brewery-800/50">
                    {recipe.ingredients.map((ing, i) => {
                      const cat = CAT_COLORS[ing.category] ?? CAT_COLORS.other;
                      return (
                        <tr key={i} className="hover:bg-brewery-800/20">
                          <td className="py-1.5 text-brewery-200 font-medium">{ing.name}</td>
                          <td className="py-1.5 text-center">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                              {ing.category}
                            </span>
                          </td>
                          <td className="py-1.5 text-right text-brewery-300">{ing.amount.toFixed(1)} {ing.unit}</td>
                          <td className="py-1.5 text-right">
                            {editingCost === i ? (
                              <div className="flex items-center gap-1 justify-end">
                                <input
                                  type="number"
                                  value={draftCost}
                                  onChange={e => setDraftCost(e.target.value)}
                                  className="w-16 text-xs bg-brewery-800 border border-amber-500/40 rounded px-1 py-0.5 text-right text-amber-300 focus:outline-none"
                                  autoFocus
                                />
                                <button onClick={() => setEditingCost(null)} className="text-emerald-400"><Check className="w-3 h-3" /></button>
                                <button onClick={() => { setEditingCost(null); setDraftCost(''); }} className="text-red-400"><X className="w-3 h-3" /></button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingCost(i); setDraftCost(ing.unitCost.toFixed(2)); }}
                                className="flex items-center gap-1 ml-auto text-brewery-400 hover:text-amber-300 transition-colors"
                              >
                                <span>${ing.unitCost.toFixed(2)}</span>
                                <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
                              </button>
                            )}
                          </td>
                          <td className="py-1.5 text-right text-brewery-200 font-semibold">${ing.total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    {/* Labor + overhead rows */}
                    {[
                      { name: 'Labor (estimated)', cat: 'other', total: recipe.laborCost },
                      { name: 'Overhead (15%)', cat: 'other', total: recipe.overheadCost },
                    ].map(row => (
                      <tr key={row.name} className="text-brewery-500">
                        <td className="py-1.5 italic">{row.name}</td>
                        <td />
                        <td />
                        <td />
                        <td className="py-1.5 text-right">${row.total.toFixed(2)}</td>
                      </tr>
                    ))}
                    {/* Total */}
                    <tr className="border-t border-brewery-700/40 font-bold text-brewery-100">
                      <td className="pt-2" colSpan={4}>Total Batch Cost</td>
                      <td className="pt-2 text-right text-red-400">${recipe.totalCost.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Brew stats */}
          <div className="mt-4 flex flex-wrap gap-4 pt-3 border-t border-brewery-700/30">
            <div className="text-xs text-brewery-500">Last Brewed: <span className="text-brewery-300">{recipe.lastBrewed}</span></div>
            <div className="text-xs text-brewery-500">Total Batches: <span className="text-brewery-300">{recipe.totalBatches}</span></div>
            <div className="text-xs text-brewery-500">Revenue/Batch: <span className="text-emerald-400 font-semibold">${(PINT_PRICE * recipe.pints).toLocaleString()}</span></div>
            <div className="text-xs text-brewery-500">Profit/Batch: <span className="text-emerald-400 font-semibold">${(PINT_PRICE * recipe.pints - recipe.totalCost).toFixed(0)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

type SortKey = 'margin' | 'cost' | 'name' | 'batches';

export default function BrewCostLabPage() {
  const { detailedRecipes } = useBrewery();
  const { batches } = useData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'compare' | 'optimizer'>('overview');
  const [sortKey, setSortKey] = useState<SortKey>('margin');
  const [targetPintPrice, setTargetPintPrice] = useState(PINT_PRICE.toString());
  const [targetMargin, setTargetMargin] = useState('55');
  const [filterCat, setFilterCat] = useState<string>('all');

  const recipeCosts = useMemo(() =>
    detailedRecipes.map(r => computeRecipeCost(r)),
  [detailedRecipes]);

  const filtered = useMemo(() => {
    let list = [...recipeCosts];
    if (filterCat !== 'all') list = list.filter(r => r.category === filterCat);
    switch (sortKey) {
      case 'margin': return list.sort((a, b) => b.marginPct - a.marginPct);
      case 'cost': return list.sort((a, b) => a.costPerBbl - b.costPerBbl);
      case 'name': return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'batches': return list.sort((a, b) => b.totalBatches - a.totalBatches);
    }
  }, [recipeCosts, sortKey, filterCat]);

  const avgMargin = recipeCosts.length > 0
    ? recipeCosts.reduce((s, r) => s + r.marginPct, 0) / recipeCosts.length
    : 0;
  const bestMargin = recipeCosts.length > 0 ? recipeCosts.reduce((best, r) => r.marginPct > best.marginPct ? r : best) : null;
  const lowestCost = recipeCosts.length > 0 ? recipeCosts.reduce((best, r) => r.costPerBbl < best.costPerBbl ? r : best) : null;

  const pintPrice = parseFloat(targetPintPrice) || PINT_PRICE;
  const marginTarget = parseFloat(targetMargin) / 100;

  function exportCSV() {
    const headers = ['Recipe', 'Style', 'Category', 'Batch (BBL)', 'Total Cost', 'Cost/BBL', 'Cost/Pint', 'Revenue/BBL', 'Gross Margin/BBL', 'Margin %'];
    const rows = recipeCosts.map(r => [
      r.name, r.style, r.category, r.batchSizeBbl, r.totalCost.toFixed(2),
      r.costPerBbl.toFixed(2), r.costPerPint.toFixed(2), r.revenuePerBbl.toFixed(2),
      r.grossMargin.toFixed(2), r.marginPct.toFixed(1) + '%',
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `brew-cost-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast('success', 'Cost analysis exported to CSV');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-brewery-50" style={{ fontFamily: 'var(--font-display)' }}>
              Brew Cost Lab
            </h1>
          </div>
          <p className="text-sm text-brewery-400">
            Grain-to-glass cost analysis · Track profitability per recipe · Optimize pricing
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-brewery-800/50 border border-brewery-700/30 rounded-lg text-sm text-brewery-300 hover:text-brewery-100 transition-all"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1 flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5" />Avg Gross Margin
          </p>
          <p className={`text-2xl font-bold ${avgMargin >= 60 ? 'text-emerald-400' : avgMargin >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
            {avgMargin.toFixed(1)}%
          </p>
          <p className="text-xs text-brewery-500 mt-1">across {recipeCosts.length} recipes</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />Best Margin
          </p>
          <p className="text-2xl font-bold text-emerald-400">{bestMargin?.marginPct.toFixed(0)}%</p>
          <p className="text-xs text-brewery-500 mt-1 truncate">{bestMargin?.name}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />Lowest Cost/BBL
          </p>
          <p className="text-2xl font-bold text-blue-400">${lowestCost?.costPerBbl.toFixed(0)}</p>
          <p className="text-xs text-brewery-500 mt-1 truncate">{lowestCost?.name}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1 flex items-center gap-1">
            <FlaskConical className="w-3.5 h-3.5" />Active Batches
          </p>
          <p className="text-2xl font-bold text-amber-400">{batches.filter(b => b.status !== 'packaged').length}</p>
          <p className="text-xs text-brewery-500 mt-1">in production</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brewery-700/30 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview' as const, label: 'Recipe Costs', icon: FlaskConical },
          { id: 'compare' as const, label: 'Cost Comparison', icon: BarChart3 },
          { id: 'optimizer' as const, label: 'Price Optimizer', icon: Calculator },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* RECIPE COSTS TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Filter + sort bar */}
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <div className="flex gap-1 overflow-x-auto scrollbar-none flex-shrink-0 max-w-full">
              {['all', 'flagship', 'seasonal', 'limited', 'experimental'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
                    filterCat === cat ? 'bg-amber-600/20 text-amber-300 border-amber-500/30' : 'bg-brewery-800/40 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-brewery-500">Sort by:</span>
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value as SortKey)}
                className="bg-brewery-800/50 border border-brewery-700/30 rounded-lg px-2 py-1 text-xs text-brewery-200 focus:outline-none focus:border-amber-500/40"
              >
                <option value="margin">Best Margin</option>
                <option value="cost">Lowest Cost</option>
                <option value="name">Name A-Z</option>
                <option value="batches">Most Brewed</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-brewery-500">
              <FlaskConical className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No recipes found</p>
              <p className="text-sm">Add recipes in Recipe Lab to see cost analysis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((recipe, i) => (
                <RecipeRow key={recipe.id} recipe={recipe} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* COST COMPARISON TAB */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Cost Per Barrel — All Recipes
            </h3>
            <div className="space-y-3">
              {[...recipeCosts].sort((a, b) => a.costPerBbl - b.costPerBbl).map((recipe) => {
                const maxCost = Math.max(...recipeCosts.map(r => r.costPerBbl));
                const pct = (recipe.costPerBbl / maxCost) * 100;
                return (
                  <div key={recipe.id} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-brewery-300 truncate max-w-[200px]">{recipe.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-brewery-500">${recipe.costPerBbl.toFixed(0)}/bbl</span>
                        <span className={`text-xs font-bold ${recipe.marginPct >= 60 ? 'text-emerald-400' : recipe.marginPct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                          {recipe.marginPct.toFixed(0)}% margin
                        </span>
                      </div>
                    </div>
                    <div className="h-6 rounded-lg overflow-hidden bg-brewery-800/50 relative">
                      {/* Cost bar */}
                      <div
                        className="h-full rounded-l-lg bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${pct}%` }}
                      >
                        {pct > 30 && <span className="text-[10px] font-bold text-black">${recipe.costPerBbl.toFixed(0)}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Margin ranking */}
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Gross Margin Ranking
            </h3>
            <div className="space-y-3">
              {[...recipeCosts].sort((a, b) => b.marginPct - a.marginPct).map((recipe, idx) => (
                <div key={recipe.id} className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                    idx === 0 ? 'bg-amber-500 text-black' : idx === 1 ? 'bg-slate-400 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-brewery-700 text-brewery-400'
                  }`}>{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-brewery-300 truncate">{recipe.name}</span>
                      <span className="text-xs text-brewery-500 ml-2">${recipe.grossMargin.toFixed(0)}/bbl profit</span>
                    </div>
                    <MarginBar pct={recipe.marginPct} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRICE OPTIMIZER TAB */}
      {activeTab === 'optimizer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input controls */}
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              Pricing Assumptions
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-brewery-400 block mb-1.5">Target Pint Price ($)</label>
                <input
                  type="number"
                  step="0.25"
                  value={targetPintPrice}
                  onChange={e => setTargetPintPrice(e.target.value)}
                  className="w-full bg-brewery-800/50 border border-brewery-700/30 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>
              <div>
                <label className="text-xs text-brewery-400 block mb-1.5">Target Gross Margin (%)</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={targetMargin}
                  onChange={e => setTargetMargin(e.target.value)}
                  className="w-full bg-brewery-800/50 border border-brewery-700/30 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/40"
                />
                <div className="mt-2 h-2 rounded-full bg-brewery-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${parseFloat(targetMargin) >= 60 ? 'bg-emerald-500' : parseFloat(targetMargin) >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, parseFloat(targetMargin) || 0)}%` }}
                  />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-700/20 flex gap-2">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300">
                  Adjust the pint price and target margin to see which recipes hit your profitability goal.
                  Recipes in red need repricing to meet your margin target.
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4">Recipes vs Target</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {[...recipeCosts].sort((a, b) => {
                const aMargin = (pintPrice - a.costPerPint) / pintPrice * 100;
                const bMargin = (pintPrice - b.costPerPint) / pintPrice * 100;
                return bMargin - aMargin;
              }).map(recipe => {
                const actualMargin = ((pintPrice - recipe.costPerPint) / pintPrice) * 100;
                const meetsTarget = actualMargin >= parseFloat(targetMargin);
                const requiredPrice = recipe.costPerPint / (1 - marginTarget);
                return (
                  <div key={recipe.id} className={`p-3 rounded-xl border ${meetsTarget ? 'bg-emerald-900/10 border-emerald-700/20' : 'bg-red-900/10 border-red-700/20'}`}>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-xs font-semibold text-brewery-200">{recipe.name}</p>
                        <p className="text-[10px] text-brewery-500">Cost: ${recipe.costPerPint.toFixed(2)}/pint</p>
                      </div>
                      <div className="text-right">
                        {meetsTarget ? (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{actualMargin.toFixed(0)}%</span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1 text-red-400">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span className="text-xs font-bold">{actualMargin.toFixed(0)}%</span>
                            </div>
                            <p className="text-[9px] text-amber-400">need ${requiredPrice.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-brewery-800/50 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${meetsTarget ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.max(0, Math.min(100, actualMargin))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary stats */}
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            {(() => {
              const passCount = recipeCosts.filter(r => {
                const m = ((pintPrice - r.costPerPint) / pintPrice) * 100;
                return m >= parseFloat(targetMargin);
              }).length;
              const failCount = recipeCosts.length - passCount;
              const projProfit = recipeCosts.reduce((s, r) => {
                return s + (pintPrice - r.costPerPint) * r.pints * r.totalBatches;
              }, 0);
              return (
                <>
                  <div className="bg-emerald-900/20 border border-emerald-700/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-brewery-400">Meeting Target</p>
                    <p className="text-2xl font-bold text-emerald-400">{passCount}</p>
                    <p className="text-xs text-brewery-500">recipes at {targetMargin}%+ margin</p>
                  </div>
                  <div className="bg-red-900/20 border border-red-700/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-brewery-400">Need Repricing</p>
                    <p className="text-2xl font-bold text-red-400">{failCount}</p>
                    <p className="text-xs text-brewery-500">recipes below target</p>
                  </div>
                  <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-brewery-400">Projected Profit</p>
                    <p className="text-2xl font-bold text-amber-400">${(projProfit / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-brewery-500">lifetime at ${pintPrice}/pint</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
