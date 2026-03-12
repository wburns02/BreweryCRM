import { useState, useEffect, useRef } from 'react';
import {
  QrCode, Star, Gift, TrendingUp, Users, Award, Search, Check,
  ChevronRight, Zap, Crown, Shield, Flame, Clock, BarChart3,
  ArrowUp, Sparkles,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { useData } from '../../context/DataContext';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';
import type { Customer } from '../../types';

// ─── Constants ──────────────────────────────────────────────────────────────

const TIER_CONFIG = {
  Bronze: {
    label: 'Bronze',
    icon: Shield,
    color: 'text-amber-700',
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/30',
    gradient: 'from-amber-900/40 to-amber-800/20',
    min: 0,
    max: 499,
    pointsPerVisit: 10,
  },
  Silver: {
    label: 'Silver',
    icon: Star,
    color: 'text-slate-300',
    bg: 'bg-slate-800/30',
    border: 'border-slate-500/30',
    gradient: 'from-slate-800/40 to-slate-700/20',
    min: 500,
    max: 999,
    pointsPerVisit: 15,
  },
  Gold: {
    label: 'Gold',
    icon: Crown,
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-500/30',
    gradient: 'from-yellow-900/40 to-yellow-800/20',
    min: 1000,
    max: 2499,
    pointsPerVisit: 20,
  },
  Platinum: {
    label: 'Platinum',
    icon: Sparkles,
    color: 'text-purple-300',
    bg: 'bg-purple-900/20',
    border: 'border-purple-500/30',
    gradient: 'from-purple-900/40 to-purple-800/20',
    min: 2500,
    max: Infinity,
    pointsPerVisit: 30,
  },
} as const;

const REWARDS = [
  { id: 'r1', name: 'Free Pint', description: 'Any draft beer on tap', cost: 100, icon: '🍺', category: 'Drinks' },
  { id: 'r2', name: 'Growler Fill', description: '32oz growler fill', cost: 200, icon: '🫙', category: 'Drinks' },
  { id: 'r3', name: 'Brewery Glass', description: 'Bearded Hop branded pint glass', cost: 250, icon: '🥃', category: 'Merch' },
  { id: 'r4', name: 'Happy Hour x2', description: 'Double happy hour discount for 1 visit', cost: 300, icon: '⚡', category: 'Perks' },
  { id: 'r5', name: 'T-Shirt', description: 'Bearded Hop Brewery tee (any size)', cost: 500, icon: '👕', category: 'Merch' },
  { id: 'r6', name: 'Event Ticket', description: 'One ticket to any regular event', cost: 600, icon: '🎟️', category: 'Experiences' },
  { id: 'r7', name: 'Beer Tasting Flight', description: 'Guided 6-beer tasting flight with head brewer notes', cost: 750, icon: '🎓', category: 'Experiences' },
  { id: 'r8', name: 'Mug Club Upgrade', description: '3-month Mug Club membership', cost: 1000, icon: '👑', category: 'Premium' },
];

// ─── Simulated check-in history (today's activity) ──────────────────────────

const TODAY_CHECKINS = [
  { name: 'Marcus R.', tier: 'Gold', time: '11:43 AM', pts: 20 },
  { name: 'Sarah K.', tier: 'Platinum', time: '11:38 AM', pts: 30 },
  { name: 'Travis B.', tier: 'Silver', time: '11:21 AM', pts: 15 },
  { name: 'Jennifer L.', tier: 'Bronze', time: '11:05 AM', pts: 10 },
  { name: 'David M.', tier: 'Gold', time: '10:52 AM', pts: 20 },
  { name: 'Amanda H.', tier: 'Silver', time: '10:44 AM', pts: 15 },
  { name: 'Carlos V.', tier: 'Bronze', time: '10:31 AM', pts: 10 },
  { name: 'Donna F.', tier: 'Platinum', time: '10:19 AM', pts: 30 },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const cfg = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG.Bronze;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
      <Icon className="w-2.5 h-2.5" />
      {tier}
    </span>
  );
}

