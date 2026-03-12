import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Droplets, Beer, Activity, ArrowUpDown, Filter, RefreshCw, Clock, TrendingDown } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { clsx } from 'clsx';
import type { TapLine } from '../../types';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const PINT_OZ = 16;
const HALF_KEG_GAL = 15.5;
const HALF_KEG_OZ = HALF_KEG_GAL * 128;
const PINTS_PER_HALF_KEG = Math.round(HALF_KEG_OZ / PINT_OZ); // ~124 pints

// Mock pour history data per tap (pints per day over last 7 days)
const MOCK_POUR_HISTORY: Record<number, number[]> = {
  1: [28, 34, 22, 41, 38, 52, 48],
  2: [18, 22, 15, 28, 24, 36, 32],
  3: [12, 16, 10, 20, 18, 28, 24],
  4: [35, 40, 30, 48, 44, 60, 55],
  5: [8, 12, 6, 15, 12, 20, 18],
  6: [10, 14, 9, 18, 16, 22, 20],
  7: [22, 28, 18, 34, 30, 42, 38],
  8: [5, 8, 4, 10, 8, 14, 12],
  9: [15, 18, 12, 22, 20, 30, 26],
  10: [20, 24, 16, 30, 26, 38, 34],
  11: [30, 36, 25, 44, 40, 55, 50],
  12: [14, 18, 12, 22, 18, 28, 25],
  13: [10, 12, 8, 16, 14, 20, 18],
};

function getAvgDailyPours(tapNumber: number): number {
  const history = MOCK_POUR_HISTORY[tapNumber] || [15, 18, 12, 20, 16, 24, 22];
  return Math.round(history.reduce((a, b) => a + b, 0) / history.length);
}

function getDaysRemaining(kegLevel: number, avgDailyPours: number): number | null {
  if (avgDailyPours === 0) return null;
  const pintsRemaining = Math.round((kegLevel / 100) * PINTS_PER_HALF_KEG);
  return Math.ceil(pintsRemaining / avgDailyPours);
}

function getUrgency(kegLevel: number): 'critical' | 'low' | 'medium' | 'good' {
  if (kegLevel < 15) return 'critical';
  if (kegLevel < 30) return 'low';
  if (kegLevel < 60) return 'medium';
  return 'good';
}

// ─── SPARKLINE ───────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 60, H = 24, pts = data.length;
  const coords = data.map((v, i) => ({
    x: (i / (pts - 1)) * W,
    y: H - ((v - min) / range) * H,
  }));
  const path = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} className="opacity-60">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2" fill={color} />
    </svg>
  );
}

// ─── ANIMATED FILL GAUGE ─────────────────────────────────────────────────────

