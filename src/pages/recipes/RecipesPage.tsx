import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Beaker, DollarSign, BarChart3, Award, Play, Check, Timer } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import type { DetailedRecipe } from '../../types';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line,
} from 'recharts';

// ──── SRM COLOR HELPER ────
const srmPoints: [number, string][] = [
  [2, '#F8DE7E'], [4, '#F5CE42'], [6, '#E5A829'], [8, '#CF8E19'],
  [12, '#A85D0A'], [16, '#7C3A05'], [20, '#5C2503'], [30, '#3B1503'], [40, '#2E1503'],
];

function srmToColor(srm: number): string {
  if (srm <= srmPoints[0][0]) return srmPoints[0][1];
  if (srm >= srmPoints[srmPoints.length - 1][0]) return srmPoints[srmPoints.length - 1][1];
  for (let i = 0; i < srmPoints.length - 1; i++) {
    const [s1, c1] = srmPoints[i];
    const [s2, c2] = srmPoints[i + 1];
    if (srm >= s1 && srm <= s2) {
      const t = (srm - s1) / (s2 - s1);
      const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
      const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
      const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }
  return '#2E1503';
}

const categoryBadge: Record<string, 'amber' | 'blue' | 'purple' | 'red'> = {
  flagship: 'amber', seasonal: 'blue', limited: 'purple', experimental: 'red',
};

const grainTypeColors: Record<string, string> = { base: '#f59e0b', specialty: '#a855f7', adjunct: '#3b82f6' };
const hopTypeBadge: Record<string, 'amber' | 'green' | 'blue' | 'purple'> = {
  bittering: 'amber', flavor: 'green', aroma: 'blue', 'dry-hop': 'purple',
};

const tooltipStyle = { background: '#24180b', border: '1px solid #5c3e1940', borderRadius: 8, fontSize: 11 };

// ──── KPI STAT ────
function Kpi({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  const c: Record<string, string> = { amber: 'text-amber-400', blue: 'text-blue-400', emerald: 'text-emerald-400', purple: 'text-purple-400' };
  return (
    <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 ${c[color]}`} /><span className="text-xs text-brewery-400">{label}</span></div>
      <p className={`text-2xl font-bold ${c[color]}`}>{value}</p>
    </div>
  );
}

// ──── RECIPE CARD ────
function RecipeCard({ recipe, onClick }: { recipe: DetailedRecipe; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 cursor-pointer hover:border-amber-500/20 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-10 rounded-sm" style={{ backgroundColor: srmToColor(recipe.targetSRM) }} />
          <div>
            <h3 className="text-sm font-bold text-brewery-100">{recipe.name}</h3>
            <p className="text-[10px] text-brewery-400">{recipe.style}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brewery-800/50 text-brewery-300 font-mono">v{recipe.version}</span>
          <Badge variant={categoryBadge[recipe.category]}>{recipe.category}</Badge>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1.5 my-3">
        {[
          ['OG', recipe.targetOG.toFixed(3)],
          ['FG', recipe.targetFG.toFixed(3)],
          ['ABV', `${recipe.targetABV}%`],
          ['IBU', String(recipe.targetIBU)],
          ['SRM', String(recipe.targetSRM)],
        ].map(([label, val]) => (
          <div key={label} className="text-center p-1.5 rounded bg-brewery-800/30">
            <p className="text-[10px] font-bold text-brewery-200">{val}</p>
            <p className="text-[8px] text-brewery-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-brewery-400">
        <span>${recipe.costPerPint.toFixed(2)}/pint · ${recipe.costPerBarrel.toFixed(0)}/bbl</span>
        <span>{recipe.totalBatches} batches · {recipe.lastBrewed}</span>
      </div>
    </div>
  );
}

// ──── OVERVIEW TAB ────
function OverviewTab({ r }: { r: DetailedRecipe }) {
  const grainCost = r.grainBill.reduce((s, g) => s + g.amount * g.costPerLb, 0);
  const hopCost = r.hopSchedule.reduce((s, h) => s + h.amount * h.costPerOz, 0);
  const yeastCost = r.yeast.costPerPack * r.yeast.packsNeeded;
  const otherCost = r.totalCost - grainCost - hopCost - yeastCost;
  const costData = [
    { name: 'Grain', value: Math.round(grainCost), fill: '#f59e0b' },
    { name: 'Hops', value: Math.round(hopCost), fill: '#34d399' },
    { name: 'Yeast', value: Math.round(yeastCost), fill: '#a855f7' },
    { name: 'Other', value: Math.max(0, Math.round(otherCost)), fill: '#6b7280' },
  ];

  return (
    <div className="space-y-5">
      {/* SRM bar */}
      <div className="h-3 rounded-full" style={{ background: `linear-gradient(90deg, ${srmToColor(Math.max(2, r.targetSRM - 3))}, ${srmToColor(r.targetSRM)}, ${srmToColor(Math.min(40, r.targetSRM + 3))})` }} />

      {/* Vitals grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {[
          ['OG', r.targetOG.toFixed(3)], ['FG', r.targetFG.toFixed(3)], ['ABV', `${r.targetABV}%`],
          ['IBU', String(r.targetIBU)], ['SRM', String(r.targetSRM)], ['Batch', `${r.batchSize} bbl`],
          ['Boil', `${r.boilTime} min`], ['Mash', `${r.mashTemp}°F`], ['Time', `${r.mashTime} min`],
        ].map(([label, val]) => (
          <div key={label} className="text-center p-2.5 rounded-lg bg-brewery-800/30 border border-brewery-700/20">
            <p className="text-xs font-bold text-brewery-200">{val}</p>
            <p className="text-[10px] text-brewery-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Cost breakdown */}
      <div className="bg-brewery-900/60 border border-brewery-700/20 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">Cost Breakdown</h4>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie data={costData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
                {costData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `$${v}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 grid grid-cols-3 gap-3">
            <div className="text-center"><p className="text-lg font-bold text-amber-400">${r.totalCost.toFixed(0)}</p><p className="text-[10px] text-brewery-500">Total Cost</p></div>
            <div className="text-center"><p className="text-lg font-bold text-brewery-200">${r.costPerBarrel.toFixed(0)}</p><p className="text-[10px] text-brewery-500">Cost/BBL</p></div>
            <div className="text-center"><p className="text-lg font-bold text-emerald-400">${r.costPerPint.toFixed(2)}</p><p className="text-[10px] text-brewery-500">Cost/Pint</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {costData.map(c => (
              <div key={c.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
                <span className="text-[10px] text-brewery-400">{c.name} ${c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {r.notes && <p className="text-xs text-brewery-300 italic border-t border-brewery-700/20 pt-3">"{r.notes}"</p>}
    </div>
  );
}

// ──── GRAIN BILL TAB ────
function GrainBillTab({ r }: { r: DetailedRecipe }) {
  const totalWeight = r.grainBill.reduce((s, g) => s + g.amount, 0);
  return (
    <div className="space-y-4">
      {/* Percentage stacked bar */}
      <div className="h-6 rounded-full overflow-hidden flex">
        {r.grainBill.map((g, i) => (
          <div key={i} title={`${g.name} (${g.percentage}%)`}
            style={{ width: `${g.percentage}%`, backgroundColor: grainTypeColors[g.type] || '#6b7280' }}
            className="h-full transition-all hover:opacity-80" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {r.grainBill.map((g, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: grainTypeColors[g.type] }} />
            <span className="text-[10px] text-brewery-400">{g.name} ({g.percentage}%)</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-brewery-700/30 text-brewery-500">
              <th className="text-left py-2 px-2">Grain</th><th className="text-left px-2">Type</th>
              <th className="text-right px-2">Amount</th><th className="text-right px-2">%</th>
              <th className="text-right px-2">°L</th><th className="text-right px-2">PPG</th>
              <th className="text-right px-2">$/lb</th><th className="text-right px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {r.grainBill.map((g, i) => (
              <tr key={i} className="border-b border-brewery-700/10 hover:bg-brewery-800/20">
                <td className="py-2 px-2 text-brewery-200">{g.name}</td>
                <td className="px-2"><Badge variant={g.type === 'base' ? 'amber' : g.type === 'specialty' ? 'purple' : 'blue'}>{g.type}</Badge></td>
                <td className="text-right px-2 text-brewery-300">{g.amount} lbs</td>
                <td className="text-right px-2 text-brewery-300">{g.percentage}%</td>
                <td className="text-right px-2 text-brewery-400">{g.color}</td>
                <td className="text-right px-2 text-brewery-400">{g.ppg}</td>
                <td className="text-right px-2 text-brewery-400">${g.costPerLb.toFixed(2)}</td>
                <td className="text-right px-2 text-amber-400 font-medium">${(g.amount * g.costPerLb).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-brewery-700/30 font-semibold">
              <td className="py-2 px-2 text-brewery-200">Total</td><td /><td className="text-right px-2 text-brewery-200">{totalWeight} lbs</td>
              <td className="text-right px-2 text-brewery-200">100%</td><td /><td /><td />
              <td className="text-right px-2 text-amber-400">${r.grainBill.reduce((s, g) => s + g.amount * g.costPerLb, 0).toFixed(0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ──── HOP SCHEDULE TAB ────
function HopScheduleTab({ r }: { r: DetailedRecipe }) {
  const ibuData = r.hopSchedule.map(h => ({ name: `${h.name} @${h.time >= 0 ? h.time + 'min' : 'DH'}`, ibu: h.ibuContribution, fill: h.type === 'bittering' ? '#f59e0b' : h.type === 'flavor' ? '#34d399' : h.type === 'aroma' ? '#3b82f6' : '#a855f7' }));
  const totalHopCost = r.hopSchedule.reduce((s, h) => s + h.amount * h.costPerOz, 0);

  return (
    <div className="space-y-5">
      {/* Timeline */}
      <div className="relative pl-6">
        <div className="absolute left-[9px] top-2 bottom-2 w-px border-l-2 border-dashed border-brewery-700/40" />
        {r.hopSchedule.map((h, i) => (
          <div key={i} className="relative flex items-start gap-4 py-3">
            <div className={`absolute left-[-15px] top-4 w-3.5 h-3.5 rounded-full ring-2 ring-brewery-950 z-10 ${h.type === 'bittering' ? 'bg-amber-400' : h.type === 'flavor' ? 'bg-emerald-400' : h.type === 'aroma' ? 'bg-blue-400' : 'bg-purple-400'}`} />
            <div className="flex-1 bg-brewery-800/20 border border-brewery-700/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-brewery-100">{h.name}</span>
                  <Badge variant={hopTypeBadge[h.type]}>{h.type}</Badge>
                </div>
                <span className="text-xs font-mono text-brewery-400">{h.time >= 0 ? `@${h.time} min` : 'Dry Hop'}</span>
              </div>
              <div className="flex gap-4 text-[10px] text-brewery-400">
                <span>{h.amount} oz</span>
                <span>α {h.alphaAcid}%</span>
                <span className="text-amber-400">{h.ibuContribution} IBU</span>
                <span>${(h.amount * h.costPerOz).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* IBU chart */}
      <div className="bg-brewery-900/60 border border-brewery-700/20 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">IBU Contribution by Addition</h4>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={ibuData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#c08a3e' }} axisLine={false} tickLine={false} width={110} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="ibu" radius={[0, 4, 4, 0]}>
              {ibuData.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-between text-xs text-brewery-400 mt-2 pt-2 border-t border-brewery-700/20">
          <span>Total IBU: <strong className="text-amber-400">{r.targetIBU}</strong></span>
          <span>Total Hop Cost: <strong className="text-amber-400">${totalHopCost.toFixed(2)}</strong></span>
        </div>
      </div>
    </div>
  );
}

// ──── YEAST & WATER TAB ────
function YeastWaterTab({ r }: { r: DetailedRecipe }) {
  const wp = r.waterProfile;
  const radarData = [
    { axis: 'Ca', value: wp.calcium },
    { axis: 'Mg', value: wp.magnesium },
    { axis: 'Na', value: wp.sodium },
    { axis: 'SO4', value: wp.sulfate },
    { axis: 'Cl', value: wp.chloride },
    { axis: 'HCO3', value: wp.bicarbonate },
  ];
  const clSo4Ratio = wp.sulfate > 0 ? wp.chloride / wp.sulfate : 99;
  const ratioLabel = clSo4Ratio > 2 ? 'Malty' : clSo4Ratio > 1.2 ? 'Balanced-Malty' : clSo4Ratio > 0.8 ? 'Balanced' : clSo4Ratio > 0.5 ? 'Balanced-Hoppy' : 'Hoppy';
  const ratioPct = Math.min(100, Math.max(0, ((clSo4Ratio - 0.2) / 3.0) * 100));

  return (
    <div className="space-y-5">
      {/* Yeast */}
      <div className="bg-brewery-900/60 border border-brewery-700/20 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">Yeast Profile</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div><p className="text-[10px] text-brewery-500">Strain</p><p className="text-xs font-semibold text-brewery-200">{r.yeast.lab} {r.yeast.strain}</p></div>
          <div><p className="text-[10px] text-brewery-500">Name</p><p className="text-xs font-semibold text-brewery-200">{r.yeast.name}</p></div>
          <div><p className="text-[10px] text-brewery-500">Attenuation</p><p className="text-xs font-semibold text-brewery-200">{r.yeast.attenuationMin}–{r.yeast.attenuationMax}%</p></div>
          <div><p className="text-[10px] text-brewery-500">Flocculation</p><p className="text-xs font-semibold text-brewery-200 capitalize">{r.yeast.flocculation}</p></div>
          <div><p className="text-[10px] text-brewery-500">Temp Range</p><p className="text-xs font-semibold text-brewery-200">{r.yeast.tempMin}–{r.yeast.tempMax}°F</p></div>
          <div><p className="text-[10px] text-brewery-500">Pitch Rate</p><p className="text-xs font-semibold text-brewery-200">{r.yeast.pitchRate}M cells/mL/°P</p></div>
          <div><p className="text-[10px] text-brewery-500">Starter</p><Badge variant={r.yeast.starterNeeded ? 'amber' : 'green'}>{r.yeast.starterNeeded ? 'Required' : 'Not Needed'}</Badge></div>
          <div><p className="text-[10px] text-brewery-500">Cost</p><p className="text-xs font-semibold text-amber-400">${(r.yeast.costPerPack * r.yeast.packsNeeded).toFixed(2)} ({r.yeast.packsNeeded} packs)</p></div>
        </div>
      </div>

      {/* Water */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-brewery-900/60 border border-brewery-700/20 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">Water Chemistry</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#5c3e1930" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: '#c08a3e' }} />
              <PolarRadiusAxis tick={{ fontSize: 8, fill: '#5c3e19' }} />
              <Radar dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {/* Cl:SO4 ratio */}
          <div className="bg-brewery-900/60 border border-brewery-700/20 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Cl:SO4 Ratio — {ratioLabel}</h4>
            <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-amber-800 via-brewery-600 to-emerald-800">
              <div className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg" style={{ left: `${ratioPct}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-brewery-500 mt-1"><span>Hoppy (SO4)</span><span>Balanced</span><span>Malty (Cl)</span></div>
            <p className="text-xs text-brewery-300 mt-2">Cl:SO4 = {wp.chloride}:{wp.sulfate} ({clSo4Ratio.toFixed(2)})</p>
          </div>

          {/* Water adjustments */}
          <div className="bg-brewery-900/60 border border-brewery-700/20 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Water Adjustments</h4>
            <div className="space-y-2">
              {r.waterAdjustments.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-brewery-200">{a.mineral}</span>
                  <span className="text-brewery-400">{a.amount} {a.unit}</span>
                  <span className="text-brewery-500 text-[10px]">{a.purpose}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──── BREW HISTORY TAB ────
function BrewHistoryTab({ r }: { r: DetailedRecipe }) {
  const chartData = [...r.brewHistory].reverse().map(b => ({ batch: b.batchNumber.split('-').pop(), qc: b.qcScore, date: b.date }));
  const scores = r.brewHistory.map(b => b.qcScore);
  const best = Math.max(...scores);
  const worst = Math.min(...scores);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const consistency = best - worst <= 5 ? 'Excellent' : best - worst <= 10 ? 'Good' : 'Variable';

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center p-3 rounded-lg bg-brewery-800/30 border border-brewery-700/20">
          <p className="text-lg font-bold text-emerald-400">{best}</p><p className="text-[10px] text-brewery-500">Best QC</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-brewery-800/30 border border-brewery-700/20">
          <p className="text-lg font-bold text-red-400">{worst}</p><p className="text-[10px] text-brewery-500">Worst QC</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-brewery-800/30 border border-brewery-700/20">
          <p className="text-lg font-bold text-amber-400">{avg}</p><p className="text-[10px] text-brewery-500">Average</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-brewery-800/30 border border-brewery-700/20">
          <p className="text-lg font-bold text-blue-400">{consistency}</p><p className="text-[10px] text-brewery-500">Consistency</p>
        </div>
      </div>

      {/* QC chart */}
      <div className="bg-brewery-900/60 border border-brewery-700/20 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">QC Score Trend</h4>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <XAxis dataKey="batch" tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} />
            <YAxis domain={[75, 100]} tick={{ fontSize: 10, fill: '#c08a3e' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="qc" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} name="QC Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Brew history table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-brewery-700/30 text-brewery-500">
              <th className="text-left py-2 px-2">Batch</th><th className="text-left px-2">Date</th>
              <th className="text-right px-2">OG</th><th className="text-right px-2">FG</th>
              <th className="text-right px-2">QC Score</th><th className="text-left px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {r.brewHistory.map((b, i) => (
              <tr key={i} className="border-b border-brewery-700/10 hover:bg-brewery-800/20">
                <td className="py-2 px-2 text-brewery-200 font-mono">{b.batchNumber}</td>
                <td className="px-2 text-brewery-300">{b.date}</td>
                <td className="text-right px-2 text-brewery-300">{b.actualOG.toFixed(3)}</td>
                <td className="text-right px-2 text-brewery-300">{b.actualFG.toFixed(3)}</td>
                <td className="text-right px-2">
                  <span className={`font-bold ${b.qcScore >= 90 ? 'text-emerald-400' : b.qcScore >= 80 ? 'text-amber-400' : 'text-red-400'}`}>{b.qcScore}</span>
                </td>
                <td className="px-2"><Badge variant={b.status === 'packaged' ? 'green' : b.status === 'ready' ? 'blue' : 'amber'}>{b.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──── BREW DAY MODAL ────
function BrewDayModal({ recipe, onClose }: { recipe: DetailedRecipe; onClose: () => void }) {
  const [steps, setSteps] = useState(recipe.brewDaySteps.map(s => ({ ...s })));
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const completed = steps.filter(s => s.completed).length;
  const pct = Math.round((completed / steps.length) * 100);

  useState(() => {
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(interval);
  });

  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <Modal open={true} title={`Brew Day — ${recipe.name}`} onClose={onClose} size="lg">
      <div className="space-y-4">
        {/* Progress + Timer */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-brewery-400 mb-1">
              <span>{completed}/{steps.length} steps</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2.5 bg-brewery-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-brewery-800/50 px-3 py-1.5 rounded-lg">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm font-mono text-amber-400">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {steps.map((step) => (
            <div key={step.id} onClick={() => toggleStep(step.id)}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${step.completed ? 'bg-emerald-900/10 border border-emerald-500/30' : 'bg-brewery-800/20 border border-brewery-700/20 hover:border-brewery-600/30'}`}>
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${step.completed ? 'bg-emerald-500 scale-110' : 'border-2 border-brewery-600'}`}>
                {step.completed && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-brewery-500 font-mono">#{step.order}</span>
                  <span className={`text-xs font-semibold ${step.completed ? 'text-emerald-300 line-through' : 'text-brewery-200'}`}>{step.name}</span>
                </div>
                <p className="text-[10px] text-brewery-400 mt-0.5">{step.description}</p>
                {step.targetValue && <p className="text-[10px] text-amber-400 mt-0.5">Target: {step.targetValue}</p>}
              </div>
            </div>
          ))}
        </div>

        {pct === 100 && (
          <div className="text-center p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl">
            <p className="text-sm font-bold text-emerald-400">Brew Day Complete!</p>
            <p className="text-[10px] text-emerald-500 mt-1">Total time: {formatTime(elapsed)}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ──── MAIN PAGE ────
export default function RecipesPage() {
  const { detailedRecipes } = useData();
  const [selectedRecipe, setSelectedRecipe] = useState<DetailedRecipe | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'grains' | 'hops' | 'yeast-water' | 'history'>('overview');
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [brewDayRecipe, setBrewDayRecipe] = useState<DetailedRecipe | null>(null);

  const recipes = detailedRecipes;

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      if (filter !== 'all' && r.category !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.style.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [recipes, filter, search]);

  // KPIs
  const avgCostBbl = recipes.length ? Math.round(recipes.reduce((s, r) => s + r.costPerBarrel, 0) / recipes.length) : 0;
  const totalBatches = recipes.reduce((s, r) => s + r.totalBatches, 0);
  const allQc = recipes.flatMap(r => r.brewHistory.map(b => b.qcScore));
  const avgQc = allQc.length ? Math.round(allQc.reduce((a, b) => a + b, 0) / allQc.length) : 0;

  if (selectedRecipe) {
    const r = selectedRecipe;
    const tabs = [
      { id: 'overview' as const, label: 'Overview' },
      { id: 'grains' as const, label: 'Grain Bill' },
      { id: 'hops' as const, label: 'Hop Schedule' },
      { id: 'yeast-water' as const, label: 'Yeast & Water' },
      { id: 'history' as const, label: 'Brew History' },
    ];

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => { setSelectedRecipe(null); setActiveTab('overview'); }} className="p-2 rounded-lg bg-brewery-800/50 hover:bg-brewery-800/80 transition-colors">
            <ArrowLeft className="w-4 h-4 text-brewery-300" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-5 h-12 rounded-sm" style={{ backgroundColor: srmToColor(r.targetSRM) }} />
              <div>
                <h2 className="text-lg font-bold text-brewery-50" style={{ fontFamily: 'var(--font-display)' }}>{r.name}</h2>
                <p className="text-xs text-brewery-400">{r.style}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brewery-800/50 text-brewery-300 font-mono">v{r.version}</span>
              <Badge variant={categoryBadge[r.category]}>{r.category}</Badge>
            </div>
          </div>
          <button onClick={() => setBrewDayRecipe(r)} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-amber-600/20">
            <Play className="w-4 h-4" /> Start Brew Day
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-brewery-700/30">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab r={r} />}
        {activeTab === 'grains' && <GrainBillTab r={r} />}
        {activeTab === 'hops' && <HopScheduleTab r={r} />}
        {activeTab === 'yeast-water' && <YeastWaterTab r={r} />}
        {activeTab === 'history' && <BrewHistoryTab r={r} />}

        {brewDayRecipe && <BrewDayModal recipe={brewDayRecipe} onClose={() => setBrewDayRecipe(null)} />}
      </div>
    );
  }

  // ──── LIST VIEW ────
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total Recipes" value={String(recipes.length)} icon={Beaker} color="amber" />
        <Kpi label="Avg Cost/BBL" value={`$${avgCostBbl}`} icon={DollarSign} color="blue" />
        <Kpi label="Total Batches Brewed" value={String(totalBatches)} icon={BarChart3} color="emerald" />
        <Kpi label="Avg QC Score" value={String(avgQc)} icon={Award} color="purple" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', 'flagship', 'seasonal', 'limited', 'experimental'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-amber-600 text-white' : 'bg-brewery-800/50 text-brewery-400 hover:text-brewery-200'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brewery-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes..."
          className="w-full bg-brewery-800/30 border border-brewery-700/30 rounded-lg pl-9 pr-3 py-2 text-sm text-brewery-200 placeholder-brewery-600 focus:outline-none focus:border-amber-500/30" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(r => <RecipeCard key={r.id} recipe={r} onClick={() => setSelectedRecipe(r)} />)}
      </div>
      {filtered.length === 0 && <p className="text-center text-sm text-brewery-500 py-8">No recipes match your filters.</p>}
    </div>
  );
}
