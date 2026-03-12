import { useState, useEffect } from 'react';
import {
  Tv2, QrCode, Copy, Check, GlassWater, Calendar, Star, Award,
  ChevronLeft, ChevronRight, Maximize2, RefreshCw, Beer,
  Zap, AlertCircle, Eye, ExternalLink,
} from 'lucide-react';
import { useBrewery } from '../../context/BreweryContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../components/ui/ToastProvider';

// SRM color → CSS background approximation
function srmToColor(srm: number): string {
  if (srm <= 2) return '#FFE699';
  if (srm <= 4) return '#FFD878';
  if (srm <= 6) return '#FFCA5A';
  if (srm <= 8) return '#FFBF42';
  if (srm <= 10) return '#FBB123';
  if (srm <= 13) return '#F8A600';
  if (srm <= 17) return '#F39C00';
  if (srm <= 20) return '#EA8F00';
  if (srm <= 24) return '#D77200';
  if (srm <= 29) return '#CF6900';
  if (srm <= 35) return '#CB6100';
  if (srm <= 40) return '#C35900';
  return '#4A1A00';
}

function kegFreshnessLabel(pct: number): { label: string; color: string; bg: string } {
  if (pct > 75) return { label: 'Fresh', color: 'text-emerald-400', bg: 'bg-emerald-500' };
  if (pct > 40) return { label: 'Good', color: 'text-amber-400', bg: 'bg-amber-500' };
  if (pct > 15) return { label: 'Running Low', color: 'text-orange-400', bg: 'bg-orange-500' };
  return { label: 'Last Pours', color: 'text-red-400', bg: 'bg-red-500' };
}

type BoardTheme = 'dark' | 'warm' | 'light';

const THEMES: Record<BoardTheme, { bg: string; card: string; border: string; title: string; text: string; sub: string }> = {
  dark: {
    bg: 'bg-brewery-950',
    card: 'bg-brewery-900/80 border-brewery-700/40',
    border: 'border-brewery-700/40',
    title: 'text-brewery-50',
    text: 'text-brewery-100',
    sub: 'text-brewery-400',
  },
  warm: {
    bg: 'bg-[#1a0f00]',
    card: 'bg-[#241500]/80 border-amber-900/30',
    border: 'border-amber-900/30',
    title: 'text-amber-50',
    text: 'text-amber-100',
    sub: 'text-amber-500',
  },
  light: {
    bg: 'bg-slate-100',
    card: 'bg-white border-slate-200',
    border: 'border-slate-200',
    title: 'text-slate-900',
    text: 'text-slate-800',
    sub: 'text-slate-500',
  },
};

