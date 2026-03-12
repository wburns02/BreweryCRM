import { useState, useEffect, useCallback, useMemo } from 'react';
import { Thermometer, Activity, AlertTriangle, CheckCircle2, Clock, Droplets, Wind, FlaskConical, TrendingDown, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SensorReading {
  time: string;
  temp: number;
  gravity: number;
  ph: number;
  pressure: number;
}

interface FermentVessel {
  id: string;
  name: string;
  batchName: string;
  beerName: string;
  style: string;
  status: 'fermenting' | 'conditioning' | 'carbonating' | 'empty' | 'cleaning';
  // Live sensor values
  tempF: number;
  tempTarget: number;
  tempMin: number;
  tempMax: number;
  gravity: number;
  og: number;
  fg: number;
  ph: number;
  phTarget: number;
  pressurePsi: number;
  pressureMax: number;
  // Progress
  daysIn: number;
  totalDays: number;
  brewDate: string;
  // History
  history: SensorReading[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

function generateHistory(baseTemp: number, og: number, fg: number, days: number): SensorReading[] {
  const readings: SensorReading[] = [];
  const hoursTotal = days * 24;
  const gravRange = og - fg;

  for (let h = 0; h <= Math.min(hoursTotal, 120); h += 2) {
    const decay = Math.pow(h / Math.max(1, hoursTotal), 0.6);
    const gravity = Math.round((og - gravRange * decay + (Math.random() - 0.5) * 0.001) * 1000) / 1000;
    const temp = Math.round((baseTemp + (Math.random() - 0.5) * 1.2) * 10) / 10;
    const ph = Math.round((4.2 + (Math.random() - 0.5) * 0.3 + decay * 0.2) * 10) / 10;
    const hrs = hoursTotal - (hoursTotal - h);
    const label = hrs >= 24 ? `Day ${Math.floor(hrs / 24)}` : `${hrs}h`;
    readings.push({ time: label, temp, gravity: parseFloat(gravity.toFixed(3)), ph, pressure: Math.round((5 + Math.random() * 8) * 10) / 10 });
  }
  return readings;
}

const INITIAL_VESSELS: FermentVessel[] = [
  {
    id: 'fv1', name: 'FV-1 Armadillo', batchName: 'BH-2026-021', beerName: 'Hill Country Haze', style: 'Hazy IPA',
    status: 'fermenting', tempF: 68.4, tempTarget: 68, tempMin: 65, tempMax: 72,
    gravity: 1.032, og: 1.065, fg: 1.010, ph: 4.3, phTarget: 4.4, pressurePsi: 12.2, pressureMax: 15,
    daysIn: 4, totalDays: 14, brewDate: '2026-03-08',
    history: generateHistory(68, 1.065, 1.010, 4),
  },
  {
    id: 'fv2', name: 'FV-2 Longhorn', batchName: 'BH-2026-020', beerName: 'Bulverde Blonde', style: 'American Blonde',
    status: 'conditioning', tempF: 34.1, tempTarget: 34, tempMin: 32, tempMax: 36,
    gravity: 1.011, og: 1.052, fg: 1.010, ph: 4.6, phTarget: 4.5, pressurePsi: 8.5, pressureMax: 12,
    daysIn: 11, totalDays: 18, brewDate: '2026-03-01',
    history: generateHistory(34, 1.052, 1.010, 11),
  },
  {
    id: 'fv4', name: 'BBT-1 Bluebonnet', batchName: 'BH-2026-019', beerName: 'Citra Smash IPA', style: 'American IPA',
    status: 'carbonating', tempF: 32.3, tempTarget: 32, tempMin: 30, tempMax: 35,
    gravity: 1.010, og: 1.058, fg: 1.010, ph: 4.2, phTarget: 4.3, pressurePsi: 14.8, pressureMax: 16,
    daysIn: 18, totalDays: 21, brewDate: '2026-02-22',
    history: generateHistory(32, 1.058, 1.010, 18),
  },
  {
    id: 'fv6', name: 'FV-4 Pecan', batchName: 'BH-2026-022', beerName: 'Prickly Pear Sour', style: 'Fruited Sour',
    status: 'fermenting', tempF: 72.8, tempTarget: 70, tempMin: 68, tempMax: 75,
    gravity: 1.044, og: 1.058, fg: 1.008, ph: 3.7, phTarget: 3.5, pressurePsi: 10.1, pressureMax: 14,
    daysIn: 2, totalDays: 21, brewDate: '2026-03-10',
    history: generateHistory(72, 1.058, 1.008, 2),
  },
  {
    id: 'fv3', name: 'FV-3 Prickly', batchName: '', beerName: '', style: '',
    status: 'empty', tempF: 38.0, tempTarget: 38, tempMin: 35, tempMax: 42,
    gravity: 0, og: 0, fg: 0, ph: 7.0, phTarget: 7.0, pressurePsi: 0, pressureMax: 15,
    daysIn: 0, totalDays: 0, brewDate: '',
    history: [],
  },
  {
    id: 'fv5', name: 'FV-5 Mesquite', batchName: '', beerName: '', style: '',
    status: 'cleaning', tempF: 140.0, tempTarget: 140, tempMin: 130, tempMax: 150,
    gravity: 0, og: 0, fg: 0, ph: 11.2, phTarget: 11.0, pressurePsi: 0, pressureMax: 15,
    daysIn: 0, totalDays: 0, brewDate: '',
    history: [],
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function tempAlert(v: FermentVessel): 'ok' | 'warn' | 'critical' {
  if (v.status === 'empty' || v.status === 'cleaning') return 'ok';
  const diff = Math.abs(v.tempF - v.tempTarget);
  if (diff > 3) return 'critical';
  if (diff > 1.5) return 'warn';
  return 'ok';
}

function gravityPct(v: FermentVessel): number {
  if (!v.og || !v.fg || v.og === v.fg) return 100;
  return Math.min(100, Math.max(0, Math.round(((v.og - v.gravity) / (v.og - v.fg)) * 100)));
}

function abvEst(v: FermentVessel): string {
  if (!v.og) return '—';
  const abv = (v.og - v.gravity) * 131.25;
  return abv.toFixed(1) + '%';
}

function statusColor(status: FermentVessel['status']): { bg: string; text: string; dot: string } {
  switch (status) {
    case 'fermenting': return { bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400 animate-pulse' };
    case 'conditioning': return { bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-400' };
    case 'carbonating': return { bg: 'bg-purple-500/15 border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-400' };
    case 'empty': return { bg: 'bg-brewery-700/20 border-brewery-700/30', text: 'text-brewery-500', dot: 'bg-brewery-600' };
    case 'cleaning': return { bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' };
  }
}

// ─── Temperature Gauge (SVG arc) ─────────────────────────────────────────────

function TempGauge({ temp, target, min, max, alert }: { temp: number; target: number; min: number; max: number; alert: 'ok' | 'warn' | 'critical' }) {
  const cx = 60, cy = 60, r = 48;
  const startAngle = 210;
  const totalArc = 300;

  function polar(angle: number, radius = r) {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(start: number, end: number) {
    const s = polar(start), e = polar(end);
    const large = (end - start) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const range = max - min;
  const pct = Math.max(0, Math.min(1, (temp - min) / range));
  const needleAngle = startAngle + pct * totalArc;

  const fillEnd = startAngle + pct * totalArc;
  const targetPct = Math.max(0, Math.min(1, (target - min) / range));
  const targetAngle = startAngle + targetPct * totalArc;

  const needlePoint = polar(needleAngle, r - 8);
  const needleBase1 = polar(needleAngle - 90, 6);
  const needleBase2 = polar(needleAngle + 90, 6);

  const alertColors = {
    ok: '#10b981',
    warn: '#f59e0b',
    critical: '#ef4444',
  };
  const color = alertColors[alert];

  return (
    <svg viewBox="0 0 120 100" className="w-full max-w-[120px]">
      {/* Background arc */}
      <path d={arcPath(startAngle, startAngle + totalArc)} fill="none" stroke="#2d1f0e" strokeWidth="8" strokeLinecap="round" />
      {/* Colored fill */}
      <path d={arcPath(startAngle, fillEnd)} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeOpacity="0.9" />
      {/* Target marker */}
      <line
        x1={polar(targetAngle, r - 12).x} y1={polar(targetAngle, r - 12).y}
        x2={polar(targetAngle, r - 4).x} y2={polar(targetAngle, r - 4).y}
        stroke="#d97706" strokeWidth="2" strokeLinecap="round"
      />
      {/* Needle */}
      <polygon
        points={`${needlePoint.x},${needlePoint.y} ${needleBase1.x},${needleBase1.y} ${cx},${cy} ${needleBase2.x},${needleBase2.y}`}
        fill={color} fillOpacity="0.9"
      />
      <circle cx={cx} cy={cy} r="4" fill="#1a0f05" stroke={color} strokeWidth="1.5" />
      {/* Temp label */}
      <text x={cx} y={cy + 20} textAnchor="middle" fill={color} fontSize="11" fontWeight="bold">{temp.toFixed(1)}°F</text>
      <text x={cx} y={cy + 31} textAnchor="middle" fill="#5c3e19" fontSize="7">target {target}°F</text>
    </svg>
  );
}

// ─── Vessel Card ──────────────────────────────────────────────────────────────

function VesselCard({ vessel, onSelect, selected }: { vessel: FermentVessel; onSelect: () => void; selected: boolean }) {
  const ta = tempAlert(vessel);
  const sc = statusColor(vessel.status);
  const gPct = gravityPct(vessel);
  const progressDays = vessel.totalDays > 0 ? Math.min(100, (vessel.daysIn / vessel.totalDays) * 100) : 0;

  if (vessel.status === 'empty' || vessel.status === 'cleaning') {
    return (
      <div className={clsx('bg-brewery-900/60 border rounded-xl p-4 opacity-60', sc.bg)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-brewery-300">{vessel.name}</h3>
          <div className="flex items-center gap-1.5">
            <span className={clsx('w-2 h-2 rounded-full', sc.dot)} />
            <span className={clsx('text-[10px] font-semibold uppercase', sc.text)}>{vessel.status}</span>
          </div>
        </div>
        <p className="text-xs text-brewery-500 mt-3">
          {vessel.status === 'cleaning' ? 'CIP in progress — ready in ~2h' : 'Ready for next batch'}
        </p>
        {vessel.status === 'cleaning' && (
          <div className="mt-2 flex items-center gap-1.5">
            <Thermometer className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">{vessel.tempF}°F</span>
            <span className="text-[10px] text-brewery-500">(CIP temp)</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={clsx(
        'bg-brewery-900/80 border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-amber-500/30 group',
        selected ? 'border-amber-500/50 ring-1 ring-amber-500/20' : sc.bg,
        ta === 'critical' && 'ring-1 ring-red-500/40',
        ta === 'warn' && 'ring-1 ring-amber-500/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-brewery-100 group-hover:text-amber-200 transition-colors">{vessel.name}</h3>
          <p className="text-[10px] text-brewery-400 mt-0.5 truncate">{vessel.beerName} · {vessel.batchName}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {ta !== 'ok' && (
            <AlertTriangle className={clsx('w-3.5 h-3.5', ta === 'critical' ? 'text-red-400' : 'text-amber-400')} />
          )}
          <span className={clsx('w-2 h-2 rounded-full', sc.dot)} />
          <span className={clsx('text-[10px] font-semibold uppercase', sc.text)}>{vessel.status}</span>
        </div>
      </div>

      {/* Gauge + Stats row */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-[90px]">
          <TempGauge temp={vessel.tempF} target={vessel.tempTarget} min={vessel.tempMin} max={vessel.tempMax} alert={ta} />
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          {/* Gravity progress */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-brewery-500">Fermentation</span>
              <span className="text-[10px] font-bold text-brewery-200">{gPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-brewery-700/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-emerald-500 transition-all duration-1000"
                style={{ width: `${gPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-[9px] text-brewery-600">OG {vessel.og}</span>
              <span className="text-[9px] text-brewery-400 font-semibold">{vessel.gravity}</span>
              <span className="text-[9px] text-brewery-600">FG {vessel.fg}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="text-center">
              <p className="text-[10px] font-bold text-blue-400">{vessel.pressurePsi}</p>
              <p className="text-[9px] text-brewery-600">PSI</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-purple-400">{vessel.ph}</p>
              <p className="text-[9px] text-brewery-600">pH</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-amber-400">{abvEst(vessel)}</p>
              <p className="text-[9px] text-brewery-600">ABV est</p>
            </div>
          </div>

          {/* Days */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-brewery-500">Day {vessel.daysIn}/{vessel.totalDays}</span>
              <span className="text-[10px] text-brewery-400">{vessel.totalDays - vessel.daysIn}d left</span>
            </div>
            <div className="h-1 rounded-full bg-brewery-700/50 overflow-hidden">
              <div className="h-full rounded-full bg-brewery-500 transition-all duration-1000" style={{ width: `${progressDays}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* View detail hint */}
      <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-brewery-500">View detail</span>
        <ChevronRight className="w-3 h-3 text-brewery-500 ml-0.5" />
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = { backgroundColor: '#1a0f05', border: '1px solid rgba(92,62,25,0.3)', borderRadius: 8, fontSize: 11 };

function DetailPanel({ vessel, onClose }: { vessel: FermentVessel; onClose: () => void }) {
  const ta = tempAlert(vessel);
  const alertColors = { ok: '#10b981', warn: '#f59e0b', critical: '#ef4444' };

  return (
    <div className="bg-brewery-900/95 border border-brewery-700/30 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-brewery-50" style={{ fontFamily: 'var(--font-display)' }}>{vessel.name}</h2>
          <p className="text-sm text-amber-400 mt-0.5">{vessel.beerName}</p>
          <p className="text-xs text-brewery-400">{vessel.batchName} · {vessel.style}</p>
        </div>
        <button onClick={onClose} className="text-brewery-500 hover:text-brewery-100 p-1 rounded-lg hover:bg-brewery-800 transition-colors text-xs">✕</button>
      </div>

      {/* Live readings row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Temperature', value: `${vessel.tempF.toFixed(1)}°F`, target: `target ${vessel.tempTarget}°F`, color: alertColors[ta], icon: Thermometer },
          { label: 'Gravity', value: vessel.gravity.toFixed(3), target: `FG ${vessel.fg}`, color: '#d97706', icon: Activity },
          { label: 'Pressure', value: `${vessel.pressurePsi} PSI`, target: `max ${vessel.pressureMax}`, color: '#60a5fa', icon: Wind },
          { label: 'pH', value: vessel.ph.toFixed(1), target: `target ${vessel.phTarget}`, color: '#a78bfa', icon: Droplets },
        ].map(({ label, value, target, color, icon: Icon }) => (
          <div key={label} className="p-3 rounded-xl bg-brewery-800/50 border border-brewery-700/20 text-center">
            <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
            <p className="text-lg font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px] text-brewery-500 mt-0.5">{target}</p>
            <p className="text-[10px] text-brewery-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Temperature chart */}
      <div>
        <h3 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">Temperature History</h3>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={vessel.history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d1f0e" />
            <XAxis dataKey="time" tick={{ fill: '#5c3e19', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#5c3e19', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={(v: number) => `${v}°`} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return <div style={TOOLTIP_STYLE} className="px-2 py-1.5"><p className="text-amber-400 text-xs">{payload[0]?.value}°F</p></div>;
            }} />
            <ReferenceLine y={vessel.tempTarget} stroke="#d97706" strokeDasharray="4 2" strokeWidth={1.5} />
            <ReferenceLine y={vessel.tempMax} stroke="#ef4444" strokeDasharray="2 3" strokeWidth={1} />
            <ReferenceLine y={vessel.tempMin} stroke="#3b82f6" strokeDasharray="2 3" strokeWidth={1} />
            <Line type="monotone" dataKey="temp" stroke={alertColors[ta]} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-1 text-[10px] text-brewery-600">
          <span className="flex items-center gap-1"><span className="w-6 border-t border-dashed border-amber-600 inline-block" /> Target</span>
          <span className="flex items-center gap-1"><span className="w-6 border-t border-dashed border-red-500 inline-block" /> Max</span>
          <span className="flex items-center gap-1"><span className="w-6 border-t border-dashed border-blue-500 inline-block" /> Min</span>
        </div>
      </div>

      {/* Gravity attenuation chart */}
      <div>
        <h3 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">Gravity Attenuation</h3>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={vessel.history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d1f0e" />
            <XAxis dataKey="time" tick={{ fill: '#5c3e19', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#5c3e19', fontSize: 10 }} axisLine={false} tickLine={false} domain={[vessel.fg - 0.002, vessel.og + 0.002]} tickFormatter={(v: number) => v.toFixed(3)} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return <div style={TOOLTIP_STYLE} className="px-2 py-1.5"><p className="text-amber-400 text-xs">SG {payload[0]?.value}</p></div>;
            }} />
            <ReferenceLine y={vessel.fg} stroke="#10b981" strokeDasharray="4 2" strokeWidth={1.5} />
            <Line type="monotone" dataKey="gravity" stroke="#d97706" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-1 mt-1 text-[10px] text-brewery-600">
          <span className="w-6 border-t border-dashed border-emerald-500 inline-block" /> Target FG {vessel.fg}
        </div>
      </div>

      {/* Attenuation summary */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-brewery-700/20">
        <div className="text-center">
          <p className="text-sm font-bold text-brewery-100">{gravityPct(vessel)}%</p>
          <p className="text-[10px] text-brewery-500">Attenuation</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-amber-400">{abvEst(vessel)}</p>
          <p className="text-[10px] text-brewery-500">Est. ABV</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-blue-400">{vessel.totalDays - vessel.daysIn}d</p>
          <p className="text-[10px] text-brewery-500">Days Left</p>
        </div>
      </div>
    </div>
  );
}

// ─── Alerts Panel ─────────────────────────────────────────────────────────────

function AlertsPanel({ vessels }: { vessels: FermentVessel[] }) {
  const alerts = useMemo(() => {
    const out: { vessel: string; type: string; msg: string; level: 'warn' | 'critical' }[] = [];
    for (const v of vessels) {
      if (v.status === 'empty' || v.status === 'cleaning') continue;
      const ta = tempAlert(v);
      if (ta === 'critical') out.push({ vessel: v.name, type: 'Temperature', msg: `${v.tempF.toFixed(1)}°F — out of range (target ${v.tempTarget}°F)`, level: 'critical' });
      else if (ta === 'warn') out.push({ vessel: v.name, type: 'Temperature', msg: `${v.tempF.toFixed(1)}°F — approaching limit`, level: 'warn' });
      if (v.pressurePsi > v.pressureMax * 0.9) out.push({ vessel: v.name, type: 'Pressure', msg: `${v.pressurePsi} PSI — near max ${v.pressureMax} PSI`, level: 'warn' });
      if (v.ph < 3.2 || v.ph > 5.5) out.push({ vessel: v.name, type: 'pH', msg: `${v.ph} — outside normal range`, level: 'warn' });
      if (gravityPct(v) > 95) out.push({ vessel: v.name, type: 'Ready', msg: `Attenuation complete — ready to package`, level: 'warn' });
    }
    return out;
  }, [vessels]);

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/10 border border-emerald-500/20">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span className="text-xs text-emerald-300 font-medium">All vessels within normal parameters</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((a, i) => (
        <div key={i} className={clsx('flex items-start gap-2.5 px-3 py-2 rounded-xl border text-xs',
          a.level === 'critical' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'
        )}>
          <AlertTriangle className={clsx('w-3.5 h-3.5 flex-shrink-0 mt-0.5', a.level === 'critical' ? 'text-red-400' : 'text-amber-400')} />
          <div>
            <span className={clsx('font-semibold', a.level === 'critical' ? 'text-red-300' : 'text-amber-300')}>{a.vessel} · {a.type}: </span>
            <span className="text-brewery-300">{a.msg}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FermentationPage() {
  const [vessels, setVessels] = useState<FermentVessel[]>(INITIAL_VESSELS);
  const [selectedId, setSelectedId] = useState<string | null>('fv1');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate live sensor updates every 4 seconds
  const tickSensors = useCallback(() => {
    setVessels(prev => prev.map(v => {
      if (v.status === 'empty') return v;
      const tempDelta = (Math.random() - 0.5) * 0.3;
      const newTemp = Math.round((v.tempF + tempDelta) * 10) / 10;
      const gravDelta = v.status === 'fermenting' ? -(Math.random() * 0.0002) : 0;
      const newGrav = Math.max(v.fg, Math.round((v.gravity + gravDelta) * 10000) / 10000);
      const phDelta = (Math.random() - 0.5) * 0.05;
      const newPh = Math.round(Math.max(3.0, Math.min(7.5, v.ph + phDelta)) * 10) / 10;
      const pressDelta = (Math.random() - 0.5) * 0.4;
      const newPress = Math.round(Math.max(0, Math.min(v.pressureMax, v.pressurePsi + pressDelta)) * 10) / 10;

      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const newHistory = [...v.history.slice(-49), { time: now, temp: newTemp, gravity: newGrav, ph: newPh, pressure: newPress }];

      return { ...v, tempF: newTemp, gravity: newGrav, ph: newPh, pressurePsi: newPress, history: newHistory };
    }));
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    const id = setInterval(tickSensors, 4000);
    return () => clearInterval(id);
  }, [tickSensors]);

  const activeVessels = vessels.filter(v => v.status !== 'empty' && v.status !== 'cleaning');
  const fermentingCount = vessels.filter(v => v.status === 'fermenting').length;
  const alertCount = useMemo(() => {
    return vessels.filter(v => v.status !== 'empty' && v.status !== 'cleaning' && tempAlert(v) !== 'ok').length;
  }, [vessels]);

  const selectedVessel = vessels.find(v => v.id === selectedId) || null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-brewery-50" style={{ fontFamily: 'var(--font-display)' }}>Ferment Lab</h1>
          <p className="text-xs text-brewery-400 mt-0.5">Real-time fermentation sensor monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-300">Live · {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Vessels', value: activeVessels.length, icon: FlaskConical, color: 'text-amber-400', bg: 'bg-amber-600/10 border-amber-500/20' },
          { label: 'Fermenting', value: fermentingCount, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-600/10 border-emerald-500/20' },
          { label: 'Alerts', value: alertCount, icon: AlertTriangle, color: alertCount > 0 ? 'text-red-400' : 'text-brewery-500', bg: alertCount > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-brewery-800/40 border-brewery-700/30' },
          { label: 'Avg Temp', value: `${(activeVessels.reduce((s, v) => s + v.tempF, 0) / Math.max(1, activeVessels.length)).toFixed(1)}°F`, icon: Thermometer, color: 'text-blue-400', bg: 'bg-blue-600/10 border-blue-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={clsx('flex items-center gap-3 px-4 py-3 rounded-xl border', bg)}>
            <Icon className={clsx('w-5 h-5 flex-shrink-0', color)} />
            <div>
              <p className={clsx('text-xl font-bold', color)}>{value}</p>
              <p className="text-[10px] text-brewery-500 uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <AlertsPanel vessels={vessels} />

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vessel grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vessels.map(v => (
              <VesselCard
                key={v.id}
                vessel={v}
                onSelect={() => setSelectedId(v.id === selectedId ? null : v.id)}
                selected={v.id === selectedId}
              />
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selectedVessel && selectedVessel.status !== 'empty' && selectedVessel.status !== 'cleaning' ? (
            <DetailPanel vessel={selectedVessel} onClose={() => setSelectedId(null)} />
          ) : (
            <div className="bg-brewery-900/60 border border-brewery-700/30 rounded-xl p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
              <FlaskConical className="w-10 h-10 text-brewery-600 mb-3" />
              <p className="text-sm font-medium text-brewery-400">Select a vessel</p>
              <p className="text-xs text-brewery-600 mt-1 text-center">Click any active vessel card to see detailed charts and sensor history</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-brewery-700/30 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brewery-200">All Vessels Summary</h3>
          <span className="text-[10px] text-brewery-500">Updates every 4s</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-brewery-700/20">
                {['Vessel', 'Beer', 'Status', 'Temp (°F)', 'Target', 'Gravity', 'Attn.', 'Pressure', 'pH', 'Day'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-brewery-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brewery-700/10">
              {vessels.map(v => {
                const ta = tempAlert(v);
                const sc = statusColor(v.status);
                return (
                  <tr
                    key={v.id}
                    onClick={() => v.status !== 'empty' && v.status !== 'cleaning' && setSelectedId(v.id)}
                    className={clsx('transition-colors', v.status !== 'empty' && v.status !== 'cleaning' ? 'hover:bg-brewery-800/30 cursor-pointer' : 'opacity-50')}
                  >
                    <td className="px-3 py-2 font-medium text-brewery-100 whitespace-nowrap">{v.name}</td>
                    <td className="px-3 py-2 text-brewery-300 truncate max-w-[120px]">{v.beerName || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={clsx('flex items-center gap-1', sc.text)}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full', sc.dot)} />
                        {v.status}
                      </span>
                    </td>
                    <td className={clsx('px-3 py-2 font-bold whitespace-nowrap',
                      ta === 'critical' ? 'text-red-400' : ta === 'warn' ? 'text-amber-400' : 'text-brewery-200'
                    )}>
                      {v.tempF.toFixed(1)}
                      {ta !== 'ok' && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                    </td>
                    <td className="px-3 py-2 text-brewery-500">{v.tempTarget || '—'}</td>
                    <td className="px-3 py-2 text-brewery-200 font-mono">{v.gravity ? v.gravity.toFixed(3) : '—'}</td>
                    <td className="px-3 py-2">
                      {v.og ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-brewery-700/50 overflow-hidden">
                            <div className="h-full rounded-full bg-amber-500" style={{ width: `${gravityPct(v)}%` }} />
                          </div>
                          <span className="text-brewery-300">{gravityPct(v)}%</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2 text-blue-400">{v.pressurePsi ? v.pressurePsi.toFixed(1) : '—'}</td>
                    <td className="px-3 py-2 text-purple-400">{v.ph ? v.ph.toFixed(1) : '—'}</td>
                    <td className="px-3 py-2 text-brewery-400 whitespace-nowrap">
                      {v.totalDays ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {v.daysIn}/{v.totalDays}
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
