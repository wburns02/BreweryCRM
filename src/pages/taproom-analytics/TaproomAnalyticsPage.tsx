import { useState, useEffect, useMemo } from 'react';
import { Activity, Users, TrendingUp, TrendingDown, Star, Clock, Droplets, Crown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';
import { useData } from '../../context/DataContext';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const fmt = (n: number) => '$' + Math.round(n).toLocaleString();

const TOOLTIP_STYLE = { backgroundColor: '#24180b', border: '1px solid rgba(92,62,25,0.25)', borderRadius: 8, fontSize: 11 };
const CAT_COLORS: Record<string, string> = { flagship: '#d97706', seasonal: '#60a5fa', limited: '#a78bfa', experimental: '#10b981' };
const SOURCE_COLORS: Record<string, string> = { 'word-of-mouth': '#d97706', instagram: '#ec4899', google: '#3b82f6', yelp: '#ef4444', facebook: '#2563eb', untappd: '#f59e0b', 'friend-referral': '#10b981', 'pre-opening': '#a78bfa' };
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIER_COLORS: Record<string, string> = { Bronze: '#9ca3af', Silver: '#60a5fa', Gold: '#d97706', Platinum: '#a78bfa' };

type TabId = 'live' | 'pour' | 'guests' | 'trends';
const tabList: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'live', label: 'Live Shift View', icon: Activity },
  { id: 'pour', label: 'Pour Analytics', icon: Droplets },
  { id: 'guests', label: 'Guest Insights', icon: Users },
  { id: 'trends', label: 'Trend Analysis', icon: TrendingUp },
];

function getShiftLabel(hour: number) {
  if (hour >= 11 && hour < 14) return 'Lunch Shift';
  if (hour >= 14 && hour < 17) return 'Afternoon Service';
  if (hour >= 17 && hour < 20) return 'Happy Hour';
  if (hour >= 20 && hour < 23) return 'Evening Service';
  return 'After Hours';
}

function getShiftStatus(reservationCount: number) {
  if (reservationCount >= 4) return { color: 'bg-red-500', label: 'At Capacity' };
  if (reservationCount >= 2) return { color: 'bg-amber-500', label: 'Busy' };
  return { color: 'bg-emerald-500', label: 'Open' };
}

