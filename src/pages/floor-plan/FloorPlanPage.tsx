import { useState, useMemo, useCallback } from 'react';
import {
  Map, Users, Clock, AlertTriangle, Eye, UserCheck,
  Receipt, DollarSign, Timer, Star, Calendar,
  ChevronDown, ChevronUp, X,
  Armchair, CloudOff, UserPlus, CreditCard
} from 'lucide-react';
import { clsx } from 'clsx';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import SlidePanel from '../../components/ui/SlidePanel';
import type { FloorTable, ServiceAlert, StaffMember } from '../../types';
import { useData } from '../../context/DataContext';

// --- Constants ---
type ZoneId = 'all' | FloorTable['zone'];

const ZONES: { id: ZoneId; label: string }[] = [
  { id: 'all', label: 'All Zones' },
  { id: 'taproom', label: 'Taproom' },
  { id: 'bar', label: 'Bar' },
  { id: 'patio', label: 'Patio' },
  { id: 'beer-garden', label: 'Beer Garden' },
  { id: 'private-room', label: 'Private Room' },
];

const ZONE_LABELS: Record<FloorTable['zone'], string> = {
  taproom: 'Taproom',
  bar: 'Bar',
  patio: 'Patio',
  'beer-garden': 'Beer Garden',
  'private-room': 'Private Room',
};

const STATUS_STYLES: Record<FloorTable['status'], { border: string; bg: string; text: string; badgeVariant: 'green' | 'amber' | 'purple' | 'red' | 'gray' }> = {
  available: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badgeVariant: 'green' },
  occupied: { border: 'border-amber-500', bg: 'bg-amber-600/20', text: 'text-amber-400', badgeVariant: 'amber' },
  reserved: { border: 'border-purple-500', bg: 'bg-purple-500/15', text: 'text-purple-400', badgeVariant: 'purple' },
  'needs-attention': { border: 'border-red-500', bg: 'bg-red-500/15', text: 'text-red-400', badgeVariant: 'red' },
  closed: { border: 'border-brewery-600', bg: 'bg-brewery-800/40', text: 'text-brewery-500', badgeVariant: 'gray' },
};

const ALERT_ICONS: Record<ServiceAlert['type'], React.ElementType> = {
  'no-order': Clock,
  'check-requested': Receipt,
  'high-tab': DollarSign,
  'long-seated': Timer,
  'vip-arrived': Star,
  'reservation-due': Calendar,
};

const SERVER_COLORS = [
  { bg: 'bg-sky-500/25', border: 'border-sky-400', text: 'text-sky-300', dot: 'bg-sky-400' },
  { bg: 'bg-rose-500/25', border: 'border-rose-400', text: 'text-rose-300', dot: 'bg-rose-400' },
  { bg: 'bg-violet-500/25', border: 'border-violet-400', text: 'text-violet-300', dot: 'bg-violet-400' },
  { bg: 'bg-teal-500/25', border: 'border-teal-400', text: 'text-teal-300', dot: 'bg-teal-400' },
  { bg: 'bg-orange-500/25', border: 'border-orange-400', text: 'text-orange-300', dot: 'bg-orange-400' },
  { bg: 'bg-lime-500/25', border: 'border-lime-400', text: 'text-lime-300', dot: 'bg-lime-400' },
];

const OCCUPANCY_DATA = [
  { hour: '11am', pct: 8 }, { hour: '12pm', pct: 25 }, { hour: '1pm', pct: 30 },
  { hour: '2pm', pct: 18 }, { hour: '3pm', pct: 28 }, { hour: '4pm', pct: 42 },
  { hour: '5pm', pct: 58 }, { hour: '6pm', pct: 82 }, { hour: '7pm', pct: 88 },
  { hour: '8pm', pct: 78 }, { hour: '9pm', pct: 62 }, { hour: '10pm', pct: 38 },
  { hour: '11pm', pct: 15 },
];

// servers computed inside component

function minutesAgo(isoString: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(isoString).getTime()) / 60000));
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

// Current hour index for the reference line
const currentHourIdx = (() => {
  const h = new Date().getHours();
  if (h < 11 || h > 23) return -1;
  return h - 11;
})();
const currentHourLabel = currentHourIdx >= 0 ? OCCUPANCY_DATA[currentHourIdx]?.hour : undefined;