function PointsBar({ current, max, color = 'amber' }: { current: number; max: number; color?: string }) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  const colorMap: Record<string, string> = {
    amber: 'bg-amber-500', silver: 'bg-slate-400', gold: 'bg-yellow-400', purple: 'bg-purple-500',
  };
  return (
    <div className="w-full h-1.5 bg-brewery-700/40 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorMap[color] ?? 'bg-amber-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── QR Scanner Animation ────────────────────────────────────────────────────

function QRScanner({ onScan }: { onScan: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startScan = () => {
    setScanning(true);
    setScanLine(0);
    let pos = 0;
    intervalRef.current = setInterval(() => {
      pos = (pos + 3) % 100;
      setScanLine(pos);
    }, 30);
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setScanning(false);
      onScan();
    }, 2000);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative w-48 h-48 border-2 rounded-xl overflow-hidden cursor-pointer transition-all ${
          scanning ? 'border-amber-400 shadow-lg shadow-amber-500/30' : 'border-brewery-600/50 hover:border-amber-500/50'
        }`}
        onClick={!scanning ? startScan : undefined}
      >
        {/* QR pattern background */}
        <div className="absolute inset-0 bg-brewery-800/80 grid grid-cols-6 gap-1 p-3">
          {Array.from({ length: 36 }, (_, i) => (
            <div
              key={i}
              className={`rounded-sm transition-opacity ${
                [0,1,5,6,7,11,12,17,18,23,24,29,30,31,35].includes(i)
                  ? 'bg-brewery-100/90'
                  : [2,3,4,8,9,10,13,14,15,16,19,20,21,22,25,26,27,28,32,33,34].includes(i)
                    ? 'bg-brewery-100/60'
                    : 'bg-brewery-100/20'
              }`}
            />
          ))}
        </div>

        {/* Corner markers */}
        {[
          'top-2 left-2 border-t-2 border-l-2',
          'top-2 right-2 border-t-2 border-r-2',
          'bottom-2 left-2 border-b-2 border-l-2',
          'bottom-2 right-2 border-b-2 border-r-2',
        ].map((cls, i) => (
          <div key={i} className={`absolute w-5 h-5 border-amber-400 ${cls}`} />
        ))}

        {/* Scan line */}
        {scanning && (
          <div
            className="absolute left-0 right-0 h-0.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] transition-none"
            style={{ top: `${scanLine}%` }}
          />
        )}

        {/* Overlay when not scanning */}
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-brewery-900/60 backdrop-blur-[1px]">
            <QrCode className="w-8 h-8 text-amber-400 mb-1" />
            <span className="text-[10px] text-brewery-300 font-medium">Tap to scan</span>
          </div>
        )}
      </div>
      {scanning && (
        <p className="text-xs text-amber-400 animate-pulse font-medium">Scanning...</p>
      )}
      {!scanning && (
        <p className="text-xs text-brewery-400 text-center">Ask the customer to show their loyalty QR code</p>
      )}
    </div>
  );
}

// ─── Customer Check-in Search ────────────────────────────────────────────────

function CheckInSearch({ customers, onCheckIn }: { customers: Customer[]; onCheckIn: (c: Customer) => void }) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const results = query.trim().length >= 2
    ? customers.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query) ||
        c.email.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brewery-500" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Name, phone, or email..."
          className="w-full pl-9 pr-4 py-2.5 bg-brewery-800/50 border border-brewery-700/40 rounded-xl text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
        />
      </div>
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-brewery-800 border border-brewery-700/40 rounded-xl shadow-xl overflow-hidden z-20">
          {results.map(c => {
            const cfg = TIER_CONFIG[c.loyaltyTier] ?? TIER_CONFIG.Bronze;
            const Icon = cfg.icon;
            return (
              <button
                key={c.id}
                onMouseDown={() => onCheckIn(c)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brewery-700/40 transition-colors text-left"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brewery-100">{c.firstName} {c.lastName}</p>
                  <p className="text-[10px] text-brewery-400">{c.phone} · {c.loyaltyPoints.toLocaleString()} pts · {c.totalVisits} visits</p>
                </div>
                <TierBadge tier={c.loyaltyTier} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Confetti ───────────────────────────────────────────────────────────────

function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 30 }, (_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            backgroundColor: ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6'][i % 5],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LoyaltyPage() {
  const { customers } = useData();
  const { updateCustomer } = useBrewery();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'checkin' | 'leaderboard' | 'rewards' | 'tiers'>('checkin');
  const [checkedInCustomer, setCheckedInCustomer] = useState<Customer | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [todayCheckins, setTodayCheckins] = useState(TODAY_CHECKINS);
  const [redeemCustomer, setRedeemCustomer] = useState<Customer | null>(null);

  // Stats
  const totalMembers = customers.length;
  const tierCounts = customers.reduce((acc, c) => {
    acc[c.loyaltyTier] = (acc[c.loyaltyTier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalPointsAwarded = customers.reduce((s, c) => s + c.loyaltyPoints, 0);
  const todayPts = todayCheckins.reduce((s, c) => s + c.pts, 0);

  const handleQRScan = () => {
    // Simulate scanning a random customer's QR
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    if (randomCustomer) handleCheckIn(randomCustomer);
  };

  const handleCheckIn = (customer: Customer) => {
    const cfg = TIER_CONFIG[customer.loyaltyTier] ?? TIER_CONFIG.Bronze;
    const ptsEarned = cfg.pointsPerVisit + (customer.mugClubMember ? 5 : 0);
    const newPoints = customer.loyaltyPoints + ptsEarned;

    // Determine new tier
    let newTier: Customer['loyaltyTier'] = customer.loyaltyTier;
    if (newPoints >= 2500) newTier = 'Platinum';
    else if (newPoints >= 1000) newTier = 'Gold';
    else if (newPoints >= 500) newTier = 'Silver';
    else newTier = 'Bronze';

    const tierUp = newTier !== customer.loyaltyTier;

    updateCustomer(customer.id, {
      loyaltyPoints: newPoints,
      loyaltyTier: newTier,
      totalVisits: customer.totalVisits + 1,
      lastVisit: new Date().toISOString().split('T')[0],
    });

    setCheckedInCustomer({ ...customer, loyaltyPoints: newPoints, loyaltyTier: newTier });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);

    setTodayCheckins(prev => [{
      name: `${customer.firstName} ${customer.lastName[0]}.`,
      tier: newTier,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      pts: ptsEarned,
    }, ...prev.slice(0, 7)]);

    if (tierUp) {
      toast('success', `🎉 ${customer.firstName} leveled up to ${newTier}! +${ptsEarned} pts`);
    } else {
      toast('success', `✓ ${customer.firstName} checked in! +${ptsEarned} pts (${newPoints.toLocaleString()} total)`);
    }
  };

  const handleRedeem = (customer: Customer, reward: typeof REWARDS[0]) => {
    if (customer.loyaltyPoints < reward.cost) {
      toast('error', `Not enough points (needs ${reward.cost}, has ${customer.loyaltyPoints})`);
      return;
    }
    const newPoints = customer.loyaltyPoints - reward.cost;
    updateCustomer(customer.id, { loyaltyPoints: newPoints });
    toast('success', `${reward.icon} "${reward.name}" redeemed for ${customer.firstName}! ${reward.cost} pts used.`);
    setRedeemCustomer(null);
  };

  // Sort customers by points for leaderboard
  const leaderboard = [...customers].sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).slice(0, 20);

  return (
    <div className="space-y-6">
      <Confetti show={showConfetti} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-brewery-400">Loyalty Members</span>
          </div>
          <p className="text-2xl font-bold text-brewery-50">{totalMembers.toLocaleString()}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-brewery-400">Today's Check-ins</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{todayCheckins.length}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-brewery-400">Points Awarded Today</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{(todayPts + 150).toLocaleString()}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-brewery-400">Total Points in Circulation</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{totalPointsAwarded.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brewery-700/30">
        {([
          { id: 'checkin', label: 'Check-in Station', icon: QrCode },
          { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
          { id: 'rewards', label: 'Redeem Rewards', icon: Gift },
          { id: 'tiers', label: 'Tier Overview', icon: Award },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? 'text-amber-400 border-amber-400'
                : 'text-brewery-400 border-transparent hover:text-brewery-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB: Check-in Station ─── */}
      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Scanner + Search */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-brewery-200 mb-4">Check In a Customer</h3>

              <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* QR Scanner */}
                <div className="flex-shrink-0">
                  <QRScanner onScan={handleQRScan} />
                </div>

                {/* Divider */}
                <div className="flex lg:flex-col items-center gap-3 text-brewery-500">
                  <div className="flex-1 h-px lg:h-auto lg:w-px bg-brewery-700/30" />
                  <span className="text-xs font-medium">OR</span>
                  <div className="flex-1 h-px lg:h-auto lg:w-px bg-brewery-700/30" />
                </div>

                {/* Manual Search */}
                <div className="flex-1 w-full space-y-3">
                  <p className="text-sm text-brewery-300 font-medium">Search by name, phone, or email</p>
                  <CheckInSearch customers={customers} onCheckIn={handleCheckIn} />
                  <p className="text-xs text-brewery-500">Points are awarded automatically on check-in</p>
                </div>
              </div>
            </div>

            {/* Success Card */}
            {checkedInCustomer && (
              <div className={`bg-gradient-to-br ${TIER_CONFIG[checkedInCustomer.loyaltyTier]?.gradient ?? 'from-amber-900/40 to-amber-800/20'} border ${TIER_CONFIG[checkedInCustomer.loyaltyTier]?.border ?? 'border-amber-700/30'} rounded-xl p-5 animate-pulse-once`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${TIER_CONFIG[checkedInCustomer.loyaltyTier]?.bg ?? 'bg-amber-900/30'}`}>
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-brewery-100">
                        {checkedInCustomer.firstName} {checkedInCustomer.lastName}
                      </h3>
                      <TierBadge tier={checkedInCustomer.loyaltyTier} />
                    </div>
                    <p className="text-sm text-brewery-300 mb-3">Checked in successfully!</p>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-brewery-900/50 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-amber-400">{checkedInCustomer.loyaltyPoints.toLocaleString()}</p>
                        <p className="text-[10px] text-brewery-500">Total Points</p>
                      </div>
                      <div className="bg-brewery-900/50 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-brewery-100">{checkedInCustomer.totalVisits}</p>
                        <p className="text-[10px] text-brewery-500">Total Visits</p>
                      </div>
                      <div className="bg-brewery-900/50 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-emerald-400">${checkedInCustomer.totalSpent.toLocaleString()}</p>
                        <p className="text-[10px] text-brewery-500">Lifetime Spend</p>
                      </div>
                    </div>

                    {/* Points to next tier */}
                    {checkedInCustomer.loyaltyTier !== 'Platinum' && (() => {
                      const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'] as const;
                      const idx = tiers.indexOf(checkedInCustomer.loyaltyTier);
                      const nextTier = tiers[idx + 1];
                      const nextMin = TIER_CONFIG[nextTier].min;
                      const pts = checkedInCustomer.loyaltyPoints;
                      const remaining = nextMin - pts;
                      return (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[10px] text-brewery-500">
                            <span>{pts.toLocaleString()} pts</span>
                            <span className="flex items-center gap-1">
                              <ArrowUp className="w-2.5 h-2.5" />{remaining} to {nextTier}
                            </span>
                          </div>
                          <PointsBar current={pts - TIER_CONFIG[checkedInCustomer.loyaltyTier].min} max={nextMin - TIER_CONFIG[checkedInCustomer.loyaltyTier].min} />
                        </div>
                      );
                    })()}

                    <button
                      onClick={() => setRedeemCustomer(checkedInCustomer)}
                      className="mt-3 flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5" /> Redeem rewards →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Today's Activity */}
          <div className="space-y-4">
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">
                Today's Check-ins
              </h4>
              <div className="space-y-2">
                {todayCheckins.map((ci, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-brewery-700/20 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-brewery-200">{ci.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <TierBadge tier={ci.tier} />
                        <span className="text-[10px] text-brewery-500 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />{ci.time}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400">+{ci.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: Leaderboard ─── */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['Bronze', 'Silver', 'Gold', 'Platinum'] as const).map(tier => {
              const cfg = TIER_CONFIG[tier];
              const Icon = cfg.icon;
              return (
                <div key={tier} className={`bg-gradient-to-br ${cfg.gradient} border ${cfg.border} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                    <span className={`text-xs font-semibold ${cfg.color}`}>{tier}</span>
                  </div>
                  <p className="text-2xl font-bold text-brewery-50">{tierCounts[tier] ?? 0}</p>
                  <p className="text-[10px] text-brewery-500">members</p>
                </div>
              );
            })}
          </div>

          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-brewery-700/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-brewery-200">Top Members by Points</h3>
              <Badge variant="amber">{leaderboard.length} shown</Badge>
            </div>
            <div className="divide-y divide-brewery-700/20">
              {leaderboard.map((c, rank) => {
                const cfg = TIER_CONFIG[c.loyaltyTier] ?? TIER_CONFIG.Bronze;
                const Icon = cfg.icon;
                return (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-brewery-800/30 transition-colors">
                    <span className={`text-sm font-bold w-6 text-center ${
                      rank === 0 ? 'text-yellow-400' : rank === 1 ? 'text-slate-300' : rank === 2 ? 'text-amber-700' : 'text-brewery-500'
                    }`}>
                      {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
                    </span>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brewery-100">{c.firstName} {c.lastName}</p>
                      <p className="text-[10px] text-brewery-400">{c.totalVisits} visits · {c.loyaltyTier}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-400">{c.loyaltyPoints.toLocaleString()}</p>
                      <p className="text-[10px] text-brewery-500">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: Redeem Rewards ─── */}
      {activeTab === 'rewards' && (
        <div className="space-y-5">
          {/* Customer selector */}
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-3">Select Customer to Redeem</h3>
            <CheckInSearch
              customers={customers}
              onCheckIn={(c) => setRedeemCustomer(c)}
            />
            {redeemCustomer && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-brewery-800/40 rounded-lg">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${TIER_CONFIG[redeemCustomer.loyaltyTier]?.bg ?? 'bg-amber-900/20'}`}>
                  {(() => { const Icon = TIER_CONFIG[redeemCustomer.loyaltyTier]?.icon ?? Shield; return <Icon className={`w-4 h-4 ${TIER_CONFIG[redeemCustomer.loyaltyTier]?.color ?? 'text-amber-700'}`} />; })()}
                </div>
                <div>
                  <p className="text-sm font-medium text-brewery-100">{redeemCustomer.firstName} {redeemCustomer.lastName}</p>
                  <p className="text-xs text-amber-400 font-semibold">{redeemCustomer.loyaltyPoints.toLocaleString()} points available</p>
                </div>
                <button onClick={() => setRedeemCustomer(null)} className="ml-auto text-xs text-brewery-500 hover:text-brewery-300">Clear</button>
              </div>
            )}
          </div>

          {/* Rewards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REWARDS.map(reward => {
              const canAfford = redeemCustomer ? redeemCustomer.loyaltyPoints >= reward.cost : true;
              return (
                <div
                  key={reward.id}
                  className={`bg-brewery-900/80 border rounded-xl p-4 transition-all ${
                    !redeemCustomer ? 'border-brewery-700/30' :
                    canAfford ? 'border-amber-500/20 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer' :
                    'border-brewery-700/20 opacity-50'
                  }`}
                  onClick={() => redeemCustomer && canAfford && handleRedeem(redeemCustomer, reward)}
                >
                  <div className="text-3xl mb-2">{reward.icon}</div>
                  <h4 className="text-sm font-semibold text-brewery-100 mb-0.5">{reward.name}</h4>
                  <p className="text-[10px] text-brewery-400 mb-3">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${canAfford || !redeemCustomer ? 'text-amber-400' : 'text-brewery-600'}`}>
                      {reward.cost.toLocaleString()} pts
                    </span>
                    <Badge variant="gray">{reward.category}</Badge>
                  </div>
                  {redeemCustomer && canAfford && (
                    <button className="w-full mt-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold transition-all">
                      Redeem
                    </button>
                  )}
                  {redeemCustomer && !canAfford && (
                    <p className="mt-3 text-[10px] text-brewery-600 text-center">
                      {(reward.cost - redeemCustomer.loyaltyPoints).toLocaleString()} more pts needed
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB: Tier Overview ─── */}
      {activeTab === 'tiers' && (
        <div className="space-y-4">
          {(['Bronze', 'Silver', 'Gold', 'Platinum'] as const).map(tier => {
            const cfg = TIER_CONFIG[tier];
            const Icon = cfg.icon;
            const tierMembers = customers.filter(c => c.loyaltyTier === tier);
            const avgPoints = tierMembers.length > 0
              ? Math.round(tierMembers.reduce((s, c) => s + c.loyaltyPoints, 0) / tierMembers.length)
              : 0;

            return (
              <div key={tier} className={`bg-gradient-to-br ${cfg.gradient} border ${cfg.border} rounded-xl p-5`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <h3 className={`text-base font-bold ${cfg.color}`}>{tier}</h3>
                      <p className="text-xs text-brewery-400">
                        {tier === 'Platinum' ? '2,500+ points' : `${cfg.min.toLocaleString()} – ${cfg.max.toLocaleString()} points`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brewery-100">{tierMembers.length}</p>
                    <p className="text-[10px] text-brewery-500">members</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-brewery-900/40 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-brewery-100">{cfg.pointsPerVisit}</p>
                    <p className="text-[10px] text-brewery-500">pts/visit</p>
                  </div>
                  <div className="bg-brewery-900/40 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-brewery-100">{avgPoints.toLocaleString()}</p>
                    <p className="text-[10px] text-brewery-500">avg pts</p>
                  </div>
                  <div className="bg-brewery-900/40 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-brewery-100">
                      {tierMembers.length > 0 ? Math.round(tierMembers.reduce((s, c) => s + c.totalVisits, 0) / tierMembers.length) : 0}
                    </p>
                    <p className="text-[10px] text-brewery-500">avg visits</p>
                  </div>
                  <div className="bg-brewery-900/40 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-emerald-400">
                      ${tierMembers.length > 0 ? Math.round(tierMembers.reduce((s, c) => s + c.totalSpent, 0) / tierMembers.length).toLocaleString() : 0}
                    </p>
                    <p className="text-[10px] text-brewery-500">avg spend</p>
                  </div>
                </div>

                {/* Perks */}
                <div>
                  <p className="text-[10px] font-semibold text-brewery-400 uppercase tracking-wider mb-2">Tier Perks</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      tier === 'Bronze' && 'Early event notifications',
                      tier === 'Bronze' && '10 pts/visit',
                      tier !== 'Bronze' && '15+ pts/visit',
                      tier === 'Silver' && 'Birthday free pint',
                      tier === 'Silver' && 'Monthly exclusive offer',
                      tier === 'Gold' && 'Free growler on join',
                      tier === 'Gold' && 'VIP event access',
                      tier === 'Gold' && 'Priority reservations',
                      tier === 'Platinum' && 'All Gold perks',
                      tier === 'Platinum' && 'Free merch quarterly',
                      tier === 'Platinum' && 'Brewer meet & greet',
                      tier === 'Platinum' && 'Personalized beer recommendations',
                    ].filter(Boolean).map(perk => perk && (
                      <span key={perk} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        <ChevronRight className="w-2.5 h-2.5" />{perk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Flame icon for active day indicator */}
      {todayCheckins.length >= 5 && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-amber-600/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-full shadow-xl shadow-amber-600/30 text-xs font-semibold">
          <Flame className="w-4 h-4" />
          {todayCheckins.length} check-ins today!
        </div>
      )}
    </div>
  );
}
