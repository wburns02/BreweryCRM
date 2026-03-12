import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Users, Calculator } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, ScatterChart, Scatter, ZAxis, Legend } from 'recharts';
import { useData } from '../../context/DataContext';
import { clsx } from 'clsx';

const fmt = (n: number) => '$' + Math.round(n).toLocaleString();
const fmtPct = (n: number) => (isFinite(n) ? n.toFixed(1) : '0.0') + '%';
const safeDivide = (a: number, b: number, fallback = 0) => b === 0 ? fallback : a / b;
const pctChange = (curr: number, prev: number) => prev === 0 ? 0 : ((curr - prev) / prev) * 100;

const CHART_COLORS = {
  beer: '#d97706', food: '#10b981', na: '#60a5fa', wholesale: '#a78bfa',
  merch: '#9ca3af', events: '#fb7185',
};

const TOOLTIP_STYLE = { backgroundColor: '#24180b', border: '1px solid rgba(92,62,25,0.25)', borderRadius: 8, fontSize: 11 };

const CATEGORY_PRICES: Record<string, number> = { flagship: 7, seasonal: 8, limited: 10, experimental: 8 };

type TabId = 'overview' | 'pnl' | 'beer' | 'labor';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'pnl', label: 'P&L Statement', icon: DollarSign },
  { id: 'beer', label: 'Beer Economics', icon: TrendingUp },
  { id: 'labor', label: 'Labor & Overhead', icon: Users },
];