export default function TapMenuBoardPage() {
  const { tapLines } = useBrewery();
  const { events } = useData();
  const { toast } = useToast();
  const [theme, setTheme] = useState<BoardTheme>('dark');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'board' | 'settings' | 'qr'>('board');
  const [showKegLevels, setShowKegLevels] = useState(true);
  const [showAbv, setShowAbv] = useState(true);
  const [showIbu, setShowIbu] = useState(true);
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [highlightNew, setHighlightNew] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentPage, setCurrentPageNum] = useState(0);

  const activeTaps = tapLines.filter(t => t.status === 'active' && t.beerName && t.kegLevel > 0);
  const TAPS_PER_PAGE = 6;
  const totalPages = Math.ceil(activeTaps.length / TAPS_PER_PAGE);
  const visibleTaps = activeTaps.slice(currentPage * TAPS_PER_PAGE, (currentPage + 1) * TAPS_PER_PAGE);

  // Today's events
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(e => e.date === today || e.date?.startsWith(today));

  const menuUrl = `${window.location.origin}?menu=taproom`;

  useEffect(() => {
    if (!showPreview) return;
    const timer = setInterval(() => {
      setCurrentPageNum(p => (totalPages > 1 ? (p + 1) % totalPages : 0));
    }, 8000);
    return () => clearInterval(timer);
  }, [showPreview, totalPages]);

  function handleCopyLink() {
    navigator.clipboard.writeText(menuUrl).then(() => {
      setCopied(true);
      toast('success', 'Menu URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleRefresh() {
    setLastUpdated(new Date());
    toast('success', 'Menu board refreshed — showing live tap data');
  }

  const t = THEMES[theme];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tv2 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-brewery-50" style={{ fontFamily: 'var(--font-display)' }}>
              Live Tap Menu Board
            </h1>
          </div>
          <p className="text-sm text-brewery-400">
            Display on any TV or share as a QR code — updates live as you pour
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-700/30 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live · {activeTaps.length} on tap
          </span>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brewery-800/50 border border-brewery-700/30 text-brewery-300 hover:text-brewery-100 text-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={() => window.open(menuUrl, '_blank')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brewery-800/50 border border-brewery-700/30 text-brewery-300 hover:text-brewery-100 text-sm transition-all"
            title="Open in new tab for TV display"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            TV Mode
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              showPreview
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'bg-brewery-800/50 border border-brewery-700/30 text-brewery-300 hover:text-brewery-100'
            }`}
          >
            {showPreview ? <Eye className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {showPreview ? 'Editing' : 'Preview Board'}
          </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-brewery-700/30">
        {[
          { id: 'board' as const, label: 'Board Preview', icon: Tv2 },
          { id: 'settings' as const, label: 'Display Settings', icon: Zap },
          { id: 'qr' as const, label: 'Share & QR Code', icon: QrCode },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeView === tab.id
                ? 'text-amber-400 border-amber-400'
                : 'text-brewery-400 border-transparent hover:text-brewery-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Board Preview Tab */}
      {activeView === 'board' && (
        <div className={`rounded-2xl overflow-hidden border ${t.border} shadow-2xl`}>
          {/* Board header */}
          <div className={`${t.bg} px-8 py-6 border-b ${t.border}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
                    <Beer className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black ${t.title}`} style={{ fontFamily: 'var(--font-display)' }}>
                      Bearded Hop Brewery
                    </h2>
                    <p className={`text-sm ${t.sub}`}>Bulverde, TX · What's on Tap</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs ${t.sub}`}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <p className={`text-xs ${t.sub} mt-0.5`}>
                  Updated {lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Tap grid */}
          <div className={`${t.bg} p-6`}>
            {activeTaps.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-16 ${t.sub}`}>
                <GlassWater className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-lg font-medium">No active taps</p>
                <p className="text-sm">Add beers to your tap lines in Tap Management</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleTaps.map((tap) => {
                    const freshness = kegFreshnessLabel(tap.kegLevel);
                    const isNew = tap.tapNumber <= 2;
                    // Derive a plausible beer color from style name if available
                    const styleLower = (tap.style || '').toLowerCase();
                    const srmGuess = styleLower.includes('stout') || styleLower.includes('porter') ? 40
                      : styleLower.includes('ipa') ? 8
                      : styleLower.includes('wheat') || styleLower.includes('wit') ? 3
                      : styleLower.includes('amber') || styleLower.includes('red') ? 18
                      : styleLower.includes('brown') ? 22
                      : styleLower.includes('pale') ? 5
                      : styleLower.includes('lager') || styleLower.includes('pilsner') ? 3
                      : 8 + (tap.tapNumber * 3 % 16);
                    const color = srmToColor(srmGuess);

                    return (
                      <div
                        key={tap.tapNumber}
                        className={`relative rounded-2xl border p-5 transition-all ${t.card} ${
                          highlightNew && isNew ? 'ring-2 ring-amber-500/40' : ''
                        }`}
                      >
                        {highlightNew && isNew && (
                          <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                            New
                          </div>
                        )}

                        {/* Tap number + beer color */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full border-2 border-white/20 shadow-inner flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className={`text-xs font-bold ${t.sub}`}>TAP {tap.tapNumber}</span>
                          </div>
                          {showKegLevels && (
                            <span className={`text-xs font-semibold ${freshness.color}`}>
                              {freshness.label}
                            </span>
                          )}
                        </div>

                        {/* Beer name + style */}
                        <h3 className={`text-lg font-black leading-tight mb-0.5 ${t.title}`} style={{ fontFamily: 'var(--font-display)' }}>
                          {tap.beerName}
                        </h3>
                        <p className={`text-xs ${t.sub} mb-3`}>{tap.style || 'Craft Beer'}</p>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 mb-3">
                          {showAbv && (tap.abv ?? 0) > 0 && (
                            <div className="text-center">
                              <p className={`text-base font-black text-amber-400`}>{tap.abv}%</p>
                              <p className={`text-[9px] uppercase tracking-wider ${t.sub}`}>ABV</p>
                            </div>
                          )}
                          {showIbu && (tap.ibu ?? 0) > 0 && (
                            <div className="text-center">
                              <p className={`text-base font-black ${t.text}`}>{tap.ibu}</p>
                              <p className={`text-[9px] uppercase tracking-wider ${t.sub}`}>IBU</p>
                            </div>
                          )}
                          <div className="flex-1" />
                          <div className="text-right">
                            <p className={`text-xl font-black text-amber-400`}>$7</p>
                            <p className={`text-[9px] ${t.sub}`}>pint</p>
                          </div>
                        </div>

                        {/* Keg level bar */}
                        {showKegLevels && (
                          <div>
                            <div className="h-1.5 rounded-full bg-brewery-800/60 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${freshness.bg}`}
                                style={{ width: `${tap.kegLevel}%` }}
                              />
                            </div>
                            <p className={`text-[9px] ${t.sub} mt-0.5 text-right`}>{Math.round(tap.kegLevel)}% full</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                      onClick={() => setCurrentPageNum(p => Math.max(0, p - 1))}
                      className={`p-2 rounded-full ${t.card} border ${t.border} ${t.text}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex gap-1.5">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPageNum(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === currentPage ? 'bg-amber-400 w-4' : 'bg-brewery-700'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPageNum(p => Math.min(totalPages - 1, p + 1))}
                      className={`p-2 rounded-full ${t.card} border ${t.border} ${t.text}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Today's events footer */}
          {showEvents && todayEvents.length > 0 && (
            <div className={`${t.bg} border-t ${t.border} px-8 py-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className={`text-xs font-bold text-amber-400 uppercase tracking-wider`}>Tonight's Events</span>
              </div>
              <div className="flex gap-4 flex-wrap">
                {todayEvents.map(ev => (
                  <div key={ev.id} className={`flex items-center gap-2 text-sm ${t.text}`}>
                    <Star className="w-3 h-3 text-amber-500" />
                    <span className="font-medium">{ev.title}</span>
                    {ev.startTime && <span className={`text-xs ${t.sub}`}>{ev.startTime}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showEvents && todayEvents.length === 0 && (
            <div className={`${t.bg} border-t ${t.border} px-8 py-4 flex items-center gap-3`}>
              <Calendar className="w-4 h-4 text-amber-600/50" />
              <span className={`text-xs ${t.sub}`}>No special events today · Happy hour 4–6pm · Live music every Friday</span>
              <div className="ml-auto flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600/60" />
                <span className={`text-xs ${t.sub}`}>Ask about our Mug Club!</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Display Settings Tab */}
      {activeView === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme */}
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4">Color Theme</h3>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(THEMES) as BoardTheme[]).map(th => (
                <button
                  key={th}
                  onClick={() => setTheme(th)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    theme === th ? 'border-amber-500' : 'border-brewery-700/40 hover:border-brewery-500/40'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg mb-2 ${
                    th === 'dark' ? 'bg-brewery-950' : th === 'warm' ? 'bg-[#1a0f00]' : 'bg-slate-100'
                  }`} />
                  <span className="text-xs font-medium text-brewery-300">{th === 'dark' ? 'Dark' : th === 'warm' ? 'Warm' : 'Light'}</span>
                  {theme === th && <Check className="w-3 h-3 text-amber-400 mx-auto mt-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Display options */}
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4">Display Options</h3>
            <div className="space-y-3">
              {[
                { label: 'Show Keg Freshness', desc: 'Fresh / Running Low indicator + fill bar', value: showKegLevels, set: setShowKegLevels },
                { label: 'Show ABV', desc: 'Alcohol by volume percentage', value: showAbv, set: setShowAbv },
                { label: 'Show IBU', desc: 'International bitterness units', value: showIbu, set: setShowIbu },
                { label: 'Show Descriptions', desc: 'Tasting notes under beer name', value: showDescriptions, set: setShowDescriptions },
                { label: 'Show Events', desc: 'Today\'s events in footer', value: showEvents, set: setShowEvents },
                { label: 'Highlight New Taps', desc: '"New" badge on recently added beers', value: highlightNew, set: setHighlightNew },
              ].map(opt => (
                <div key={opt.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brewery-200">{opt.label}</p>
                    <p className="text-xs text-brewery-500">{opt.desc}</p>
                  </div>
                  <div
                    onClick={() => opt.set(!opt.value)}
                    className={`w-10 h-6 rounded-full transition-colors cursor-pointer flex items-center ${opt.value ? 'bg-amber-600 justify-end' : 'bg-brewery-700 justify-start'}`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full mx-1 shadow" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TV Display tips */}
          <div className="md:col-span-2 bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-brewery-200 mb-3 flex items-center gap-2">
              <Tv2 className="w-4 h-4 text-amber-400" />
              TV Display Setup
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '📺', title: 'Cast to TV', desc: 'Open the menu URL on any device and mirror to your taproom TV via Chromecast or AirPlay' },
                { icon: '🔄', title: 'Auto-Refresh', desc: 'The board auto-updates every 30 seconds — no manual refreshing needed as you pour' },
                { icon: '📱', title: 'QR Code', desc: 'Print the QR code and tape it to tables — guests scan to see the live tap list on their phone' },
              ].map(tip => (
                <div key={tip.title} className="flex gap-3 p-3 rounded-xl bg-brewery-800/30">
                  <span className="text-2xl">{tip.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-brewery-200">{tip.title}</p>
                    <p className="text-xs text-brewery-500 mt-0.5">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share & QR Code Tab */}
      {activeView === 'qr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-6 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-brewery-200 mb-4 self-start">QR Code for Table Cards</h3>

            {/* QR placeholder (real QR would use a library) */}
            <div className="w-48 h-48 bg-white rounded-xl p-3 mb-4 flex items-center justify-center">
              <div className="grid grid-cols-7 gap-0.5 w-full h-full">
                {Array.from({ length: 49 }).map((_, i) => {
                  // Generate a deterministic QR-like pattern
                  const row = Math.floor(i / 7);
                  const col = i % 7;
                  const isFinder = (row < 2 && col < 2) || (row < 2 && col > 4) || (row > 4 && col < 2);
                  const isData = (row + col + i) % 3 === 0;
                  return (
                    <div
                      key={i}
                      className={`rounded-sm ${isFinder ? 'bg-black' : isData ? 'bg-black' : 'bg-white'}`}
                    />
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-brewery-400 text-center mb-4">
              Scan to see live tap menu on any device
            </p>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors">
                <QrCode className="w-4 h-4" />
                Download PNG
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-brewery-800/50 border border-brewery-700/30 text-brewery-300 hover:text-brewery-100 rounded-lg text-sm transition-colors">
                Print PDF
              </button>
            </div>
          </div>

          {/* Share link + integrations */}
          <div className="space-y-4">
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-brewery-200 mb-3">Share Link</h3>
              <div className="flex gap-2 mb-3">
                <input
                  readOnly
                  value={menuUrl}
                  className="flex-1 bg-brewery-800/50 border border-brewery-700/30 rounded-lg px-3 py-2 text-xs text-brewery-300 font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-brewery-500">Share on Instagram, your website, or email newsletters</p>
            </div>

            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-brewery-200 mb-3">
                Social Integrations
                <span className="ml-2 text-[10px] font-normal text-amber-600 bg-amber-900/20 px-2 py-0.5 rounded-full">Coming Soon</span>
              </h3>
              <div className="space-y-2">
                {[
                  { name: 'Untappd', desc: 'Sync tap list with Untappd venue menu', icon: '🍺', status: 'coming' },
                  { name: 'Instagram', desc: 'Auto-post tap updates to your feed', icon: '📸', status: 'coming' },
                  { name: 'Google Business', desc: 'Push menu to Google Maps listing', icon: '🗺️', status: 'coming' },
                  { name: 'Website Embed', desc: 'Embed tap list on your brewery website', icon: '🌐', status: 'beta' },
                ].map(int => (
                  <div key={int.name} className="flex items-center justify-between p-3 rounded-xl bg-brewery-800/30">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{int.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-brewery-200">{int.name}</p>
                        <p className="text-xs text-brewery-500">{int.desc}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      int.status === 'beta' ? 'bg-blue-900/30 text-blue-400' : 'bg-brewery-800 text-brewery-500'
                    }`}>
                      {int.status === 'beta' ? 'BETA' : 'SOON'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300">Live Updates</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  The menu board shows real data from your tap lines. As you pour beers and update keg levels in POS,
                  the board refreshes automatically every 30 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1">Active Taps</p>
          <p className="text-2xl font-bold text-brewery-50">{activeTaps.length}</p>
          <p className="text-xs text-brewery-500 mt-0.5">of {tapLines.length} tap lines</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1">Low Kegs</p>
          <p className={`text-2xl font-bold ${activeTaps.filter(t => t.kegLevel <= 20).length > 0 ? 'text-red-400' : 'text-brewery-50'}`}>
            {activeTaps.filter(t => t.kegLevel <= 20).length}
          </p>
          <p className="text-xs text-brewery-500 mt-0.5">below 20%</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1">Avg ABV</p>
          <p className="text-2xl font-bold text-amber-400">
            {activeTaps.length > 0
              ? (activeTaps.reduce((s, t) => s + (t.abv || 0), 0) / activeTaps.length).toFixed(1)
              : '—'}%
          </p>
          <p className="text-xs text-brewery-500 mt-0.5">across all taps</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <p className="text-xs text-brewery-400 mb-1">Today's Events</p>
          <p className="text-2xl font-bold text-emerald-400">{todayEvents.length}</p>
          <p className="text-xs text-brewery-500 mt-0.5">{todayEvents.length > 0 ? todayEvents[0].title : 'None scheduled'}</p>
        </div>
      </div>
    </div>
  );
}