function KegFillGauge({ level, urgency, animationDelay = 0 }: { level: number; urgency: ReturnType<typeof getUrgency>; animationDelay?: number }) {
  const [displayLevel, setDisplayLevel] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / 800, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setDisplayLevel(Math.round(ease * level));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, animationDelay);
    return () => clearTimeout(timer);
  }, [level, animationDelay]);

  const fillColor = urgency === 'critical' ? '#ef4444'
    : urgency === 'low' ? '#f59e0b'
    : urgency === 'medium' ? '#d97706'
    : '#10b981';

  const glowColor = urgency === 'critical' ? 'rgba(239,68,68,0.3)'
    : urgency === 'low' ? 'rgba(245,158,11,0.25)'
    : urgency === 'medium' ? 'rgba(217,119,6,0.2)'
    : 'rgba(16,185,129,0.2)';

  return (
    <div className="relative w-14 mx-auto">
      {/* Keg body shape */}
      <div className="relative w-14 h-20 rounded-lg overflow-hidden border-2 border-brewery-600/40 bg-brewery-800/80">
        {/* Fill animation */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-none rounded-b"
          style={{
            height: `${displayLevel}%`,
            background: `linear-gradient(180deg, ${fillColor}cc 0%, ${fillColor}66 100%)`,
            boxShadow: `0 -4px 12px ${glowColor}`,
          }}
        />
        {/* Bubbles effect for non-empty kegs */}
        {displayLevel > 10 && (
          <>
            <div className="absolute bottom-2 left-3 w-1 h-1 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }} />
            <div className="absolute bottom-4 right-4 w-0.5 h-0.5 rounded-full bg-white/15 animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '2.5s' }} />
            <div className="absolute bottom-3 left-6 w-0.5 h-0.5 rounded-full bg-white/15 animate-bounce" style={{ animationDelay: '1.3s', animationDuration: '1.8s' }} />
          </>
        )}
        {/* Level markers */}
        {[25, 50, 75].map(mark => (
          <div key={mark} className="absolute left-0 right-0 border-t border-brewery-600/20" style={{ bottom: `${mark}%` }}>
            <span className="absolute right-1 -top-2 text-[7px] text-brewery-600/60">{mark}</span>
          </div>
        ))}
        {/* Level text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-md">{displayLevel}%</span>
        </div>
      </div>
      {/* Keg top cap */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-brewery-700/80 rounded-t border border-brewery-600/40" />
      {/* Keg tap nozzle */}
      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-brewery-700/60 rounded border border-brewery-600/30" />
    </div>
  );
}

// ─── KEG CARD ────────────────────────────────────────────────────────────────

function KegCard({ tap, idx }: { tap: TapLine; idx: number }) {
  const urgency = getUrgency(tap.kegLevel);
  const avgPours = getAvgDailyPours(tap.tapNumber);
  const daysLeft = getDaysRemaining(tap.kegLevel, avgPours);
  const pintsLeft = Math.round((tap.kegLevel / 100) * PINTS_PER_HALF_KEG);
  const history = MOCK_POUR_HISTORY[tap.tapNumber] || [15, 18, 12, 20, 16, 24, 22];

  const borderColor = urgency === 'critical' ? 'border-red-500/40 shadow-red-500/10'
    : urgency === 'low' ? 'border-amber-500/30 shadow-amber-500/10'
    : urgency === 'medium' ? 'border-amber-600/20'
    : 'border-emerald-500/20';

  const badgeBg = urgency === 'critical' ? 'bg-red-500/15 text-red-300 border-red-500/30'
    : urgency === 'low' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    : urgency === 'medium' ? 'bg-amber-600/10 text-amber-400 border-amber-600/20'
    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  const sparkColor = urgency === 'critical' ? '#ef4444'
    : urgency === 'low' ? '#f59e0b'
    : urgency === 'medium' ? '#d97706'
    : '#10b981';

  return (
    <div className={clsx(
      'bg-brewery-900/80 border rounded-xl p-4 shadow-lg transition-all hover:shadow-xl hover:scale-[1.01] duration-200 group cursor-default',
      borderColor
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold text-brewery-500 uppercase tracking-wider">TAP {tap.tapNumber}</span>
            {urgency === 'critical' && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 animate-pulse">
                <AlertTriangle className="w-3 h-3" /> SWAP NOW
              </span>
            )}
            {urgency === 'low' && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                <AlertTriangle className="w-3 h-3" /> Order Soon
              </span>
            )}
            {urgency === 'good' && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                <CheckCircle className="w-3 h-3" /> Full
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-brewery-100 truncate leading-tight">{tap.beerName}</h3>
          <p className="text-[11px] text-brewery-400 truncate">{tap.style}</p>
        </div>
        <span className={clsx('ml-2 flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border', badgeBg)}>
          {tap.abv}% ABV
        </span>
      </div>

      {/* Keg gauge + stats row */}
      <div className="flex items-end gap-3 mb-3">
        <KegFillGauge level={tap.kegLevel} urgency={urgency} animationDelay={idx * 80} />

        <div className="flex-1 space-y-1.5">
          {/* Pints remaining */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-brewery-500 flex items-center gap-1"><Droplets className="w-3 h-3" />Pints left</span>
            <span className="text-xs font-bold text-brewery-200">{pintsLeft}</span>
          </div>
          {/* Daily velocity */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-brewery-500 flex items-center gap-1"><Activity className="w-3 h-3" />Daily avg</span>
            <span className="text-xs font-semibold text-brewery-300">{avgPours} pints</span>
          </div>
          {/* Days remaining */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-brewery-500 flex items-center gap-1"><Clock className="w-3 h-3" />Days left</span>
            <span className={clsx('text-xs font-bold',
              daysLeft === null ? 'text-brewery-500' :
              daysLeft <= 2 ? 'text-red-400' :
              daysLeft <= 5 ? 'text-amber-400' : 'text-emerald-400'
            )}>
              {daysLeft === null ? '—' : `~${daysLeft}d`}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1.5 rounded-full bg-brewery-800 overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-1000',
              urgency === 'critical' ? 'bg-red-500' :
              urgency === 'low' ? 'bg-amber-500' :
              urgency === 'medium' ? 'bg-amber-400' : 'bg-emerald-500'
            )}
            style={{ width: `${tap.kegLevel}%`, transitionDelay: `${idx * 80}ms` }}
          />
        </div>
      </div>

      {/* Sparkline + total pours */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] text-brewery-600 mb-0.5">7-day pour trend</p>
          <Sparkline data={history} color={sparkColor} />
        </div>
        <div className="text-right">
          <p className="text-[9px] text-brewery-600 mb-0.5">All-time pours</p>
          <p className="text-sm font-bold text-brewery-300">{(tap.totalPours || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// ─── ALERT BANNER ────────────────────────────────────────────────────────────

function AlertBanner({ critical, low }: { critical: TapLine[]; low: TapLine[] }) {
  if (critical.length === 0 && low.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
        All kegs healthy — no swaps needed today
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {critical.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="text-sm font-bold text-red-300">Critical — Swap Required Now</p>
            <p className="text-xs text-red-400/80 mt-0.5">
              {critical.map(t => `Tap ${t.tapNumber} — ${t.beerName} (${t.kegLevel}%)`).join(' · ')}
            </p>
          </div>
        </div>
      )}
      {low.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <TrendingDown className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Order Soon — Kegs Below 30%</p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              {low.map(t => `Tap ${t.tapNumber} — ${t.beerName} (${t.kegLevel}%)`).join(' · ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

type SortMode = 'level-asc' | 'level-desc' | 'name' | 'tap';
type FilterMode = 'all' | 'alerts' | 'good';

export default function KegMonitorPage() {
  const { tapLines } = useData();
  const [sortMode, setSortMode] = useState<SortMode>('level-asc');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const activeTaps = useMemo(() => tapLines.filter(t => t.status === 'active'), [tapLines]);

  const critical = activeTaps.filter(t => getUrgency(t.kegLevel) === 'critical');
  const low = activeTaps.filter(t => getUrgency(t.kegLevel) === 'low');
  const avgLevel = activeTaps.length > 0
    ? Math.round(activeTaps.reduce((s, t) => s + t.kegLevel, 0) / activeTaps.length)
    : 0;
  const fullKegs = activeTaps.filter(t => t.kegLevel >= 75);

  const sorted = useMemo(() => {
    let taps = [...activeTaps];
    if (filterMode === 'alerts') taps = taps.filter(t => ['critical', 'low'].includes(getUrgency(t.kegLevel)));
    if (filterMode === 'good') taps = taps.filter(t => ['medium', 'good'].includes(getUrgency(t.kegLevel)));
    switch (sortMode) {
      case 'level-asc': return taps.sort((a, b) => a.kegLevel - b.kegLevel);
      case 'level-desc': return taps.sort((a, b) => b.kegLevel - a.kegLevel);
      case 'name': return taps.sort((a, b) => (a.beerName || '').localeCompare(b.beerName || ''));
      case 'tap': return taps.sort((a, b) => a.tapNumber - b.tapNumber);
    }
  }, [activeTaps, sortMode, filterMode]);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 800);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-brewery-100 flex items-center gap-2">
            <Beer className="w-6 h-6 text-amber-400" />
            Keg Health Monitor
          </h1>
          <p className="text-sm text-brewery-400 mt-0.5">
            {activeTaps.length} active taps · Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-brewery-800/60 border border-brewery-700/30 text-brewery-300 hover:text-brewery-100 hover:border-amber-500/30 transition-all"
        >
          <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1">Active Taps</p>
          <p className="text-3xl font-bold text-brewery-100">{activeTaps.length}</p>
          <p className="text-xs text-brewery-500 mt-1">Total tap lines running</p>
        </div>
        <div className={clsx('border rounded-xl p-4', critical.length > 0 ? 'bg-red-500/10 border-red-500/25' : 'bg-brewery-900/80 border-brewery-700/30')}>
          <p className="text-xs text-brewery-400 mb-1">Critical Alerts</p>
          <p className={clsx('text-3xl font-bold', critical.length > 0 ? 'text-red-400' : 'text-emerald-400')}>
            {critical.length > 0 ? critical.length : '0'}
          </p>
          <p className="text-xs text-brewery-500 mt-1">{critical.length > 0 ? 'Kegs below 15%' : 'No critical kegs'}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1">Avg Keg Level</p>
          <p className={clsx('text-3xl font-bold',
            avgLevel < 30 ? 'text-amber-400' : avgLevel < 60 ? 'text-amber-300' : 'text-emerald-400'
          )}>
            {avgLevel}%
          </p>
          <p className="text-xs text-brewery-500 mt-1">Across all active taps</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1">Full Kegs</p>
          <p className="text-3xl font-bold text-emerald-400">{fullKegs.length}</p>
          <p className="text-xs text-brewery-500 mt-1">Above 75% capacity</p>
        </div>
      </div>

      {/* Alert Banner */}
      <AlertBanner critical={critical} low={low} />

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {([
            { id: 'all', label: `All Taps (${activeTaps.length})` },
            { id: 'alerts', label: `⚠ Alerts (${critical.length + low.length})` },
            { id: 'good', label: `✓ Healthy (${activeTaps.length - critical.length - low.length})` },
          ] as { id: FilterMode; label: string }[]).map(f => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                filterMode === f.id
                  ? 'bg-amber-600/20 text-amber-300 border-amber-500/30'
                  : 'bg-brewery-800/60 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs text-brewery-400">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort:</span>
          {([
            { id: 'level-asc', label: 'Level ↑' },
            { id: 'level-desc', label: 'Level ↓' },
            { id: 'name', label: 'Name' },
            { id: 'tap', label: 'Tap #' },
          ] as { id: SortMode; label: string }[]).map(s => (
            <button
              key={s.id}
              onClick={() => setSortMode(s.id)}
              className={clsx(
                'px-2.5 py-1 rounded text-xs font-medium transition-all',
                sortMode === s.id
                  ? 'bg-amber-600/20 text-amber-300'
                  : 'text-brewery-500 hover:text-brewery-300'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Keg Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-600/10 flex items-center justify-center">
            <Filter className="w-6 h-6 text-amber-600/40" />
          </div>
          <p className="text-brewery-300 font-medium">No kegs match this filter</p>
          <button onClick={() => setFilterMode('all')} className="text-sm text-amber-400 hover:text-amber-300">
            Show all taps
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((tap, idx) => (
            <KegCard key={tap.tapNumber} tap={tap} idx={idx} />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 pt-2 pb-1 border-t border-brewery-800/40">
        <p className="text-xs text-brewery-600 font-medium">Level guide:</p>
        {[
          { color: 'bg-red-500', label: 'Critical < 15%' },
          { color: 'bg-amber-500', label: 'Low < 30%' },
          { color: 'bg-amber-400', label: 'Medium < 60%' },
          { color: 'bg-emerald-500', label: 'Good ≥ 60%' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={clsx('w-2 h-2 rounded-full', item.color)} />
            <span className="text-[11px] text-brewery-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