// ═══════════════════════════════════════════════
// TAB 1: LIVE SHIFT VIEW
// ═══════════════════════════════════════════════
function LiveShiftTab() {
  const { dailySales, tapLines, reservations, staff } = useData();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hour = now.getHours();
  const shiftLabel = getShiftLabel(hour);
  const todayReservations = reservations.filter(r => r.status !== 'cancelled' && r.status !== 'no-show');
  const shiftStatus = getShiftStatus(todayReservations.length);

  const todaySales = dailySales[dailySales.length - 1];
  const last7 = dailySales.slice(-7);

  const hoursOpen = Math.max(1, hour - 11);
  const revPerHour = todaySales ? todaySales.totalRevenue / hoursOpen : 0;

  const sortedTaps = useMemo(() =>
    [...tapLines].filter(t => t.status === 'active').sort((a, b) => a.kegLevel - b.kegLevel),
  []);

  const todayDay = DAY_NAMES[now.getDay()];
  const onShiftStaff = useMemo(() =>
    staff.filter(s => s.status === 'active' && (s.schedule || []).some(sh => sh.day === todayDay.slice(0, 3))),
  [todayDay]);

  const topSeller = onShiftStaff.length > 0 ? onShiftStaff.reduce((best, s) => s.salesThisWeek > (best?.salesThisWeek ?? 0) ? s : best, onShiftStaff[0]) : null;

  // Floor plan sections
  const sections = [
    { name: 'Taproom', tables: 14, cols: 4, rows: 4 },
    { name: 'Patio', tables: 6, cols: 3, rows: 2 },
    { name: 'Beer Garden', tables: 8, cols: 4, rows: 2 },
    { name: 'Private Room', tables: 2, cols: 2, rows: 1 },
  ];

  const sectionMap: Record<string, string> = { taproom: 'Taproom', patio: 'Patio', 'beer-garden': 'Beer Garden', 'private-room': 'Private Room' };
  const sectionReservations = useMemo(() => {
    const map: Record<string, typeof reservations> = {};
    todayReservations.forEach(r => {
      const sec = sectionMap[r.section] || r.section;
      if (!map[sec]) map[sec] = [];
      map[sec].push(r);
    });
    return map;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Strip */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-brewery-200 font-mono text-sm">{format(now, 'EEEE, MMMM d yyyy')}</span>
          <span className="text-amber-400 font-mono text-sm font-bold">{format(now, 'h:mm:ss a')}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className={clsx('w-2.5 h-2.5 rounded-full animate-pulse', shiftStatus.color)} />
          <span className="text-brewery-200 text-sm font-medium">{shiftLabel}</span>
          <span className="text-brewery-500 text-xs">({shiftStatus.label})</span>
        </div>
      </div>

      {/* Revenue Ticker + Sparkline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <p className="text-[11px] font-medium text-brewery-400 uppercase tracking-wider mb-1">Today's Revenue</p>
          <p className="text-3xl font-bold text-amber-400" style={{ fontFamily: 'var(--font-display)' }}>{todaySales ? fmt(todaySales.totalRevenue) : '$0'}</p>
          <div className="mt-2 h-[50px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7.map(d => ({ day: d.date.slice(-2), rev: d.totalRevenue }))}>
                <Line type="monotone" dataKey="rev" stroke="#d97706" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <p className="text-[11px] font-medium text-brewery-400 uppercase tracking-wider mb-1">Revenue per Hour</p>
          <p className="text-3xl font-bold text-brewery-100" style={{ fontFamily: 'var(--font-display)' }}>{fmt(revPerHour)}</p>
          <p className="text-xs text-brewery-500 mt-1">{hoursOpen} hours since open (11 AM)</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <p className="text-[11px] font-medium text-brewery-400 uppercase tracking-wider mb-1">Guests Today</p>
          <p className="text-3xl font-bold text-brewery-100" style={{ fontFamily: 'var(--font-display)' }}>{todaySales?.customerCount ?? 0}</p>
          <p className="text-xs text-brewery-500 mt-1">Avg ticket: {todaySales ? fmt(todaySales.avgTicket) : '$0'}</p>
        </div>
      </div>

      {/* Active Taps Strip */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brewery-200 mb-3">Active Taps — sorted by keg level</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedTaps.map(tap => {
            const levelColor = tap.kegLevel < 25 ? 'bg-red-500' : tap.kegLevel < 50 ? 'bg-amber-500' : 'bg-emerald-500';
            return (
              <div key={tap.tapNumber} className="flex-shrink-0 w-[72px] bg-brewery-800/60 border border-brewery-700/30 rounded-lg p-2 text-center group relative" title={`${tap.beerName} — ${tap.kegLevel}% — ${tap.abv}% ABV — ${tap.totalPours} pours`}>
                <div className="text-[10px] text-brewery-500 font-bold">#{tap.tapNumber}</div>
                <div className="mx-auto w-3 h-12 bg-brewery-700/40 rounded-full mt-1 mb-1 relative overflow-hidden">
                  <div className={clsx('absolute bottom-0 w-full rounded-full transition-all', levelColor)} style={{ height: `${tap.kegLevel}%` }} />
                </div>
                <div className="text-[9px] text-brewery-300 truncate">{tap.beerName?.split(' ').slice(0, 2).join(' ')}</div>
                <div className="text-[9px] text-brewery-500">{tap.abv}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floor Heatmap + Staff On Shift */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Floor Map</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {sections.map(sec => {
              const secRes = sectionReservations[sec.name] || [];
              const seated = secRes.filter(r => r.status === 'seated').length;
              const confirmed = secRes.filter(r => r.status === 'confirmed').length;
              return (
                <div key={sec.name}>
                  <p className="text-[10px] font-bold text-brewery-400 uppercase tracking-wider mb-2">{sec.name}</p>
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${sec.cols}, 1fr)` }}>
                    {Array.from({ length: sec.tables }).map((_, i) => {
                      let status: 'empty' | 'confirmed' | 'seated' = 'empty';
                      if (i < seated) status = 'seated';
                      else if (i < seated + confirmed) status = 'confirmed';
                      return (
                        <div key={i} className={clsx(
                          'w-7 h-7 rounded-md border transition-colors',
                          status === 'empty' && 'bg-brewery-800 border-brewery-700/40',
                          status === 'seated' && 'bg-emerald-600/40 border-emerald-500/50',
                          status === 'confirmed' && 'bg-amber-600/30 border-amber-500/40 animate-pulse',
                        )} />
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-brewery-500 mt-1.5">{seated + confirmed} / {sec.tables} occupied</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-[10px] text-brewery-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-brewery-800 border border-brewery-700/40" /> Empty</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-600/30 border border-amber-500/40" /> Confirmed</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-600/40 border border-emerald-500/50" /> Seated</span>
          </div>
        </div>

        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-3">Staff On Shift</h3>
          <div className="space-y-2">
            {onShiftStaff.map(s => {
              const isTop = s.id === topSeller?.id && s.salesThisWeek > 0;
              return (
                <div key={s.id} className={clsx('flex items-center gap-3 p-2 rounded-lg', isTop ? 'bg-amber-900/20 border border-amber-700/30' : 'bg-brewery-800/30')}>
                  <div className="w-8 h-8 rounded-full bg-brewery-700 flex items-center justify-center text-xs font-bold text-brewery-300">
                    {s.firstName[0]}{s.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-brewery-200 font-medium truncate">{s.firstName} {s.lastName}</span>
                      {isTop && <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-brewery-500">
                      <span className="capitalize">{s.role}</span>
                      {s.salesThisWeek > 0 && <span className="text-amber-400">{fmt(s.salesThisWeek)}/wk</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 2: POUR ANALYTICS
// ═══════════════════════════════════════════════
function PourTab() {
  const { tapLines, beers } = useData();
  const activeTaps = useMemo(() => tapLines.filter(t => t.status === 'active'), [tapLines]);

  const pourData = useMemo(() => {
    return activeTaps.map(tap => {
      const beer = beers.find(b => b.id === tap.beerId);
      const poursPerDay = tap.totalPours / 30;
      const pintPrice = (tap.pourSizes || []).find(p => p.name === 'Pint')?.price ?? 7;
      const dailyRev = poursPerDay * pintPrice;
      const gallonsPerKeg = tap.kegSize === '1/2' ? 15.5 : tap.kegSize === '1/4' ? 7.75 : 5.17;
      const pintsPerKeg = gallonsPerKeg * 10.67;
      const poursRemaining = Math.round((tap.kegLevel / 100) * pintsPerKeg);
      const daysToKick = poursPerDay > 0 ? poursRemaining / poursPerDay : 999;
      let kickBadge: { label: string; color: string };
      if (daysToKick < 1) kickBadge = { label: 'Kick Today', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      else if (daysToKick < 3) kickBadge = { label: '1-2 Days', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      else kickBadge = { label: '3+ Days', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };

      return {
        tapNumber: tap.tapNumber,
        beerName: tap.beerName || 'Unknown',
        style: beer?.style || '',
        category: beer?.category || 'flagship',
        poursPerDay: Math.round(poursPerDay * 10) / 10,
        dailyRev: Math.round(dailyRev),
        kegLevel: tap.kegLevel,
        poursRemaining,
        daysToKick: Math.round(daysToKick * 10) / 10,
        kickBadge,
        totalPours: tap.totalPours,
        isNA: beer?.isNonAlcoholic,
      };
    }).sort((a, b) => a.daysToKick - b.daysToKick);
  }, [activeTaps]);

  const velocityData = [...pourData].sort((a, b) => b.poursPerDay - a.poursPerDay);

  // Style popularity radar
  const styleMap = useMemo(() => {
    const map: Record<string, number> = {};
    activeTaps.forEach(t => {
      const beer = beers.find(b => b.id === t.beerId);
      if (beer) {
        const style = beer.style.split(' ').slice(0, 2).join(' ');
        map[style] = (map[style] || 0) + t.totalPours;
      }
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([style, pours]) => ({ style, value: Math.round((pours / max) * 100) }));
  }, [activeTaps]);

  // Revenue by tap - low revenue taps
  const revenueByTap = [...pourData].sort((a, b) => b.dailyRev - a.dailyRev);

  // Category pours/revenue donut
  const categoryData = useMemo(() => {
    const map: Record<string, { pours: number; revenue: number }> = {};
    pourData.forEach(p => {
      if (!map[p.category]) map[p.category] = { pours: 0, revenue: 0 };
      map[p.category].pours += Math.round(p.poursPerDay * 30);
      map[p.category].revenue += p.dailyRev * 30;
    });
    return Object.entries(map).map(([cat, d]) => ({ name: cat, pours: d.pours, revenue: d.revenue, color: CAT_COLORS[cat] || '#9ca3af' }));
  }, [pourData]);

  return (
    <div className="space-y-6">
      {/* Pour Velocity */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brewery-200 mb-4">Pour Velocity — Pours per Day</h3>
        <ResponsiveContainer width="100%" height={Math.max(200, velocityData.length * 32)}>
          <BarChart data={velocityData} layout="vertical" margin={{ left: 120, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#5c3e1920" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="beerName" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return <div style={TOOLTIP_STYLE} className="px-3 py-2"><p className="text-brewery-200 text-xs font-bold">{d.beerName}</p><p className="text-brewery-400 text-[11px]">{d.poursPerDay} pours/day &middot; {fmt(d.dailyRev)}/day</p></div>;
            }} />
            <Bar dataKey="poursPerDay" radius={[0, 4, 4, 0]} barSize={18}>
              {velocityData.map((d, i) => <Cell key={i} fill={CAT_COLORS[d.category] || '#d97706'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two-Column: Radar + Revenue per Tap */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Style Popularity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={styleMap}>
              <PolarGrid stroke="#5c3e1930" />
              <PolarAngleAxis dataKey="style" tick={{ fill: '#8b7355', fontSize: 10 }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Radar dataKey="value" stroke="#d97706" fill="#d97706" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Daily Revenue per Tap</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByTap} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5c3e1920" />
              <XAxis dataKey="beerName" tick={{ fill: '#8b7355', fontSize: 9 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={60} interval={0} />
              <YAxis tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return <div style={TOOLTIP_STYLE} className="px-3 py-2"><p className="text-brewery-200 text-xs">{d.beerName}: {fmt(d.dailyRev)}/day</p></div>;
              }} />
              <Bar dataKey="dailyRev" radius={[4, 4, 0, 0]} barSize={20}>
                {revenueByTap.map((d, i) => <Cell key={i} fill={d.dailyRev < 50 ? '#ef4444' : '#d97706'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Keg Depletion Forecast */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-brewery-700/30">
          <h3 className="text-sm font-semibold text-brewery-200">Keg Depletion Forecast</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brewery-700/40">
                {['Tap', 'Beer', 'Keg Level', 'Pours Left', 'Days to Kick', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-brewery-400 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pourData.map((d, i) => (
                <tr key={d.tapNumber} className={clsx(i % 2 === 0 && 'bg-brewery-800/20', 'hover:bg-brewery-800/40 transition-colors')}>
                  <td className="py-2.5 px-4 text-brewery-400 font-mono text-xs">#{d.tapNumber}</td>
                  <td className="py-2.5 px-4 text-brewery-100 font-medium">{d.beerName}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-brewery-700/40 rounded-full overflow-hidden">
                        <div className={clsx('h-full rounded-full', d.kegLevel < 25 ? 'bg-red-500' : d.kegLevel < 50 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${d.kegLevel}%` }} />
                      </div>
                      <span className="text-brewery-400 text-xs font-mono">{d.kegLevel}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-brewery-300 font-mono">{d.poursRemaining}</td>
                  <td className="py-2.5 px-4 text-brewery-300 font-mono">{d.daysToKick < 999 ? d.daysToKick : 'N/A'}</td>
                  <td className="py-2.5 px-4">
                    <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border', d.kickBadge.color)}>{d.kickBadge.label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Revenue Donut */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brewery-200 mb-4">Revenue by Category</h3>
        <div className="flex items-center gap-8 justify-center">
          <div className="w-[180px] h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="revenue" stroke="none">
                  {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  return <div style={TOOLTIP_STYLE} className="px-3 py-2"><span className="text-brewery-200 text-xs capitalize">{d.name}: {fmt(d.revenue)} &middot; {d.pours.toLocaleString()} pours</span></div>;
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-brewery-400 capitalize w-24">{c.name}</span>
                <span className="text-brewery-200 font-mono">{fmt(c.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 3: GUEST INSIGHTS
// ═══════════════════════════════════════════════
function GuestTab() {
  const { customers } = useData();
  // Visit frequency distribution
  const visitBuckets = useMemo(() => {
    const buckets = [
      { label: '1-5', min: 1, max: 5, count: 0 },
      { label: '6-10', min: 6, max: 10, count: 0 },
      { label: '11-20', min: 11, max: 20, count: 0 },
      { label: '21-50', min: 21, max: 50, count: 0 },
      { label: '50+', min: 51, max: 999, count: 0 },
    ];
    customers.forEach(c => {
      const b = buckets.find(b => c.totalVisits >= b.min && c.totalVisits <= b.max);
      if (b) b.count++;
    });
    return buckets;
  }, []);

  // Loyalty tier funnel
  const tierData = useMemo(() => {
    const tiers: Record<string, { count: number; totalSpent: number }> = { Bronze: { count: 0, totalSpent: 0 }, Silver: { count: 0, totalSpent: 0 }, Gold: { count: 0, totalSpent: 0 }, Platinum: { count: 0, totalSpent: 0 } };
    customers.forEach(c => {
      if (tiers[c.loyaltyTier]) {
        tiers[c.loyaltyTier].count++;
        tiers[c.loyaltyTier].totalSpent += c.totalSpent;
      }
    });
    return Object.entries(tiers).map(([tier, d]) => ({
      tier, count: d.count, avgSpend: d.count > 0 ? d.totalSpent / d.count : 0, color: TIER_COLORS[tier],
    }));
  }, []);
  const maxTierCount = tierData.length > 0 ? Math.max(...tierData.map(t => t.count), 1) : 1;

  // Top 10 by spend
  const topGuests = useMemo(() =>
    [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10),
  []);

  // Source distribution
  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    customers.forEach(c => { map[c.source] = (map[c.source] || 0) + 1; });
    return Object.entries(map).map(([source, count]) => ({ name: source, value: count, color: SOURCE_COLORS[source] || '#9ca3af' }));
  }, []);

  // Spending heatmap
  const spendingGrid = useMemo(() => {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const brackets = ['$0-40', '$40-60', '$60-80', '$80+'];
    const grid: number[][] = tiers.map(() => [0, 0, 0, 0]);
    customers.forEach(c => {
      const ti = tiers.indexOf(c.loyaltyTier);
      if (ti === -1) return;
      const ticket = c.avgTicket;
      const bi = ticket < 40 ? 0 : ticket < 60 ? 1 : ticket < 80 ? 2 : 3;
      grid[ti][bi]++;
    });
    return { tiers, brackets, grid };
  }, []);
  const maxCell = Math.max(...spendingGrid.grid.flat(), 1);

  return (
    <div className="space-y-6">
      {/* Two-column: Visit Frequency + Loyalty Funnel */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Visit Frequency Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={visitBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5c3e1920" />
              <XAxis dataKey="label" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                return <div style={TOOLTIP_STYLE} className="px-3 py-2"><span className="text-brewery-200 text-xs">{payload[0].payload.label} visits: {payload[0].value} customers</span></div>;
              }} />
              <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Loyalty Tier Funnel</h3>
          <div className="space-y-3">
            {tierData.map(t => (
              <div key={t.tier}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: t.color }}>{t.tier}</span>
                  <span className="text-brewery-400">{t.count} members &middot; avg {fmt(t.avgSpend)}</span>
                </div>
                <div className="w-full bg-brewery-800 rounded-full h-5 overflow-hidden">
                  <div className="h-full rounded-full transition-all flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${Math.max(15, (t.count / maxTierCount) * 100)}%`, backgroundColor: t.color }}>
                    {t.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 Guests */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-brewery-700/30">
          <h3 className="text-sm font-semibold text-brewery-200">Top Guests by Spend</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brewery-700/40">
                {['#', 'Guest', 'Tier', 'Visits', 'Total Spent', 'Avg Ticket', 'Favorite Beer', 'Mug Club'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-brewery-400 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topGuests.map((c, i) => (
                <tr key={c.id} className={clsx(i % 2 === 0 && 'bg-brewery-800/20', c.loyaltyTier === 'Platinum' && 'border-l-2 border-l-purple-400', 'hover:bg-brewery-800/40 transition-colors')}>
                  <td className="py-2.5 px-4 text-brewery-500 font-mono text-xs">{i + 1}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brewery-700 flex items-center justify-center text-[10px] font-bold text-brewery-300">{c.firstName[0]}{c.lastName[0]}</div>
                      <span className="text-brewery-100 font-medium">{c.firstName} {c.lastName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: TIER_COLORS[c.loyaltyTier], borderColor: TIER_COLORS[c.loyaltyTier] + '40' }}>{c.loyaltyTier}</span></td>
                  <td className="py-2.5 px-4 text-brewery-300 font-mono">{c.totalVisits}</td>
                  <td className="py-2.5 px-4 text-amber-400 font-mono font-medium">{fmt(c.totalSpent)}</td>
                  <td className="py-2.5 px-4 text-brewery-300 font-mono">{fmt(c.avgTicket)}</td>
                  <td className="py-2.5 px-4 text-brewery-400 text-xs">{c.favoriteBeers[0] || '—'}</td>
                  <td className="py-2.5 px-4">{c.mugClubMember && <Crown className="w-4 h-4 text-amber-400" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-column: Source Donut + Spending Heatmap */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Acquisition Sources</h3>
          <div className="flex items-center gap-4">
            <div className="w-[160px] h-[160px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                    {sourceData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const d = payload[0].payload;
                    return <div style={TOOLTIP_STYLE} className="px-3 py-2"><span className="text-brewery-200 text-xs">{d.name}: {d.value}</span></div>;
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 flex-1">
              {sourceData.map(s => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-brewery-400 truncate">{s.name}</span>
                  <span className="text-brewery-200 ml-auto font-mono">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Spending Heatmap</h3>
          <div className="overflow-x-auto">
            <table className="text-xs">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-brewery-500" />
                  {spendingGrid.brackets.map(b => (
                    <th key={b} className="px-3 py-2 text-brewery-400 font-medium">{b}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {spendingGrid.tiers.map((tier, ti) => (
                  <tr key={tier}>
                    <td className="px-3 py-2 font-medium" style={{ color: TIER_COLORS[tier] }}>{tier}</td>
                    {spendingGrid.grid[ti].map((count, bi) => {
                      const intensity = maxCell > 0 ? count / maxCell : 0;
                      return (
                        <td key={bi} className="px-3 py-2">
                          <div className="w-10 h-8 rounded flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `rgba(217, 119, 6, ${intensity * 0.6 + 0.05})`, color: intensity > 0.3 ? '#fff' : '#8b7355' }}>
                            {count || ''}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 4: TREND ANALYSIS
// ═══════════════════════════════════════════════
function TrendTab() {
  const { dailySales } = useData();
  // Revenue trend with 7-day SMA
  const revenueWithSMA = useMemo(() => {
    return dailySales.map((d, i) => {
      const window = dailySales.slice(Math.max(0, i - 6), i + 1);
      const sma = window.reduce((s, w) => s + w.totalRevenue, 0) / window.length;
      return { date: d.date.slice(5), revenue: d.totalRevenue, sma: Math.round(sma), label: d.date };
    });
  }, []);

  // Day-of-week pattern
  const dowPattern = useMemo(() => {
    const days: Record<string, { beer: number; food: number; na: number; events: number; count: number }> = {};
    DAY_NAMES.forEach(d => { days[d] = { beer: 0, food: 0, na: 0, events: 0, count: 0 }; });
    dailySales.forEach(d => {
      const dow = DAY_NAMES[new Date(d.date).getDay()];
      days[dow].beer += d.beerRevenue;
      days[dow].food += d.foodRevenue;
      days[dow].na += d.naRevenue;
      days[dow].events += d.eventRevenue;
      days[dow].count++;
    });
    return DAY_NAMES.map(name => ({
      day: name,
      beer: Math.round(days[name].beer / Math.max(1, days[name].count)),
      food: Math.round(days[name].food / Math.max(1, days[name].count)),
      na: Math.round(days[name].na / Math.max(1, days[name].count)),
      events: Math.round(days[name].events / Math.max(1, days[name].count)),
    }));
  }, []);

  // Guest count vs revenue scatter
  const scatterData = useMemo(() => {
    return dailySales.map(d => {
      const dow = new Date(d.date).getDay();
      const isWeekend = dow === 0 || dow === 5 || dow === 6;
      return { x: d.customerCount, y: d.totalRevenue, z: d.avgTicket, color: isWeekend ? (dow === 5 ? '#d97706' : '#10b981') : '#60a5fa', label: d.date };
    });
  }, []);

  // Revenue composition trend (normalized to 100%)
  const compositionData = useMemo(() => {
    return dailySales.map(d => {
      const total = d.totalRevenue || 1;
      return {
        date: d.date.slice(5),
        Beer: Math.round((d.beerRevenue / total) * 100),
        Food: Math.round((d.foodRevenue / total) * 100),
        NA: Math.round((d.naRevenue / total) * 100),
        Events: Math.round((d.eventRevenue / total) * 100),
        Merch: Math.round((d.merchandiseRevenue / total) * 100),
      };
    });
  }, []);

  // Best/Worst days
  const defaultDay = { date: '', totalRevenue: 0, customerCount: 0, avgTicket: 0, beerRevenue: 0, foodRevenue: 0, naRevenue: 0, merchandiseRevenue: 0, eventRevenue: 0 };
  const bestDay = useMemo(() => dailySales.length > 0 ? dailySales.reduce((best, d) => d.totalRevenue > best.totalRevenue ? d : best, dailySales[0]) : defaultDay, []);
  const worstDay = useMemo(() => dailySales.length > 0 ? dailySales.reduce((worst, d) => d.totalRevenue < worst.totalRevenue ? d : worst, dailySales[0]) : defaultDay, []);

  return (
    <div className="space-y-6">
      {/* Best/Worst Day Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-brewery-900/80 border border-emerald-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Best Revenue Day</p>
          </div>
          <p className="text-2xl font-bold text-brewery-100">{fmt(bestDay.totalRevenue)}</p>
          <p className="text-xs text-brewery-400 mt-0.5">{bestDay.date} &middot; {bestDay.customerCount} guests &middot; {fmt(bestDay.avgTicket)} avg ticket</p>
        </div>
        <div className="bg-brewery-900/80 border border-red-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Slowest Revenue Day</p>
          </div>
          <p className="text-2xl font-bold text-brewery-100">{fmt(worstDay.totalRevenue)}</p>
          <p className="text-xs text-brewery-400 mt-0.5">{worstDay.date} &middot; {worstDay.customerCount} guests &middot; {fmt(worstDay.avgTicket)} avg ticket</p>
        </div>
      </div>

      {/* Revenue Trend with SMA */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brewery-200 mb-4">Revenue Trend — 30 Days with 7-Day Moving Average</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenueWithSMA}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#5c3e1920" />
            <XAxis dataKey="date" tick={{ fill: '#8b7355', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div style={TOOLTIP_STYLE} className="px-3 py-2">
                  <p className="text-brewery-300 text-xs mb-1">{payload[0]?.payload.label}</p>
                  <p className="text-amber-400 text-xs">Revenue: {fmt(payload[0]?.value as number)}</p>
                  {payload[1] && <p className="text-emerald-400 text-xs">7-Day Avg: {fmt(payload[1].value as number)}</p>}
                </div>
              );
            }} />
            <Area type="monotone" dataKey="revenue" stroke="#d97706" fill="url(#revGrad)" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="sma" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 3" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-2 justify-center">
          <span className="flex items-center gap-1.5 text-[11px] text-brewery-400"><span className="w-3 h-0.5 bg-amber-600 inline-block rounded" /> Daily Revenue</span>
          <span className="flex items-center gap-1.5 text-[11px] text-brewery-400"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> 7-Day SMA</span>
        </div>
      </div>

      {/* Two-Column: Day-of-Week + Scatter */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Revenue by Day of Week (Avg)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dowPattern}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5c3e1920" />
              <XAxis dataKey="day" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const total = payload.reduce((s, p) => s + (p.value as number), 0);
                return (
                  <div style={TOOLTIP_STYLE} className="px-3 py-2">
                    <p className="text-brewery-300 text-xs font-medium mb-1">{label}</p>
                    {payload.map((p, i) => <p key={i} className="text-brewery-400 text-[11px]"><span style={{ color: p.color as string }}>{p.name}</span>: {fmt(p.value as number)}</p>)}
                    <p className="text-brewery-200 text-xs mt-1 font-medium">Total: {fmt(total)}</p>
                  </div>
                );
              }} />
              <Bar dataKey="beer" stackId="a" fill="#d97706" name="Beer" />
              <Bar dataKey="food" stackId="a" fill="#10b981" name="Food" />
              <Bar dataKey="na" stackId="a" fill="#60a5fa" name="NA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brewery-200 mb-4">Guest Count vs Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ bottom: 10, left: 5, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5c3e1920" />
              <XAxis type="number" dataKey="x" name="Guests" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Guests', position: 'bottom', fill: '#8b7355', fontSize: 10, offset: -5 }} />
              <YAxis type="number" dataKey="y" name="Revenue" tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <ZAxis type="number" dataKey="z" range={[60, 300]} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div style={TOOLTIP_STYLE} className="px-3 py-2">
                    <p className="text-brewery-300 text-xs mb-1">{d?.label}</p>
                    <p className="text-brewery-400 text-[11px]">Guests: {d?.x} &middot; Revenue: {fmt(d?.y)}</p>
                    <p className="text-brewery-400 text-[11px]">Avg Ticket: ${d?.z?.toFixed(2)}</p>
                  </div>
                );
              }} />
              <Scatter data={scatterData} fillOpacity={0.7}>
                {scatterData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 justify-center mt-2 text-[10px] text-brewery-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Weekday</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600" /> Friday</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Weekend</span>
          </div>
        </div>
      </div>

      {/* Revenue Composition Trend */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brewery-200 mb-4">Revenue Composition Trend (% Split)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={compositionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#5c3e1920" />
            <XAxis dataKey="date" tick={{ fill: '#8b7355', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fill: '#8b7355', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div style={TOOLTIP_STYLE} className="px-3 py-2">
                  <p className="text-brewery-300 text-xs mb-1">{label}</p>
                  {payload.map((p, i) => <p key={i} className="text-[11px]" style={{ color: p.color as string }}>{p.name}: {p.value}%</p>)}
                </div>
              );
            }} />
            <Area type="monotone" dataKey="Beer" stackId="1" stroke="#d97706" fill="#d97706" fillOpacity={0.6} />
            <Area type="monotone" dataKey="Food" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            <Area type="monotone" dataKey="NA" stackId="1" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.6} />
            <Area type="monotone" dataKey="Events" stackId="1" stroke="#fb7185" fill="#fb7185" fillOpacity={0.6} />
            <Area type="monotone" dataKey="Merch" stackId="1" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 justify-center flex-wrap">
          {[['Beer', '#d97706'], ['Food', '#10b981'], ['NA', '#60a5fa'], ['Events', '#fb7185'], ['Merch', '#9ca3af']].map(([name, color]) => (
            <span key={name} className="flex items-center gap-1.5 text-[11px] text-brewery-400"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: color }} />{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════
export default function TaproomAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('live');

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-brewery-700/30">
        {tabList.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
                isActive ? 'border-amber-500 text-amber-400' : 'border-transparent text-brewery-400 hover:text-brewery-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'live' && <LiveShiftTab />}
      {activeTab === 'pour' && <PourTab />}
      {activeTab === 'guests' && <GuestTab />}
      {activeTab === 'trends' && <TrendTab />}
    </div>
  );
}
