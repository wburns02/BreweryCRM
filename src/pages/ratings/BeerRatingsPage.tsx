import { useState, useMemo } from 'react';
import {
  Star, Plus, TrendingUp, Award, BarChart3, MessageSquare,
  Filter, X, ChevronDown, Trash2, Download,
  Users, Check,
} from 'lucide-react';
import { useBrewery } from '../../context/BreweryContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../components/ui/ToastProvider';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import type { BeerRating } from '../../types';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const CHANNELS = [
  { value: 'in-person', label: 'In Person', icon: '🍺', color: 'text-amber-400' },
  { value: 'untappd', label: 'Untappd', icon: '📱', color: 'text-yellow-400' },
  { value: 'google', label: 'Google', icon: '🔍', color: 'text-blue-400' },
  { value: 'yelp', label: 'Yelp', icon: '⭐', color: 'text-red-400' },
  { value: 'facebook', label: 'Facebook', icon: '👍', color: 'text-indigo-400' },
] as const;

const CHANNEL_MAP = Object.fromEntries(CHANNELS.map(c => [c.value, c]));

// ─── STAR RATING DISPLAY ─────────────────────────────────────────────────────

function Stars({ value, size = 'sm', interactive = false, onChange }: {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'w-7 h-7' : size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  const display = hovered || value;
  return (
    <div className={`flex items-center gap-0.5 ${interactive ? 'cursor-pointer' : ''}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${sz} transition-all ${
            i <= display
              ? 'fill-amber-400 text-amber-400'
              : 'text-brewery-700 fill-brewery-800/60'
          } ${interactive ? 'hover:scale-110' : ''}`}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(i)}
        />
      ))}
    </div>
  );
}

// ─── BEER LEADERBOARD ROW ────────────────────────────────────────────────────

type BeerStats = {
  beerId: string;
  beerName: string;
  beerStyle: string;
  avgRating: number;
  totalRatings: number;
  fiveStars: number;
  fourStars: number;
  threeOrLess: number;
  recentReviews: BeerRating[];
};