// ─── Stat Card ───
function StatCard({ label, value, subtitle, change }: { label: string; value: string; subtitle?: string; change?: number }) {
  return (
    <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
      <p className="text-[11px] font-medium text-brewery-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-amber-400" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {change !== undefined && (
          <span className={clsx('flex items-center gap-0.5 text-xs font-medium', change >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change >= 0 ? '+' : ''}{fmtPct(change)}
          </span>
        )}
        {subtitle && <span className="text-xs text-brewery-500">{subtitle}</span>}
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE} className="px-3 py-2 shadow-xl">
      <p className="text-brewery-300 text-xs font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-brewery-400">{p.name}</span>
          <span className="text-brewery-200 ml-auto font-medium">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 1: OVERVIEW
// ═══════════════════════════════════════════════
function OverviewTab() {
  const { monthlyFinancials } = useData();
  if (monthlyFinancials.length < 2) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-full bg-amber-600/10 flex items-center justify-center">
        <Calculator className="w-8 h-8 text-amber-600/40" />
      </div>
      <p className="text-brewery-300 font-medium">No financial data yet</p>
      <p className="text-brewery-500 text-sm text-center max-w-xs">Financial overview will populate after at least two months of recorded sales data.</p>
    </div>
  );
  const curr = monthlyFinancials[monthlyFinancials.length - 1];
  const prev = monthlyFinancials[monthlyFinancials.length - 2];
  const ytd = monthlyFinancials.reduce((s, m) => s + m.totalRevenue, 0);
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const avgDaily = curr.totalRevenue / daysInMonth;

  const stackedData = monthlyFinancials.map(m => ({
    month: m.monthLabel,
    Beer: m.beerRevenue, Food: m.foodRevenue, NA: m.naRevenue,
    Wholesale: m.wholesaleRevenue, Merch: m.merchandiseRevenue, Events: m.eventRevenue,
  }));

  const revenueMix = [
    { name: 'Beer', value: curr.beerRevenue, color: CHART_COLORS.beer },
    { name: 'Food', value: curr.foodRevenue, color: CHART_COLORS.food },
    { name: 'NA Beverages', value: curr.naRevenue, color: CHART_COLORS.na },
    { name: 'Wholesale', value: curr.wholesaleRevenue, color: CHART_COLORS.wholesale },
    { name: 'Merchandise', value: curr.merchandiseRevenue, color: CHART_COLORS.merch },
    { name: 'Events', value: curr.eventRevenue, color: CHART_COLORS.events },
  ];

  const expenseData = [
    { name: 'Labor', value: curr.laborCost },
    { name: 'COGS', value: curr.cogs },
    { name: 'Rent', value: curr.rent },
    { name: 'Utilities', value: curr.utilities },
    { name: 'Marketing', value: curr.marketing },
    { name: 'Supplies', value: curr.supplies },
    { name: 'Misc', value: curr.misc },
    { name: 'Insurance', value: curr.insurance },
    { name: 'Licenses', value: curr.licenses },
  ].sort((a, b) => b.value - a.value);

  const profitTrend = monthlyFinancials.map(m => ({
    month: m.monthLabel, netProfit: m.netProfit, marginPct: m.netMarginPct,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Revenue" value={fmt(curr.totalRevenue)} change={pctChange(curr.totalRevenue, prev.totalRevenue)} subtitle="vs last month" />
        <StatCard label="Net Profit" value={fmt(curr.netProfit)} change={pctChange(curr.netProfit, prev.netProfit)} subtitle={`${fmtPct(curr.netMarginPct)} margin`} />
        <StatCard label="Avg Daily Revenue" value={fmt(avgDaily)} subtitle="this month" />
        <StatCard label="YTD Revenue" value={fmt(ytd)} subtitle="6 months" />
      </div>

      {/* Revenue Trend — Stacked Area */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brewery-200 mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={stackedData}>
            <defs>
              {Object.entries({ Beer: CHART_COLORS.beer, Food: CHART_COLORS.food, NA: CHART_COLORS.na, Wholesale: CHART_COLORS.wholesale, Merch: CHART_COLORS.merch, Events: CHART_COLORS.events }).map(([k, c]) => (
                <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#5c3e1920" />
            <XAxis dataKey="month" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="Beer" stackId="1" stroke={CHART_COLORS.beer} fill={`url(#grad-Beer)`} />
            <Area type="monotone" dataKey="Food" stackId="1" stroke={CHART_COLORS.food} fill={`url(#grad-Food)`} />
            <Area type="monotone" dataKey="NA" stackId="1" stroke={CHART_COLORS.na} fill={`url(#grad-NA)`} />
            <Area type="monotone" dataKey="Wholesale" stackId="1" stroke={CHART_COLORS.wholesale} fill={`url(#grad-Wholesale)`} />
            <Area type="monotone" dataKey="Merch" stackId="1" stroke={CHART_COLORS.merch} fill={`url(#grad-Merch)`} />
            <Area type="monotone" dataKey="Events" stackId="1" stroke={CHART_COLORS.events} fill={`url(#grad-Events)`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two-Column: Revenue Mix + Expense Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Mix Donut */}
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Revenue Mix — {curr.monthLabel}</h3>
          <div className="flex items-center gap-4">
            <div className="w-[180px] h-[180px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueMix} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {revenueMix.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const d = payload[0].payload as { name: string; value: number };
                    return <div style={TOOLTIP_STYLE} className="px-3 py-2"><span className="text-brewery-200 text-xs">{d.name}: {fmt(d.value)}</span></div>;
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              {revenueMix.map(r => (
                <div key={r.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                  <span className="text-brewery-400 truncate">{r.name}</span>
                  <span className="text-brewery-200 ml-auto font-medium">{fmt(r.value)}</span>
                  <span className="text-brewery-500 w-10 text-right">{fmtPct(safeDivide(r.value, curr.totalRevenue) * 100)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Expense Breakdown — {curr.monthLabel}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={expenseData} layout="vertical" margin={{ left: 60, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5c3e1920" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#8b7355', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
              <Bar dataKey="value" fill="#d97706" radius={[0, 4, 4, 0]} barSize={16}>
                {expenseData.map((_, i) => <Cell key={i} fill={i < 2 ? '#d97706' : '#b45309'} />)}
              </Bar>
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                return <div style={TOOLTIP_STYLE} className="px-3 py-2"><span className="text-brewery-200 text-xs">{payload[0].payload.name}: {fmt(payload[0].value as number)}</span></div>;
              }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profit Trend */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brewery-200 mb-4">Profit Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={profitTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#5c3e1920" />
            <XAxis dataKey="month" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div style={TOOLTIP_STYLE} className="px-3 py-2">
                  <p className="text-brewery-300 text-xs mb-1">{label}</p>
                  <p className="text-emerald-400 text-xs">Profit: {fmt(payload[0].value as number)}</p>
                  <p className="text-amber-400 text-xs">Margin: {fmtPct(payload[1].value as number)}</p>
                </div>
              );
            }} />
            <Line yAxisId="left" type="monotone" dataKey="netProfit" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
            <Line yAxisId="right" type="monotone" dataKey="marginPct" stroke="#d97706" strokeWidth={2} dot={{ r: 4, fill: '#d97706' }} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-2 justify-center">
          <span className="flex items-center gap-1.5 text-[11px] text-brewery-400"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Net Profit</span>
          <span className="flex items-center gap-1.5 text-[11px] text-brewery-400"><span className="w-3 h-0.5 bg-amber-600 inline-block rounded border-dashed" /> Margin %</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 2: P&L STATEMENT
// ═══════════════════════════════════════════════
function PnlTab() {
  const { monthlyFinancials } = useData();
  if (monthlyFinancials.length < 2) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-full bg-amber-600/10 flex items-center justify-center">
        <DollarSign className="w-8 h-8 text-amber-600/40" />
      </div>
      <p className="text-brewery-300 font-medium">No P&L data yet</p>
      <p className="text-brewery-500 text-sm text-center max-w-xs">P&L statement requires at least two months of recorded revenue data to compare periods.</p>
    </div>
  );
  const curr = monthlyFinancials[monthlyFinancials.length - 1];
  const prev = monthlyFinancials[monthlyFinancials.length - 2];
  const ytdSum = (fn: (m: typeof curr) => number) => monthlyFinancials.reduce((s, m) => s + fn(m), 0);

  const grossProfit = curr.totalRevenue - curr.cogs;
  const prevGrossProfit = prev.totalRevenue - prev.cogs;
  const ytdGrossProfit = ytdSum(m => m.totalRevenue - m.cogs);
  const grossMargin = safeDivide(grossProfit, curr.totalRevenue) * 100;
  const prevGrossMargin = safeDivide(prevGrossProfit, prev.totalRevenue) * 100;
  const ytdGrossMargin = safeDivide(ytdGrossProfit, ytdSum(m => m.totalRevenue)) * 100;

  const totalOpex = curr.totalExpenses - curr.cogs;
  const prevTotalOpex = prev.totalExpenses - prev.cogs;
  const ytdTotalOpex = ytdSum(m => m.totalExpenses - m.cogs);

  type Row = { label: string; curr: number; prev: number; ytd: number; isHeader?: boolean; isTotal?: boolean; isPct?: boolean; indent?: boolean };
  const rows: Row[] = [
    { label: 'REVENUE', curr: 0, prev: 0, ytd: 0, isHeader: true },
    { label: 'Beer Sales', curr: curr.beerRevenue, prev: prev.beerRevenue, ytd: ytdSum(m => m.beerRevenue), indent: true },
    { label: 'Food Sales', curr: curr.foodRevenue, prev: prev.foodRevenue, ytd: ytdSum(m => m.foodRevenue), indent: true },
    { label: 'NA Beverages', curr: curr.naRevenue, prev: prev.naRevenue, ytd: ytdSum(m => m.naRevenue), indent: true },
    { label: 'Merchandise', curr: curr.merchandiseRevenue, prev: prev.merchandiseRevenue, ytd: ytdSum(m => m.merchandiseRevenue), indent: true },
    { label: 'Events', curr: curr.eventRevenue, prev: prev.eventRevenue, ytd: ytdSum(m => m.eventRevenue), indent: true },
    { label: 'Wholesale', curr: curr.wholesaleRevenue, prev: prev.wholesaleRevenue, ytd: ytdSum(m => m.wholesaleRevenue), indent: true },
    { label: 'TOTAL REVENUE', curr: curr.totalRevenue, prev: prev.totalRevenue, ytd: ytdSum(m => m.totalRevenue), isTotal: true },
    { label: 'COST OF GOODS SOLD', curr: curr.cogs, prev: prev.cogs, ytd: ytdSum(m => m.cogs) },
    { label: 'GROSS PROFIT', curr: grossProfit, prev: prevGrossProfit, ytd: ytdGrossProfit, isTotal: true },
    { label: 'Gross Margin', curr: grossMargin, prev: prevGrossMargin, ytd: ytdGrossMargin, isPct: true, indent: true },
    { label: 'OPERATING EXPENSES', curr: 0, prev: 0, ytd: 0, isHeader: true },
    { label: 'Labor', curr: curr.laborCost, prev: prev.laborCost, ytd: ytdSum(m => m.laborCost), indent: true },
    { label: 'Rent', curr: curr.rent, prev: prev.rent, ytd: ytdSum(m => m.rent), indent: true },
    { label: 'Utilities', curr: curr.utilities, prev: prev.utilities, ytd: ytdSum(m => m.utilities), indent: true },
    { label: 'Marketing', curr: curr.marketing, prev: prev.marketing, ytd: ytdSum(m => m.marketing), indent: true },
    { label: 'Insurance', curr: curr.insurance, prev: prev.insurance, ytd: ytdSum(m => m.insurance), indent: true },
    { label: 'Licenses', curr: curr.licenses, prev: prev.licenses, ytd: ytdSum(m => m.licenses), indent: true },
    { label: 'Supplies', curr: curr.supplies, prev: prev.supplies, ytd: ytdSum(m => m.supplies), indent: true },
    { label: 'Miscellaneous', curr: curr.misc, prev: prev.misc, ytd: ytdSum(m => m.misc), indent: true },
    { label: 'TOTAL OPERATING EXPENSES', curr: totalOpex, prev: prevTotalOpex, ytd: ytdTotalOpex, isTotal: true },
    { label: 'TOTAL EXPENSES', curr: curr.totalExpenses, prev: prev.totalExpenses, ytd: ytdSum(m => m.totalExpenses), isTotal: true },
    { label: 'NET PROFIT', curr: curr.netProfit, prev: prev.netProfit, ytd: ytdSum(m => m.netProfit), isTotal: true },
    { label: 'Net Margin', curr: curr.netMarginPct, prev: prev.netMarginPct, ytd: safeDivide(ytdSum(m => m.netProfit), ytdSum(m => m.totalRevenue)) * 100, isPct: true, indent: true },
  ];

  return (
    <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-brewery-700/30">
        <h3 className="text-sm font-semibold text-brewery-200">Profit & Loss Statement</h3>
        <p className="text-xs text-brewery-500 mt-0.5">Bearded Hop Brewery — {curr.monthLabel} 2026</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brewery-700/40">
              <th className="text-left py-3 px-5 text-brewery-400 font-medium text-xs w-[40%]" />
              <th className="text-right py-3 px-4 text-brewery-400 font-medium text-xs">This Month</th>
              <th className="text-right py-3 px-4 text-brewery-400 font-medium text-xs">Last Month</th>
              <th className="text-right py-3 px-4 text-brewery-400 font-medium text-xs">Change</th>
              <th className="text-right py-3 px-5 text-brewery-400 font-medium text-xs">YTD</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              if (r.isHeader) {
                return (
                  <tr key={i}>
                    <td colSpan={5} className="pt-5 pb-2 px-5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">{r.label}</td>
                  </tr>
                );
              }
              const change = r.isPct ? r.curr - r.prev : pctChange(r.curr, r.prev);
              return (
                <tr key={i} className={clsx(r.isTotal && 'border-t border-brewery-700/40', i % 2 === 0 && !r.isTotal && 'bg-brewery-800/20')}>
                  <td className={clsx('py-2 px-5 text-brewery-300', r.indent && 'pl-10', r.isTotal && 'font-bold text-brewery-100')}>{r.label}</td>
                  <td className={clsx('py-2 px-4 text-right font-mono', r.isTotal ? 'font-bold text-brewery-100' : 'text-brewery-300')}>
                    {r.isPct ? fmtPct(r.curr) : fmt(r.curr)}
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-brewery-400">
                    {r.isPct ? fmtPct(r.prev) : fmt(r.prev)}
                  </td>
                  <td className={clsx('py-2 px-4 text-right font-mono text-xs', change >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {r.isPct ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}pp` : `${change >= 0 ? '+' : ''}${fmtPct(change)}`}
                  </td>
                  <td className={clsx('py-2 px-5 text-right font-mono', r.isTotal ? 'font-bold text-brewery-100' : 'text-brewery-400')}>
                    {r.isPct ? fmtPct(r.ytd) : fmt(r.ytd)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 3: BEER ECONOMICS
// ═══════════════════════════════════════════════
function BeerTab() {
  const { beers, detailedRecipes } = useData();
  const beerData = useMemo(() => {
    return beers.filter(b => b.status === 'on-tap' && !b.isNonAlcoholic).map(b => {
      const recipe = detailedRecipes.find(r => r.beerId === b.id);
      const costPerPint = recipe?.costPerPint ?? 0.18;
      const sellPrice = CATEGORY_PRICES[b.category] ?? 7;
      const marginPerPint = sellPrice - costPerPint;
      const marginPct = safeDivide(marginPerPint, sellPrice) * 100;
      const monthlyPours = Math.round(b.totalPours / 3);
      const monthlyRev = monthlyPours * sellPrice;
      const monthlyProfit = monthlyPours * marginPerPint;
      return { id: b.id, name: b.name, style: b.style, category: b.category, costPerPint, sellPrice, marginPerPint, marginPct, monthlyPours, monthlyRev, monthlyProfit };
    }).sort((a, b) => b.marginPct - a.marginPct);
  }, [beers, detailedRecipes]);

  if (beerData.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-full bg-amber-600/10 flex items-center justify-center">
        <BarChart3 className="w-8 h-8 text-amber-600/40" />
      </div>
      <p className="text-brewery-300 font-medium">No beers on tap</p>
      <p className="text-brewery-500 text-sm text-center max-w-xs">Beer economics analysis will appear once beers are added to the tap list.</p>
    </div>
  );

  const best = beerData.reduce((a, b) => b.marginPct > a.marginPct ? b : a, beerData[0]);
  const volumeLeader = beerData.reduce((a, b) => b.monthlyPours > a.monthlyPours ? b : a, beerData[0]);
  const worst = beerData.reduce((a, b) => b.marginPct < a.marginPct ? b : a, beerData[0]);

  const scatterData = beerData.map(b => ({
    x: b.monthlyPours, y: b.marginPct, z: b.monthlyRev, name: b.name, category: b.category,
  }));

  const catColors: Record<string, string> = { flagship: '#d97706', seasonal: '#60a5fa', limited: '#a78bfa', experimental: '#10b981' };

  return (
    <div className="space-y-6">
      {/* Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-brewery-900/80 border border-emerald-700/30 rounded-xl p-4">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Highest Margin</p>
          <p className="text-lg font-bold text-brewery-100">{best.name}</p>
          <p className="text-sm text-emerald-400">{fmtPct(best.marginPct)} margin &middot; {fmt(best.monthlyProfit)}/mo profit</p>
        </div>
        <div className="bg-brewery-900/80 border border-amber-700/30 rounded-xl p-4">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Volume Leader</p>
          <p className="text-lg font-bold text-brewery-100">{volumeLeader.name}</p>
          <p className="text-sm text-amber-400">{volumeLeader.monthlyPours.toLocaleString()} pours &middot; {fmt(volumeLeader.monthlyRev)}/mo</p>
        </div>
        <div className="bg-brewery-900/80 border border-red-700/30 rounded-xl p-4">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Needs Attention</p>
          <p className="text-lg font-bold text-brewery-100">{worst.name}</p>
          <p className="text-sm text-red-400">{fmtPct(worst.marginPct)} margin &middot; Consider price increase</p>
        </div>
      </div>

      {/* Scatter Chart */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brewery-200 mb-4">Volume vs. Margin — Beer Portfolio</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ bottom: 20, left: 10, right: 20, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#5c3e1920" />
            <XAxis type="number" dataKey="x" name="Monthly Pours" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Monthly Pours', position: 'bottom', fill: '#8b7355', fontSize: 11, offset: 0 }} />
            <YAxis type="number" dataKey="y" name="Margin %" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} domain={['auto', 'auto']} />
            <ZAxis type="number" dataKey="z" range={[200, 800]} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div style={TOOLTIP_STYLE} className="px-3 py-2">
                  <p className="text-brewery-200 text-xs font-bold mb-1">{d.name}</p>
                  <p className="text-brewery-400 text-[11px]">Pours: {d.x.toLocaleString()}</p>
                  <p className="text-brewery-400 text-[11px]">Margin: {fmtPct(d.y)}</p>
                  <p className="text-brewery-400 text-[11px]">Revenue: {fmt(d.z)}</p>
                </div>
              );
            }} />
            <Legend content={() => (
              <div className="flex items-center gap-4 justify-center mt-2">
                {Object.entries(catColors).map(([k, c]) => (
                  <span key={k} className="flex items-center gap-1.5 text-[11px] text-brewery-400 capitalize"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c }} />{k}</span>
                ))}
              </div>
            )} />
            {Object.entries(catColors).map(([cat, color]) => (
              <Scatter key={cat} name={cat} data={scatterData.filter(d => d.category === cat)} fill={color} fillOpacity={0.8} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Profitability Table */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-brewery-700/30">
          <h3 className="text-sm font-semibold text-brewery-200">Beer Profitability Detail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brewery-700/40">
                {['Beer', 'Style', 'Cost/Pint', 'Sell Price', 'Margin', 'Mo. Pours', 'Mo. Revenue', 'Mo. Profit'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-brewery-400 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {beerData.map((b, i) => (
                <tr key={b.id} className={clsx(i % 2 === 0 && 'bg-brewery-800/20', 'hover:bg-brewery-800/40 transition-colors')}>
                  <td className="py-2.5 px-4 text-brewery-100 font-medium">{b.name}</td>
                  <td className="py-2.5 px-4 text-brewery-400 text-xs">{b.style}</td>
                  <td className="py-2.5 px-4 text-brewery-300 font-mono">${b.costPerPint.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-brewery-300 font-mono">${b.sellPrice}</td>
                  <td className={clsx('py-2.5 px-4 font-mono font-medium', b.marginPct > 97 ? 'text-emerald-400' : b.marginPct > 95 ? 'text-amber-400' : 'text-red-400')}>{fmtPct(b.marginPct)}</td>
                  <td className="py-2.5 px-4 text-brewery-300 font-mono">{b.monthlyPours.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-brewery-200 font-mono">{fmt(b.monthlyRev)}</td>
                  <td className="py-2.5 px-4 text-emerald-400 font-mono">{fmt(b.monthlyProfit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 4: LABOR & OVERHEAD
// ═══════════════════════════════════════════════
function LaborTab() {
  const { staff, monthlyFinancials } = useData();
  if (monthlyFinancials.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-full bg-amber-600/10 flex items-center justify-center">
        <Users className="w-8 h-8 text-amber-600/40" />
      </div>
      <p className="text-brewery-300 font-medium">No labor data yet</p>
      <p className="text-brewery-500 text-sm text-center max-w-xs">Labor & overhead analysis will populate once financial records are available.</p>
    </div>
  );
  const activeStaff = staff.filter(s => s.status === 'active');
  const totalWeeklyLabor = activeStaff.reduce((s, m) => s + m.hourlyRate * m.hoursThisWeek, 0);
  const totalWeeklyHours = activeStaff.reduce((s, m) => s + m.hoursThisWeek, 0);
  const annualizedLabor = totalWeeklyLabor * 52;
  const curr = monthlyFinancials[monthlyFinancials.length - 1];
  const laborPctOfRevenue = safeDivide(curr.laborCost, curr.totalRevenue) * 100;
  const revPerLaborHour = safeDivide(curr.totalRevenue, totalWeeklyHours * 4.33);

  const staffData = activeStaff.map(s => ({
    name: `${s.firstName} ${s.lastName}`, role: s.role, hours: s.hoursThisWeek, rate: s.hourlyRate,
    weeklyCost: s.hourlyRate * s.hoursThisWeek, sales: s.salesThisWeek,
    revPerHour: safeDivide(s.salesThisWeek, s.hoursThisWeek),
  })).sort((a, b) => b.revPerHour - a.revPerHour);

  const fixedCosts = curr.rent + curr.insurance + curr.licenses;
  const variableCosts = curr.cogs + curr.laborCost + curr.utilities + curr.marketing + curr.supplies + curr.misc;
  const variableRatio = safeDivide(variableCosts, curr.totalRevenue);
  const breakEven = safeDivide(fixedCosts, 1 - variableRatio);
  const aboveBreakEven = safeDivide(curr.totalRevenue - breakEven, breakEven) * 100;

  const overheadData = [
    { name: 'Fixed', value: fixedCosts, color: '#60a5fa' },
    { name: 'Variable', value: variableCosts, color: '#d97706' },
  ];

  const fixedBreakdown = [
    { name: 'Rent', value: curr.rent },
    { name: 'Insurance', value: curr.insurance },
    { name: 'Licenses', value: curr.licenses },
  ];

  const variableBreakdown = [
    { name: 'COGS', value: curr.cogs },
    { name: 'Labor', value: curr.laborCost },
    { name: 'Utilities', value: curr.utilities },
    { name: 'Marketing', value: curr.marketing },
    { name: 'Supplies', value: curr.supplies },
    { name: 'Misc', value: curr.misc },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      {/* Labor KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Weekly Labor Cost" value={fmt(totalWeeklyLabor)} subtitle={`${activeStaff.length} active staff`} />
        <StatCard label="Annualized Labor" value={fmt(annualizedLabor)} subtitle="52-week projection" />
        <StatCard label="Labor % of Revenue" value={fmtPct(laborPctOfRevenue)} subtitle={laborPctOfRevenue < 30 ? 'Healthy (<30%)' : 'Above target (>30%)'} />
        <StatCard label="Revenue per Labor Hr" value={fmt(revPerLaborHour)} subtitle="monthly avg" />
      </div>

      {/* Staff Efficiency Table */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-brewery-700/30">
          <h3 className="text-sm font-semibold text-brewery-200">Staff Efficiency</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brewery-700/40">
                {['Name', 'Role', 'Hours/Wk', 'Rate', 'Weekly Cost', 'Sales/Wk', 'Rev/Hour'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-brewery-400 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffData.map((s, i) => (
                <tr key={s.name} className={clsx(i % 2 === 0 && 'bg-brewery-800/20', 'hover:bg-brewery-800/40 transition-colors')}>
                  <td className={clsx('py-2.5 px-4 font-medium', i === 0 && s.revPerHour > 0 ? 'text-emerald-400' : 'text-brewery-100')}>{s.name}</td>
                  <td className="py-2.5 px-4 text-brewery-400 capitalize text-xs">{s.role}</td>
                  <td className="py-2.5 px-4 text-brewery-300 font-mono">{s.hours}</td>
                  <td className="py-2.5 px-4 text-brewery-300 font-mono">${s.rate}/hr</td>
                  <td className="py-2.5 px-4 text-brewery-300 font-mono">{fmt(s.weeklyCost)}</td>
                  <td className="py-2.5 px-4 text-brewery-300 font-mono">{s.sales > 0 ? fmt(s.sales) : '—'}</td>
                  <td className="py-2.5 px-4 text-brewery-200 font-mono">{s.revPerHour > 0 ? `$${s.revPerHour.toFixed(0)}/hr` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-Column: Overhead Pie + Break-Even */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Overhead Split */}
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Fixed vs. Variable Costs</h3>
          <div className="flex items-start gap-4">
            <div className="w-[160px] h-[160px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={overheadData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                    {overheadData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const d = payload[0].payload;
                    return <div style={TOOLTIP_STYLE} className="px-3 py-2"><span className="text-brewery-200 text-xs">{d.name}: {fmt(d.value)}</span></div>;
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">Fixed ({fmt(fixedCosts)})</p>
                {fixedBreakdown.map(f => (
                  <div key={f.name} className="flex justify-between text-xs text-brewery-400 py-0.5">
                    <span>{f.name}</span><span className="font-mono text-brewery-300">{fmt(f.value)}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">Variable ({fmt(variableCosts)})</p>
                {variableBreakdown.slice(0, 4).map(f => (
                  <div key={f.name} className="flex justify-between text-xs text-brewery-400 py-0.5">
                    <span>{f.name}</span><span className="font-mono text-brewery-300">{fmt(f.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Break-Even */}
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-brewery-200">Break-Even Analysis</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-brewery-400 mb-1">Monthly Fixed Costs</p>
              <p className="text-xl font-bold text-brewery-100 font-mono">{fmt(fixedCosts)}</p>
            </div>
            <div>
              <p className="text-xs text-brewery-400 mb-1">Variable Cost Ratio</p>
              <p className="text-xl font-bold text-brewery-100 font-mono">{fmtPct(variableRatio * 100)}</p>
            </div>
            <div className="pt-3 border-t border-brewery-700/30">
              <p className="text-xs text-brewery-400 mb-1">Break-Even Revenue</p>
              <p className="text-2xl font-bold text-amber-400 font-mono">{fmt(breakEven)}<span className="text-sm text-brewery-500">/mo</span></p>
            </div>
            <div>
              <p className="text-xs text-brewery-400 mb-2">Current vs. Break-Even</p>
              <div className="w-full bg-brewery-800 rounded-full h-3 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-emerald-500 transition-all" style={{ width: `${Math.min(100, (curr.totalRevenue / breakEven) * 100)}%` }} />
              </div>
              <p className="text-xs text-emerald-400 mt-1.5 font-medium">
                Revenue is {fmtPct(aboveBreakEven)} above break-even ({fmt(curr.totalRevenue)} vs {fmt(breakEven)})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════
export default function FinancialsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Tab Bar */}
      <div className="overflow-x-auto -mx-1 scrollbar-hide">
        <div className="flex gap-1 border-b border-brewery-700/30 min-w-max px-1">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap',
                  isActive ? 'border-amber-500 text-amber-400' : 'border-transparent text-brewery-400 hover:text-brewery-200'
                )}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'pnl' && <PnlTab />}
      {activeTab === 'beer' && <BeerTab />}
      {activeTab === 'labor' && <LaborTab />}
    </div>
  );
}