// --- Zone boundary definitions for SVG ---
const ZONE_BOUNDS: Record<FloorTable['zone'], { x: number; y: number; w: number; h: number; label: string; bgClass: string }> = {
  bar: { x: 140, y: 15, w: 400, h: 80, label: 'Bar', bgClass: 'fill-amber-900/15' },
  taproom: { x: 170, y: 120, w: 400, h: 300, label: 'Taproom', bgClass: 'fill-brewery-800/30' },
  patio: { x: 590, y: 120, w: 240, h: 230, label: 'Patio', bgClass: 'fill-emerald-900/10' },
  'beer-garden': { x: 110, y: 420, w: 350, h: 175, label: 'Beer Garden', bgClass: 'fill-green-900/15' },
  'private-room': { x: 610, y: 15, w: 270, h: 95, label: 'Private Room', bgClass: 'fill-purple-900/10' },
};

// --- Main Component ---
export default function FloorPlanPage() {
  const { customers, staff: staffData, orderTimelines } = useData();
  const { floorTables, serviceAlerts, tabs, updateTable, dismissAlert, seatGuests, clearTable } = useBrewery();
  const servers = useMemo(() => staffData.filter((s: StaffMember) => ['bartender', 'server'].includes(s.role) && s.status === 'active'), [staffData]);
  const { toast } = useToast();

  const [activeZone, setActiveZone] = useState<ZoneId>('all');
  const [selectedTable, setSelectedTable] = useState<FloorTable | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [serverView, setServerView] = useState(false);
  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const [occupancyExpanded, setOccupancyExpanded] = useState(false);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  // Seat Guests form state
  const [seatFormOpen, setSeatFormOpen] = useState(false);
  const [seatTableId, setSeatTableId] = useState<string>('');
  const [seatCustomerName, setSeatCustomerName] = useState('');
  const [seatPartySize, setSeatPartySize] = useState(2);
  const [seatServerId, setSeatServerId] = useState(servers[0]?.id || '');
  const [customerSuggestions, setCustomerSuggestions] = useState<typeof customers>([]);

  // --- Derived data ---
  const filteredTables = useMemo(() =>
    activeZone === 'all' ? floorTables : floorTables.filter(t => t.zone === activeZone),
    [floorTables, activeZone]
  );

  const zoneCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const z of ZONES) {
      counts[z.id] = z.id === 'all' ? floorTables.length : floorTables.filter(t => t.zone === z.id).length;
    }
    return counts;
  }, [floorTables]);

  const occupiedTables = floorTables.filter(t => t.status === 'occupied' || t.status === 'needs-attention');
  const totalGuests = occupiedTables.reduce((s, t) => s + (t.partySize || 0), 0);
  const activeAlerts = serviceAlerts.length;

  // Server color mapping
  const serverColorMap = useMemo(() => {
    const map: Record<string, { bg: string; border: string; text: string; dot: string }> = {};
    const uniqueServers = [...new Set(floorTables.filter(t => t.serverName).map(t => t.serverName!))];
    uniqueServers.forEach((name, i) => { map[name] = SERVER_COLORS[i % SERVER_COLORS.length]; });
    return map;
  }, [floorTables]);

  // --- Handlers ---
  const openTablePanel = useCallback((table: FloorTable) => {
    setSelectedTable(table);
    setPanelOpen(true);
  }, []);

  const handleSeatGuests = useCallback(() => {
    if (!seatTableId || !seatCustomerName.trim()) return;
    const server = servers.find(s => s.id === seatServerId);
    if (!server) return;
    const matchedCustomer = customers.find(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase() === seatCustomerName.trim().toLowerCase()
    );
    seatGuests(seatTableId, seatCustomerName.trim(), seatPartySize, server.id, `${server.firstName} ${server.lastName}`, matchedCustomer?.id);
    toast('success', `Seated ${seatCustomerName.trim()} (${seatPartySize}) at ${floorTables.find(t => t.id === seatTableId)?.label || seatTableId}`);
    setSeatFormOpen(false);
    setSeatCustomerName('');
    setSeatPartySize(2);
    setPanelOpen(false);
  }, [seatTableId, seatCustomerName, seatPartySize, seatServerId, seatGuests, toast, floorTables]);

  const handleClearTable = useCallback((tableId: string) => {
    clearTable(tableId);
    toast('success', `Table ${floorTables.find(t => t.id === tableId)?.label || tableId} cleared`);
    setPanelOpen(false);
    setSelectedTable(null);
  }, [clearTable, toast, floorTables]);

  const handleCloseAllPatio = useCallback(() => {
    floorTables.filter(t => t.zone === 'patio' && t.status === 'available').forEach(t => {
      updateTable(t.id, { status: 'closed' });
    });
    toast('info', 'All available patio tables closed');
  }, [floorTables, updateTable, toast]);

  const openSeatForm = useCallback((tableId?: string) => {
    setSeatTableId(tableId || '');
    setSeatCustomerName('');
    setSeatPartySize(2);
    setSeatServerId(servers[0]?.id || '');
    setSeatFormOpen(true);
    if (tableId) {
      setPanelOpen(false);
    }
  }, []);

  const handleCustomerSearch = useCallback((value: string) => {
    setSeatCustomerName(value);
    if (value.length >= 2) {
      const lower = value.toLowerCase();
      setCustomerSuggestions(customers.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(lower)
      ).slice(0, 5));
    } else {
      setCustomerSuggestions([]);
    }
  }, []);

  // Get the tab for a table
  const getTabForTable = useCallback((table: FloorTable) => {
    if (!table.currentTabId) return null;
    return tabs.find(t => t.id === table.currentTabId) || null;
  }, [tabs]);

  // Refresh selected table from state
  const currentSelectedTable = selectedTable ? floorTables.find(t => t.id === selectedTable.id) || null : null;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tables Occupied"
          value={`${occupiedTables.length} / ${floorTables.length}`}
          icon={Map}
          iconColor="text-amber-400"
          iconBg="bg-amber-600/20"
          change={Math.round((occupiedTables.length / floorTables.length) * 100)}
          changeLabel="occupancy"
        />
        <StatCard
          title="Guests Seated"
          value={totalGuests}
          icon={Users}
          iconColor="text-blue-400"
          iconBg="bg-blue-600/20"
        />
        <StatCard
          title="Avg Turn Time"
          value="48 min"
          icon={Clock}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-600/20"
        />
        <StatCard
          title="Open Alerts"
          value={activeAlerts}
          icon={AlertTriangle}
          iconColor={activeAlerts > 0 ? 'text-red-400' : 'text-emerald-400'}
          iconBg={activeAlerts > 0 ? 'bg-red-600/20' : 'bg-emerald-600/20'}
        />
      </div>

      {/* Zone Tabs + Server View Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {ZONES.map(z => (
          <button
            key={z.id}
            data-zone={z.id}
            onClick={() => setActiveZone(z.id)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
              activeZone === z.id
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                : 'bg-brewery-800/60 text-brewery-400 border border-brewery-700/30 hover:text-brewery-200 hover:border-brewery-600/50'
            )}
          >
            {z.label}
            <span className={clsx(
              'text-xs px-1.5 py-0.5 rounded-full',
              activeZone === z.id ? 'bg-amber-500/30 text-amber-200' : 'bg-brewery-700/50 text-brewery-500'
            )}>
              {zoneCounts[z.id]}
            </span>
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={() => setServerView(!serverView)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 border',
              serverView
                ? 'bg-sky-600/30 text-sky-300 border-sky-500/40'
                : 'bg-brewery-800/60 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'
            )}
          >
            <Eye className="w-4 h-4" />
            Server View
          </button>
        </div>
      </div>

      {/* Floor Map + Alerts Sidebar */}
      <div className="flex gap-4 flex-col xl:flex-row">
        {/* Floor Map */}
        <div className="flex-1 bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 overflow-hidden">
          <div className="relative w-full" style={{ paddingBottom: '66.67%' }}>
            <svg
              viewBox="0 0 900 600"
              className="absolute inset-0 w-full h-full"
              style={{ fontFamily: 'inherit' }}
            >
              {/* Zone backgrounds */}
              {Object.entries(ZONE_BOUNDS).map(([zone, b]) => {
                if (activeZone !== 'all' && activeZone !== zone) return null;
                return (
                  <g key={zone}>
                    <rect
                      x={b.x} y={b.y} width={b.w} height={b.h}
                      rx={12}
                      className={b.bgClass}
                      strokeWidth={1}
                      strokeDasharray="6 4"
                      style={{ stroke: 'rgba(255,255,255,0.08)' }}
                    />
                    <text
                      x={b.x + 10} y={b.y + 18}
                      className="fill-brewery-500"
                      fontSize={11}
                      fontWeight={600}
                      letterSpacing={0.5}
                    >
                      {b.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* Bar counter shape */}
              {(activeZone === 'all' || activeZone === 'bar') && (
                <rect
                  x={160} y={72} width={360} height={18}
                  rx={9}
                  className="fill-amber-900/30"
                  style={{ stroke: 'rgba(217,119,6,0.3)', strokeWidth: 1.5 }}
                />
              )}

              {/* Tables */}
              {filteredTables.map(table => {
                const isHovered = hoveredTable === table.id;
                const isAlerted = serviceAlerts.some(a => a.tableId === table.id);
                const mins = table.seatedAt ? minutesAgo(table.seatedAt) : 0;

                // Server view colors
                const sColor = serverView && table.serverName
                  ? serverColorMap[table.serverName]
                  : null;

                const borderColor = sColor
                  ? (isHovered ? 'rgba(255,255,255,0.6)' : sColor.dot.replace('bg-', ''))
                  : table.status === 'available' ? 'rgba(16,185,129,0.6)'
                  : table.status === 'occupied' ? 'rgba(245,158,11,0.6)'
                  : table.status === 'reserved' ? 'rgba(168,85,247,0.6)'
                  : table.status === 'needs-attention' ? 'rgba(239,68,68,0.8)'
                  : 'rgba(107,114,128,0.3)';

                const fillColor = sColor
                  ? sColor.dot.replace('bg-', '').replace('-400', '')
                  : table.status === 'available' ? 'rgba(16,185,129,0.08)'
                  : table.status === 'occupied' ? 'rgba(245,158,11,0.15)'
                  : table.status === 'reserved' ? 'rgba(168,85,247,0.1)'
                  : table.status === 'needs-attention' ? 'rgba(239,68,68,0.15)'
                  : 'rgba(107,114,128,0.08)';

                const w = table.shape === 'community' ? (table.width || 80) : (table.width || 48);
                const h = table.shape === 'community' ? (table.height || 40) : (table.height || 48);
                const r = table.radius || 22;

                return (
                  <g
                    key={table.id}
                    className="cursor-pointer"
                    onClick={() => openTablePanel(table)}
                    onMouseEnter={() => setHoveredTable(table.id)}
                    onMouseLeave={() => setHoveredTable(null)}
                    style={{ transition: 'transform 0.2s' }}
                  >
                    {/* Pulse ring for needs-attention */}
                    {table.status === 'needs-attention' && (
                      table.shape === 'circle' ? (
                        <circle cx={table.x} cy={table.y} r={r + 6} fill="none" stroke="rgba(239,68,68,0.4)" strokeWidth={2}>
                          <animate attributeName="r" from={r + 4} to={r + 12} dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      ) : (
                        <rect x={table.x - w/2 - 4} y={table.y - h/2 - 4} width={w + 8} height={h + 8} rx={10} fill="none" stroke="rgba(239,68,68,0.4)" strokeWidth={2}>
                          <animate attributeName="opacity" from="0.6" to="0.1" dur="1.5s" repeatCount="indefinite" />
                        </rect>
                      )
                    )}

                    {/* Available pulse */}
                    {table.status === 'available' && (
                      table.shape === 'circle' ? (
                        <circle cx={table.x} cy={table.y} r={r + 3} fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth={1}>
                          <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                        </circle>
                      ) : null
                    )}

                    {/* Table shape */}
                    {table.shape === 'circle' ? (
                      <circle
                        cx={table.x} cy={table.y} r={r}
                        fill={fillColor}
                        stroke={borderColor}
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        opacity={table.status === 'closed' ? 0.4 : 1}
                        style={{
                          filter: table.status === 'occupied' ? 'drop-shadow(0 0 6px rgba(245,158,11,0.25))' : undefined,
                          transition: 'all 0.2s',
                        }}
                      />
                    ) : (
                      <rect
                        x={table.x - w/2} y={table.y - h/2}
                        width={w} height={h}
                        rx={table.shape === 'community' ? 6 : 8}
                        fill={fillColor}
                        stroke={borderColor}
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        opacity={table.status === 'closed' ? 0.4 : 1}
                        style={{
                          filter: table.status === 'occupied' ? 'drop-shadow(0 0 6px rgba(245,158,11,0.25))' : undefined,
                          transition: 'all 0.2s',
                        }}
                      />
                    )}

                    {/* Table label */}
                    <text
                      x={table.x}
                      y={table.status === 'occupied' || table.status === 'needs-attention' ? table.y - 4 : table.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={table.shape === 'circle' && r < 20 ? 9 : 11}
                      fontWeight={700}
                      fill={table.status === 'closed' ? 'rgba(156,163,175,0.5)' : 'rgba(255,255,255,0.85)'}
                    >
                      {table.label}
                    </text>

                    {/* Seat count for non-occupied */}
                    {table.status !== 'occupied' && table.status !== 'needs-attention' && (
                      <text
                        x={table.x}
                        y={table.y + (table.shape === 'circle' ? 12 : 12)}
                        textAnchor="middle"
                        fontSize={8}
                        fill="rgba(156,163,175,0.6)"
                      >
                        {table.seats}s
                      </text>
                    )}

                    {/* Occupied info: customer + time */}
                    {(table.status === 'occupied' || table.status === 'needs-attention') && table.currentCustomerName && (
                      <>
                        <text
                          x={table.x}
                          y={table.y + 6}
                          textAnchor="middle"
                          fontSize={7}
                          fill="rgba(255,255,255,0.6)"
                        >
                          {table.currentCustomerName.length > 10
                            ? table.currentCustomerName.slice(0, 9) + '..'
                            : table.currentCustomerName}
                        </text>
                        <text
                          x={table.x}
                          y={table.y + 15}
                          textAnchor="middle"
                          fontSize={7}
                          fill={mins > 90 ? 'rgba(239,68,68,0.8)' : mins > 45 ? 'rgba(245,158,11,0.8)' : 'rgba(16,185,129,0.8)'}
                        >
                          {formatMinutes(mins)}
                        </text>
                      </>
                    )}

                    {/* Reserved clock icon */}
                    {table.status === 'reserved' && (
                      <text x={table.x} y={table.y + 12} textAnchor="middle" fontSize={10} fill="rgba(168,85,247,0.7)">
                        &#x1F552;
                      </text>
                    )}

                    {/* Alert dot */}
                    {isAlerted && (
                      <circle cx={table.x + (table.shape === 'circle' ? r - 2 : w/2 - 2)} cy={table.y - (table.shape === 'circle' ? r - 2 : h/2 - 2)} r={5} fill="rgba(239,68,68,0.9)">
                        <animate attributeName="opacity" from="1" to="0.3" dur="1s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Hover tooltip */}
                    {isHovered && (table.status === 'occupied' || table.status === 'needs-attention') && (
                      <g>
                        <rect
                          x={table.x - 80} y={table.y - (table.shape === 'circle' ? r + 62 : h/2 + 62)}
                          width={160} height={52}
                          rx={6}
                          fill="rgba(17,24,39,0.95)"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth={1}
                        />
                        <text x={table.x - 72} y={table.y - (table.shape === 'circle' ? r + 46 : h/2 + 46)} fontSize={9} fill="rgba(255,255,255,0.9)" fontWeight={600}>
                          {table.currentCustomerName} ({table.partySize})
                        </text>
                        <text x={table.x - 72} y={table.y - (table.shape === 'circle' ? r + 34 : h/2 + 34)} fontSize={8} fill="rgba(156,163,175,0.8)">
                          Server: {table.serverName || 'Unassigned'} | {formatMinutes(mins)} seated
                        </text>
                        {(() => {
                          const tab = table.currentTabId ? tabs.find(t => t.id === table.currentTabId) : null;
                          return tab ? (
                            <text x={table.x - 72} y={table.y - (table.shape === 'circle' ? r + 22 : h/2 + 22)} fontSize={8} fill="rgba(245,158,11,0.9)">
                              Tab: ${tab.subtotal.toFixed(2)}
                            </text>
                          ) : null;
                        })()}
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Server View Legend */}
          {serverView && (
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-brewery-700/30">
              <span className="text-xs text-brewery-500 font-medium">Servers:</span>
              {Object.entries(serverColorMap).map(([name, color]) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className={clsx('w-3 h-3 rounded-full', color.dot)} />
                  <span className={clsx('text-xs font-medium', color.text)}>{name}</span>
                </div>
              ))}
              {floorTables.some(t => !t.serverName && t.status !== 'available' && t.status !== 'closed') && (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-brewery-600" />
                  <span className="text-xs text-brewery-400">Unassigned</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Service Alerts Panel */}
        <div className="xl:w-80 flex-shrink-0">
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl">
            <button
              onClick={() => setAlertsExpanded(!alertsExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-brewery-100">Service Alerts</span>
                {activeAlerts > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300">{activeAlerts}</span>
                )}
              </div>
              {alertsExpanded ? <ChevronUp className="w-4 h-4 text-brewery-400" /> : <ChevronDown className="w-4 h-4 text-brewery-400" />}
            </button>

            {alertsExpanded && (
              <div className="px-4 pb-4 space-y-2 max-h-[400px] overflow-y-auto">
                {serviceAlerts.length === 0 ? (
                  <p className="text-xs text-brewery-500 text-center py-4">No active alerts</p>
                ) : (
                  [...serviceAlerts]
                    .sort((a, b) => {
                      const p = { high: 0, medium: 1, low: 2 };
                      return p[a.priority] - p[b.priority];
                    })
                    .map(alert => {
                      const AlertIcon = ALERT_ICONS[alert.type];
                      const table = floorTables.find(t => t.id === alert.tableId);
                      return (
                        <div
                          key={alert.id}
                          className={clsx(
                            'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:border-brewery-500/40',
                            alert.priority === 'high' ? 'bg-red-500/5 border-red-500/20' :
                            alert.priority === 'medium' ? 'bg-amber-500/5 border-amber-500/20' :
                            'bg-brewery-800/50 border-brewery-700/20'
                          )}
                          onClick={() => {
                            if (table) {
                              openTablePanel(table);
                              setActiveZone('all');
                            }
                          }}
                        >
                          <AlertIcon className={clsx('w-4 h-4 flex-shrink-0 mt-0.5',
                            alert.priority === 'high' ? 'text-red-400' : alert.priority === 'medium' ? 'text-amber-400' : 'text-brewery-400'
                          )} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-brewery-200">{table?.label || alert.tableId}</span>
                              <Badge variant={alert.priority === 'high' ? 'red' : alert.priority === 'medium' ? 'amber' : 'gray'} className="text-[10px] py-0 px-1.5">
                                {alert.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-brewery-400 mt-0.5 leading-relaxed">{alert.message}</p>
                            <p className="text-[10px] text-brewery-600 mt-1">{formatMinutes(minutesAgo(alert.createdAt))} ago</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissAlert(alert.id);
                              toast('info', 'Alert dismissed');
                            }}
                            className="text-brewery-500 hover:text-brewery-300 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Occupancy Heatmap */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl">
        <button
          onClick={() => setOccupancyExpanded(!occupancyExpanded)}
          className="w-full flex items-center justify-between px-5 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-brewery-100">Hourly Occupancy</span>
          </div>
          {occupancyExpanded ? <ChevronUp className="w-4 h-4 text-brewery-400" /> : <ChevronDown className="w-4 h-4 text-brewery-400" />}
        </button>
        {occupancyExpanded && (
          <div className="px-5 pb-5">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={OCCUPANCY_DATA} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#e5e7eb' }}
                    itemStyle={{ color: '#f59e0b' }}
                  />
                  {currentHourLabel && (
                    <ReferenceLine x={currentHourLabel} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} />
                  )}
                  <Area type="monotone" dataKey="pct" name="Occupancy" stroke="#f59e0b" fillOpacity={1} fill="url(#occupancyGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-brewery-900/95 backdrop-blur-xl border border-brewery-700/30 rounded-2xl px-5 py-3 shadow-2xl">
        <button
          onClick={() => openSeatForm()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 text-amber-300 rounded-xl text-sm font-medium hover:bg-amber-600/30 transition-colors border border-amber-500/30"
        >
          <UserPlus className="w-4 h-4" />
          Seat Walk-in
        </button>
        <button
          onClick={handleCloseAllPatio}
          className="flex items-center gap-2 px-4 py-2 bg-brewery-800/60 text-brewery-300 rounded-xl text-sm font-medium hover:bg-brewery-700/60 transition-colors border border-brewery-700/30"
        >
          <CloudOff className="w-4 h-4" />
          Close All Patio
        </button>
        <button
          onClick={() => {/* navigate to POS — would need page nav context */}}
          className="flex items-center gap-2 px-4 py-2 bg-brewery-800/60 text-brewery-300 rounded-xl text-sm font-medium hover:bg-brewery-700/60 transition-colors border border-brewery-700/30"
        >
          <CreditCard className="w-4 h-4" />
          Send to POS
        </button>
      </div>

      {/* Table Detail SlidePanel */}
      <SlidePanel isOpen={panelOpen} onClose={() => { setPanelOpen(false); setSelectedTable(null); }} title={currentSelectedTable ? `${currentSelectedTable.label} - ${ZONE_LABELS[currentSelectedTable.zone]}` : 'Table Detail'}>
        {currentSelectedTable && (
          <div className="space-y-5">
            {/* Status + Seats */}
            <div className="flex items-center gap-3">
              <Badge variant={STATUS_STYLES[currentSelectedTable.status].badgeVariant}>
                {currentSelectedTable.status.replace('-', ' ')}
              </Badge>
              <span className="text-xs text-brewery-400 flex items-center gap-1">
                <Armchair className="w-3.5 h-3.5" /> {currentSelectedTable.seats} seats
              </span>
              <Badge variant="gray">{ZONE_LABELS[currentSelectedTable.zone]}</Badge>
            </div>

            {/* Occupied Details */}
            {(currentSelectedTable.status === 'occupied' || currentSelectedTable.status === 'needs-attention') && (
              <div className="space-y-4">
                <div className="bg-brewery-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-brewery-100">
                        {currentSelectedTable.currentCustomerName}
                      </p>
                      <p className="text-xs text-brewery-400">Party of {currentSelectedTable.partySize} | Server: {currentSelectedTable.serverName}</p>
                    </div>
                    {currentSelectedTable.currentCustomerId && (
                      <Badge variant="blue" className="text-[10px]">CRM</Badge>
                    )}
                  </div>

                  {/* Time seated bar */}
                  {currentSelectedTable.seatedAt && (() => {
                    const mins = minutesAgo(currentSelectedTable.seatedAt);
                    const pct = Math.min(100, (mins / 120) * 100);
                    const color = mins > 90 ? 'bg-red-500' : mins > 45 ? 'bg-amber-500' : 'bg-emerald-500';
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-brewery-400">Time seated</span>
                          <span className={clsx('text-xs font-medium', mins > 90 ? 'text-red-400' : mins > 45 ? 'text-amber-400' : 'text-emerald-400')}>
                            {formatMinutes(mins)}
                          </span>
                        </div>
                        <div className="h-2 bg-brewery-800 rounded-full overflow-hidden">
                          <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Tab items */}
                {(() => {
                  const tab = getTabForTable(currentSelectedTable);
                  if (!tab || tab.items.length === 0) return (
                    <p className="text-xs text-brewery-500 italic">No items on tab yet</p>
                  );
                  return (
                    <div className="bg-brewery-800/50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-brewery-300 mb-2">Current Tab</p>
                      <div className="space-y-1.5">
                        {tab.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-brewery-200">{item.qty}x {item.name} {item.size && <span className="text-brewery-500">({item.size})</span>}</span>
                            <span className="text-brewery-400">${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-brewery-700/30">
                        <span className="text-xs font-semibold text-brewery-200">Subtotal</span>
                        <span className="text-sm font-bold text-amber-400">${tab.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toast('info', 'Check requested for ' + currentSelectedTable.label)}
                    className="flex-1 px-3 py-2 bg-amber-600/20 text-amber-300 rounded-lg text-xs font-medium hover:bg-amber-600/30 transition-colors border border-amber-500/30"
                  >
                    Request Check
                  </button>
                  <button
                    onClick={() => handleClearTable(currentSelectedTable.id)}
                    className="flex-1 px-3 py-2 bg-red-600/20 text-red-300 rounded-lg text-xs font-medium hover:bg-red-600/30 transition-colors border border-red-500/30"
                  >
                    Clear Table
                  </button>
                </div>
              </div>
            )}

            {/* Available Actions */}
            {currentSelectedTable.status === 'available' && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    openSeatForm(currentSelectedTable.id);
                    setSeatFormOpen(true);
                  }}
                  className="w-full px-4 py-2.5 bg-amber-600/20 text-amber-300 rounded-lg text-sm font-medium hover:bg-amber-600/30 transition-colors border border-amber-500/30 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Seat Guests
                </button>
                <button
                  onClick={() => {
                    updateTable(currentSelectedTable.id, { status: 'reserved' });
                    toast('info', `${currentSelectedTable.label} marked as reserved`);
                    setPanelOpen(false);
                  }}
                  className="w-full px-4 py-2.5 bg-purple-600/20 text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-600/30 transition-colors border border-purple-500/30"
                >
                  Reserve
                </button>
                <button
                  onClick={() => {
                    updateTable(currentSelectedTable.id, { status: 'closed' });
                    toast('info', `${currentSelectedTable.label} marked as closed`);
                    setPanelOpen(false);
                  }}
                  className="w-full px-4 py-2.5 bg-brewery-800/60 text-brewery-400 rounded-lg text-sm font-medium hover:bg-brewery-700/60 transition-colors border border-brewery-700/30"
                >
                  Mark Closed
                </button>
              </div>
            )}

            {/* Reserved Actions */}
            {currentSelectedTable.status === 'reserved' && (
              <div className="space-y-3">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <p className="text-xs font-semibold text-purple-300 mb-1">Reserved</p>
                  <p className="text-xs text-brewery-400">Table is reserved for an upcoming party.</p>
                </div>
                <button
                  onClick={() => {
                    openSeatForm(currentSelectedTable.id);
                    setSeatFormOpen(true);
                  }}
                  className="w-full px-4 py-2.5 bg-amber-600/20 text-amber-300 rounded-lg text-sm font-medium hover:bg-amber-600/30 transition-colors border border-amber-500/30 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Seat Now
                </button>
                <button
                  onClick={() => {
                    updateTable(currentSelectedTable.id, { status: 'available', reservationId: undefined });
                    toast('info', `Reservation cancelled for ${currentSelectedTable.label}`);
                    setPanelOpen(false);
                  }}
                  className="w-full px-4 py-2.5 bg-red-600/20 text-red-300 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors border border-red-500/30"
                >
                  Cancel Reservation
                </button>
              </div>
            )}

            {/* Closed */}
            {currentSelectedTable.status === 'closed' && (
              <div className="space-y-3">
                <p className="text-xs text-brewery-500">This table is currently closed.</p>
                <button
                  onClick={() => {
                    updateTable(currentSelectedTable.id, { status: 'available' });
                    toast('success', `${currentSelectedTable.label} reopened`);
                    setPanelOpen(false);
                  }}
                  className="w-full px-4 py-2.5 bg-emerald-600/20 text-emerald-300 rounded-lg text-sm font-medium hover:bg-emerald-600/30 transition-colors border border-emerald-500/30"
                >
                  Reopen Table
                </button>
              </div>
            )}

            {/* Order Timeline */}
            {(() => {
              const timeline = orderTimelines.filter(e => e.tableId === currentSelectedTable.id);
              if (timeline.length === 0) return null;
              return (
                <div>
                  <p className="text-xs font-semibold text-brewery-300 mb-3">Order Timeline</p>
                  <div className="relative pl-5 space-y-3">
                    <div className="absolute left-[7px] top-1 bottom-1 w-px bg-brewery-700/50" />
                    {timeline.map(entry => {
                      const iconMap: Record<string, string> = {
                        seated: '🪑', ordered: '📝', served: '🍺',
                        'check-requested': '🧾', payment: '💳', cleared: '✅',
                      };
                      return (
                        <div key={entry.id} className="relative flex gap-3">
                          <div className="absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full bg-brewery-800 border border-brewery-600 flex items-center justify-center text-[8px]">
                            {iconMap[entry.action] || '•'}
                          </div>
                          <div>
                            <p className="text-xs text-brewery-200">{entry.description}</p>
                            <p className="text-[10px] text-brewery-500">
                              {new Date(entry.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </SlidePanel>

      {/* Seat Guests Modal */}
      {seatFormOpen && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={() => setSeatFormOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[105] w-full max-w-md bg-brewery-900 border border-brewery-700/30 rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brewery-50">Seat Guests</h3>
              <button onClick={() => setSeatFormOpen(false)} className="text-brewery-400 hover:text-brewery-100 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Table selector (only if not pre-selected) */}
              {!seatTableId && (
                <div>
                  <label className="block text-xs font-medium text-brewery-400 mb-1">Table</label>
                  <select
                    value={seatTableId}
                    onChange={(e) => setSeatTableId(e.target.value)}
                    className="w-full bg-brewery-800 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="">Select a table...</option>
                    {floorTables.filter(t => t.status === 'available' || t.status === 'reserved').map(t => (
                      <option key={t.id} value={t.id}>{t.label} ({ZONE_LABELS[t.zone]}, {t.seats} seats)</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Customer name with autocomplete */}
              <div className="relative">
                <label className="block text-xs font-medium text-brewery-400 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={seatCustomerName}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  placeholder="Walk-in or search customer..."
                  className="w-full bg-brewery-800 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50"
                />
                {customerSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-brewery-800 border border-brewery-700/50 rounded-lg shadow-xl z-10 overflow-hidden">
                    {customerSuggestions.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSeatCustomerName(`${c.firstName} ${c.lastName}`);
                          setCustomerSuggestions([]);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-brewery-200 hover:bg-brewery-700/50 flex items-center justify-between"
                      >
                        <span>{c.firstName} {c.lastName}</span>
                        <span className="text-xs text-brewery-500">{c.loyaltyTier}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Party size */}
              <div>
                <label className="block text-xs font-medium text-brewery-400 mb-1">Party Size</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSeatPartySize(Math.max(1, seatPartySize - 1))}
                    className="w-8 h-8 bg-brewery-800 border border-brewery-700/50 rounded-lg text-brewery-200 hover:bg-brewery-700/50 flex items-center justify-center"
                  >-</button>
                  <span className="text-lg font-bold text-brewery-100 w-8 text-center">{seatPartySize}</span>
                  <button
                    onClick={() => setSeatPartySize(seatPartySize + 1)}
                    className="w-8 h-8 bg-brewery-800 border border-brewery-700/50 rounded-lg text-brewery-200 hover:bg-brewery-700/50 flex items-center justify-center"
                  >+</button>
                </div>
              </div>

              {/* Server */}
              <div>
                <label className="block text-xs font-medium text-brewery-400 mb-1">Server</label>
                <select
                  value={seatServerId}
                  onChange={(e) => setSeatServerId(e.target.value)}
                  className="w-full bg-brewery-800 border border-brewery-700/50 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50"
                >
                  {servers.map(s => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.role})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSeatGuests}
                disabled={!seatTableId || !seatCustomerName.trim()}
                className={clsx(
                  'w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                  seatTableId && seatCustomerName.trim()
                    ? 'bg-amber-600 text-white hover:bg-amber-500'
                    : 'bg-brewery-800 text-brewery-500 cursor-not-allowed'
                )}
              >
                <UserCheck className="w-4 h-4" />
                Seat Guests
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom spacer for fixed action bar */}
      <div className="h-20" />
    </div>
  );
}