function BeerLeaderboardRow({ stats, rank, onClick }: { stats: BeerStats; rank: number; onClick: () => void }) {
  const fivePct = stats.totalRatings > 0 ? (stats.fiveStars / stats.totalRatings) * 100 : 0;
  const fourPct = stats.totalRatings > 0 ? (stats.fourStars / stats.totalRatings) * 100 : 0;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 text-left hover:bg-brewery-800/20 transition-colors rounded-xl border border-transparent hover:border-brewery-700/20"
    >
      {/* Rank badge */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
        rank === 1 ? 'bg-amber-500 text-black' :
        rank === 2 ? 'bg-slate-400 text-black' :
        rank === 3 ? 'bg-amber-700/80 text-white' :
        'bg-brewery-700/50 text-brewery-400'
      }`}>
        {rank === 1 ? <Award className="w-4 h-4" /> : rank}
      </div>

      {/* Beer info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-bold text-brewery-100 truncate">{stats.beerName}</h3>
          <span className="text-[10px] text-brewery-500 hidden sm:block">{stats.beerStyle}</span>
        </div>
        {/* Rating bar */}
        <div className="flex items-center gap-2">
          <Stars value={Math.round(stats.avgRating)} />
          <span className="text-xs font-bold text-amber-400">{stats.avgRating.toFixed(2)}</span>
          <span className="text-[10px] text-brewery-500">({stats.totalRatings} {stats.totalRatings === 1 ? 'rating' : 'ratings'})</span>
        </div>
        {/* Distribution mini bar */}
        <div className="flex items-center gap-0.5 mt-1.5">
          <div className="h-1.5 rounded-full bg-amber-500 transition-all" style={{ width: `${fivePct}%`, minWidth: fivePct > 0 ? 4 : 0 }} title={`${stats.fiveStars} × 5★`} />
          <div className="h-1.5 rounded-full bg-amber-400/60 transition-all" style={{ width: `${fourPct}%`, minWidth: fourPct > 0 ? 4 : 0 }} title={`${stats.fourStars} × 4★`} />
          <div className="h-1.5 rounded-full bg-brewery-600/40 flex-1 rounded-r-full" />
        </div>
      </div>

      {/* Right stat */}
      <div className="flex-shrink-0 text-right hidden sm:block">
        <p className="text-xs text-brewery-500">5★ rate</p>
        <p className="text-sm font-bold text-emerald-400">{fivePct.toFixed(0)}%</p>
      </div>

      <ChevronDown className="w-4 h-4 text-brewery-500 flex-shrink-0" />
    </button>
  );
}

// ─── RATING CARD ─────────────────────────────────────────────────────────────

function RatingCard({ rating, onDelete }: { rating: BeerRating; onDelete: () => void }) {
  const ch = CHANNEL_MAP[rating.channel];
  return (
    <div className="bg-brewery-900/60 border border-brewery-700/30 rounded-xl p-4 hover:border-brewery-600/30 transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-bold text-brewery-100">{rating.customerName}</span>
            {rating.mugClubMember && (
              <Badge variant="amber">Mug Club</Badge>
            )}
            {rating.verified && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400">
                <Check className="w-2.5 h-2.5" />Verified
              </span>
            )}
          </div>
          <p className="text-xs text-brewery-400 truncate">{rating.beerName} · <span className={ch?.color ?? 'text-brewery-400'}>{ch?.icon} {ch?.label}</span></p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-brewery-600">{rating.date}</span>
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-brewery-600 hover:text-red-400 hover:bg-red-900/20 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <Stars value={rating.stars} size="sm" />

      {rating.notes && (
        <p className="text-xs text-brewery-300 mt-2 italic line-clamp-3 leading-relaxed">"{rating.notes}"</p>
      )}
    </div>
  );
}

// ─── ADD RATING MODAL ────────────────────────────────────────────────────────

function AddRatingModal({ open, onClose, beers, onSave }: {
  open: boolean;
  onClose: () => void;
  beers: { id: string; name: string; style: string }[];
  onSave: (r: Omit<BeerRating, 'id'>) => void;
}) {
  const [beerId, setBeerId] = useState(beers[0]?.id ?? '');
  const [customerName, setCustomerName] = useState('');
  const [stars, setStars] = useState(5);
  const [notes, setNotes] = useState('');
  const [channel, setChannel] = useState<BeerRating['channel']>('in-person');
  const [mugClub, setMugClub] = useState(false);

  const selectedBeer = beers.find(b => b.id === beerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !beerId || stars < 1) return;
    onSave({
      beerId,
      beerName: selectedBeer?.name ?? '',
      beerStyle: selectedBeer?.style ?? '',
      customerName: customerName.trim(),
      stars,
      notes: notes.trim(),
      channel,
      date: new Date().toISOString().split('T')[0],
      mugClubMember: mugClub,
      verified: channel === 'in-person',
    });
    setCustomerName('');
    setNotes('');
    setStars(5);
    setChannel('in-person');
    setMugClub(false);
  };

  const inputCls = 'w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30';

  return (
    <Modal open={open} onClose={onClose} title="Log Customer Rating">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Beer selector */}
        <div>
          <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Beer</label>
          <select value={beerId} onChange={e => setBeerId(e.target.value)} className={inputCls} required>
            {beers.map(b => (
              <option key={b.id} value={b.id}>{b.name} — {b.style}</option>
            ))}
          </select>
        </div>

        {/* Customer name */}
        <div>
          <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Customer Name</label>
          <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
            placeholder="e.g. Jane Smith" required className={inputCls} />
        </div>

        {/* Stars */}
        <div>
          <label className="block text-xs font-semibold text-brewery-300 mb-2">Rating</label>
          <div className="flex items-center gap-3">
            <Stars value={stars} size="lg" interactive onChange={setStars} />
            <span className="text-lg font-bold text-amber-400">{stars}/5</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Customer Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="What did the customer say about this beer?"
            className={`${inputCls} resize-none`} />
        </div>

        {/* Channel */}
        <div>
          <label className="block text-xs font-semibold text-brewery-300 mb-2">Source</label>
          <div className="grid grid-cols-3 gap-2">
            {CHANNELS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setChannel(c.value)}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  channel === c.value
                    ? 'bg-amber-600/20 border-amber-500/40 text-amber-300'
                    : 'bg-brewery-800/40 border-brewery-700/30 text-brewery-400 hover:text-brewery-200'
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mug Club toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setMugClub(!mugClub)}
            className={`w-10 h-6 rounded-full relative transition-colors ${mugClub ? 'bg-amber-600' : 'bg-brewery-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${mugClub ? 'left-5' : 'left-1'}`} />
          </div>
          <span className="text-sm text-brewery-300">Mug Club Member</span>
        </label>

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-brewery-300 hover:text-brewery-100 transition-colors">Cancel</button>
          <button type="submit"
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow-lg shadow-amber-600/20 transition-colors flex items-center gap-2">
            <Star className="w-4 h-4 fill-white" /> Log Rating
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function BeerRatingsPage() {
  const { beerRatings, addBeerRating, deleteBeerRating } = useBrewery();
  const { beers } = useData();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'feed' | 'insights'>('leaderboard');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterStars, setFilterStars] = useState<number>(0);
  const [filterBeer, setFilterBeer] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedBeer, setExpandedBeer] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'count' | 'recent'>('rating');

  // Compute beer stats
  const beerStats = useMemo((): BeerStats[] => {
    const map: Record<string, BeerRating[]> = {};
    for (const r of beerRatings) {
      if (!map[r.beerId]) map[r.beerId] = [];
      map[r.beerId].push(r);
    }
    return Object.entries(map).map(([beerId, ratings]) => {
      const avgRating = ratings.reduce((s, r) => s + r.stars, 0) / ratings.length;
      const sorted = [...ratings].sort((a, b) => b.date.localeCompare(a.date));
      return {
        beerId,
        beerName: ratings[0].beerName,
        beerStyle: ratings[0].beerStyle,
        avgRating: Math.round(avgRating * 100) / 100,
        totalRatings: ratings.length,
        fiveStars: ratings.filter(r => r.stars === 5).length,
        fourStars: ratings.filter(r => r.stars === 4).length,
        threeOrLess: ratings.filter(r => r.stars <= 3).length,
        recentReviews: sorted.slice(0, 3),
      };
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.avgRating !== a.avgRating ? b.avgRating - a.avgRating : b.totalRatings - a.totalRatings;
      if (sortBy === 'count') return b.totalRatings - a.totalRatings;
      // recent
      const aLatest = a.recentReviews[0]?.date ?? '';
      const bLatest = b.recentReviews[0]?.date ?? '';
      return bLatest.localeCompare(aLatest);
    });
  }, [beerRatings, sortBy]);

  // Filtered ratings for feed
  const filteredRatings = useMemo(() => {
    return beerRatings.filter(r => {
      if (filterChannel !== 'all' && r.channel !== filterChannel) return false;
      if (filterStars > 0 && r.stars !== filterStars) return false;
      if (filterBeer !== 'all' && r.beerId !== filterBeer) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [beerRatings, filterChannel, filterStars, filterBeer]);

  // KPI computations
  const avgOverall = beerRatings.length > 0
    ? beerRatings.reduce((s, r) => s + r.stars, 0) / beerRatings.length
    : 0;
  const pctFive = beerRatings.length > 0
    ? Math.round((beerRatings.filter(r => r.stars === 5).length / beerRatings.length) * 100)
    : 0;
  const totalReviewers = new Set(beerRatings.map(r => r.customerName)).size;
  const mugClubRatings = beerRatings.filter(r => r.mugClubMember);
  const mugAvg = mugClubRatings.length > 0
    ? mugClubRatings.reduce((s, r) => s + r.stars, 0) / mugClubRatings.length
    : 0;

  // Channel breakdown for insights
  const channelBreakdown = CHANNELS.map(c => ({
    ...c,
    count: beerRatings.filter(r => r.channel === c.value).length,
    avg: (() => {
      const ch = beerRatings.filter(r => r.channel === c.value);
      return ch.length > 0 ? ch.reduce((s, r) => s + r.stars, 0) / ch.length : 0;
    })(),
  })).sort((a, b) => b.count - a.count);

  // Hidden gems: high rating, low count (< 5 ratings, avg ≥ 4.5)
  const hiddenGems = beerStats.filter(b => b.avgRating >= 4.5 && b.totalRatings < 5);

  const exportCSV = () => {
    const headers = ['Beer', 'Style', 'Customer', 'Stars', 'Channel', 'Date', 'Notes', 'Mug Club', 'Verified'];
    const rows = beerRatings.map(r => [
      r.beerName, r.beerStyle, r.customerName, r.stars, r.channel, r.date,
      `"${r.notes.replace(/"/g, '""')}"`, r.mugClubMember ? 'Yes' : 'No', r.verified ? 'Yes' : 'No',
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `beer-ratings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast('success', 'Ratings exported to CSV');
  };

  const rateableBEers = beers.length > 0
    ? beers.map(b => ({ id: b.id, name: b.name, style: b.style }))
    : [
        { id: '1', name: 'Texas Sunset IPA', style: 'West Coast IPA' },
        { id: '2', name: 'Hill Country Haze', style: 'NEIPA' },
        { id: '3', name: 'Lone Star Lager', style: 'American Lager' },
        { id: '4', name: 'Pedernales Porter', style: 'Robust Porter' },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h1 className="text-xl font-bold text-brewery-50" style={{ fontFamily: 'var(--font-display)' }}>
              Beer Ratings
            </h1>
          </div>
          <p className="text-sm text-brewery-400">
            Customer feedback across all channels · Track what's winning hearts · Drive tap rotation decisions
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-brewery-800/50 border border-brewery-700/30 rounded-lg text-sm text-brewery-300 hover:text-brewery-100 transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-amber-600/20 transition-all active:scale-[0.97]"
          >
            <Plus className="w-4 h-4" /> Log Rating
          </button>
        </div>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" />Overall Rating
          </p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-amber-400">{avgOverall.toFixed(2)}</p>
            <p className="text-xs text-brewery-500 mb-0.5">/ 5.0</p>
          </div>
          <Stars value={Math.round(avgOverall)} size="sm" />
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />Total Ratings
          </p>
          <p className="text-2xl font-bold text-brewery-100">{beerRatings.length}</p>
          <p className="text-xs text-brewery-500">{pctFive}% five-star</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />Unique Raters
          </p>
          <p className="text-2xl font-bold text-emerald-400">{totalReviewers}</p>
          <p className="text-xs text-brewery-500">across {beerStats.length} beers</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />Mug Club Avg
          </p>
          <p className="text-2xl font-bold text-purple-400">{mugAvg.toFixed(2)}</p>
          <p className="text-xs text-brewery-500">{mugClubRatings.length} club ratings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brewery-700/30 overflow-x-auto scrollbar-none">
        {[
          { id: 'leaderboard' as const, label: 'Leaderboard', icon: TrendingUp },
          { id: 'feed' as const, label: 'Rating Feed', icon: MessageSquare },
          { id: 'insights' as const, label: 'Insights', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── LEADERBOARD TAB ── */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-brewery-500">Sort:</span>
            {[
              { key: 'rating', label: 'Highest Rated' },
              { key: 'count', label: 'Most Reviewed' },
              { key: 'recent', label: 'Most Recent' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key as typeof sortBy)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  sortBy === s.key
                    ? 'bg-amber-600/20 text-amber-300 border-amber-500/30'
                    : 'bg-brewery-800/40 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {beerStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-brewery-500">
              <Star className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium text-brewery-400">No ratings yet</p>
              <p className="text-sm">Log your first rating to start the leaderboard</p>
            </div>
          ) : (
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
              <div className="divide-y divide-brewery-700/20 p-2">
                {beerStats.map((stats, i) => (
                  <div key={stats.beerId}>
                    <BeerLeaderboardRow
                      stats={stats}
                      rank={i + 1}
                      onClick={() => setExpandedBeer(expandedBeer === stats.beerId ? null : stats.beerId)}
                    />
                    {expandedBeer === stats.beerId && (
                      <div className="pb-4 px-4">
                        {/* Rating distribution */}
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Rating Distribution</h4>
                          <div className="space-y-1">
                            {[5, 4, 3, 2, 1].map(star => {
                              const count = beerRatings.filter(r => r.beerId === stats.beerId && r.stars === star).length;
                              const pct = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
                              return (
                                <div key={star} className="flex items-center gap-2">
                                  <span className="text-[10px] text-brewery-500 w-4 text-right">{star}★</span>
                                  <div className="flex-1 h-2 rounded-full bg-brewery-800 overflow-hidden">
                                    <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-[10px] text-brewery-400 w-8">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        {/* Recent reviews */}
                        <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Recent Reviews</h4>
                        <div className="space-y-2">
                          {stats.recentReviews.map(r => (
                            <div key={r.id} className="p-2.5 rounded-lg bg-brewery-800/40 border border-brewery-700/20">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-brewery-200">{r.customerName}</span>
                                <div className="flex items-center gap-2">
                                  <Stars value={r.stars} size="sm" />
                                  <span className="text-[10px] text-brewery-600">{r.date}</span>
                                </div>
                              </div>
                              {r.notes && <p className="text-[11px] text-brewery-400 italic">"{r.notes}"</p>}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => { setFilterBeer(stats.beerId); setActiveTab('feed'); setExpandedBeer(null); }}
                          className="mt-2 text-[11px] text-amber-400 hover:underline"
                        >
                          See all {stats.totalRatings} reviews →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FEED TAB ── */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-brewery-500 flex-shrink-0" />

            {/* Beer filter */}
            <select
              value={filterBeer}
              onChange={e => setFilterBeer(e.target.value)}
              className="bg-brewery-800/50 border border-brewery-700/30 rounded-lg px-2 py-1.5 text-xs text-brewery-200 focus:outline-none focus:border-amber-500/40"
            >
              <option value="all">All Beers</option>
              {beerStats.map(b => (
                <option key={b.beerId} value={b.beerId}>{b.beerName}</option>
              ))}
            </select>

            {/* Channel filter */}
            <select
              value={filterChannel}
              onChange={e => setFilterChannel(e.target.value)}
              className="bg-brewery-800/50 border border-brewery-700/30 rounded-lg px-2 py-1.5 text-xs text-brewery-200 focus:outline-none focus:border-amber-500/40"
            >
              <option value="all">All Channels</option>
              {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>

            {/* Star filter */}
            <div className="flex gap-1">
              {[0, 5, 4, 3, 2, 1].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStars(s)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                    filterStars === s
                      ? 'bg-amber-600/20 text-amber-300 border-amber-500/30'
                      : 'bg-brewery-800/40 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'
                  }`}
                >
                  {s === 0 ? 'All ★' : `${s}★`}
                </button>
              ))}
            </div>

            {(filterBeer !== 'all' || filterChannel !== 'all' || filterStars > 0) && (
              <button
                onClick={() => { setFilterBeer('all'); setFilterChannel('all'); setFilterStars(0); }}
                className="flex items-center gap-1 text-xs text-brewery-400 hover:text-brewery-200 transition-colors"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}

            <span className="text-xs text-brewery-500 ml-auto">{filteredRatings.length} ratings</span>
          </div>

          {filteredRatings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-brewery-500">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium text-brewery-400">No ratings match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredRatings.map(r => (
                <RatingCard
                  key={r.id}
                  rating={r}
                  onDelete={() => {
                    deleteBeerRating(r.id);
                    toast('success', 'Rating removed');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── INSIGHTS TAB ── */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Channel performance */}
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Ratings by Channel
            </h3>
            <div className="space-y-3">
              {channelBreakdown.map(c => {
                const maxCount = Math.max(...channelBreakdown.map(x => x.count), 1);
                return (
                  <div key={c.value}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${c.color}`}>{c.icon} {c.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-brewery-500">{c.count} ratings</span>
                        {c.count > 0 && (
                          <div className="flex items-center gap-0.5">
                            <Stars value={Math.round(c.avg)} size="sm" />
                            <span className="text-[10px] text-amber-400 ml-1">{c.avg.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-5 bg-brewery-800/60 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${(c.count / maxCount) * 100}%` }}
                      >
                        {c.count > 0 && c.count / maxCount > 0.3 && (
                          <span className="text-[10px] font-bold text-black">{c.count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Star distribution */}
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4">Overall Star Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = beerRatings.filter(r => r.stars === star).length;
                const pct = beerRatings.length > 0 ? (count / beerRatings.length) * 100 : 0;
                const color = star >= 4 ? 'bg-amber-500' : star === 3 ? 'bg-amber-400/50' : 'bg-red-500/60';
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs text-brewery-400 w-12 text-right">{star} stars</span>
                    <div className="flex-1 h-6 bg-brewery-800/60 rounded-lg overflow-hidden">
                      <div className={`h-full rounded-lg ${color} flex items-center justify-end pr-3 transition-all`}
                        style={{ width: `${pct}%` }}>
                        {pct > 10 && <span className="text-[10px] font-bold text-black">{pct.toFixed(0)}%</span>}
                      </div>
                    </div>
                    <span className="text-xs text-brewery-400 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hidden gems */}
          {hiddenGems.length > 0 && (
            <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Hidden Gems — High Rating, Low Visibility
              </h3>
              <p className="text-xs text-emerald-400/70 mb-4">These beers score 4.5+ stars but have fewer than 5 ratings. Push them harder on your tap menu and social channels.</p>
              <div className="space-y-2">
                {hiddenGems.map(gem => (
                  <div key={gem.beerId} className="flex items-center justify-between p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/20">
                    <div>
                      <p className="text-sm font-semibold text-brewery-100">{gem.beerName}</p>
                      <p className="text-xs text-brewery-400">{gem.beerStyle}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Stars value={Math.round(gem.avgRating)} />
                        <span className="text-xs font-bold text-emerald-400">{gem.avgRating.toFixed(1)}</span>
                      </div>
                      <p className="text-[10px] text-brewery-500">only {gem.totalRatings} rating{gem.totalRatings > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 text-center">
              <p className="text-xs text-brewery-400 mb-1">Verified In-Person</p>
              <p className="text-2xl font-bold text-brewery-100">{beerRatings.filter(r => r.verified).length}</p>
              <p className="text-xs text-brewery-500">{Math.round((beerRatings.filter(r => r.verified).length / Math.max(1, beerRatings.length)) * 100)}% of all</p>
            </div>
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 text-center">
              <p className="text-xs text-brewery-400 mb-1">Mug Club Ratings</p>
              <p className="text-2xl font-bold text-amber-400">{mugClubRatings.length}</p>
              <p className="text-xs text-brewery-500">avg {mugAvg.toFixed(1)}★</p>
            </div>
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 text-center">
              <p className="text-xs text-brewery-400 mb-1">Most Rated Beer</p>
              <p className="text-sm font-bold text-brewery-100 truncate">{beerStats[0]?.beerName ?? '—'}</p>
              <p className="text-xs text-brewery-500">{beerStats[0]?.totalRatings ?? 0} reviews</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Rating Modal */}
      <AddRatingModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        beers={rateableBEers}
        onSave={(r) => {
          addBeerRating(r);
          toast('success', `Rating logged for ${r.beerName} — ${r.stars}★`);
          setShowAddModal(false);
        }}
      />
    </div>
  );
}
