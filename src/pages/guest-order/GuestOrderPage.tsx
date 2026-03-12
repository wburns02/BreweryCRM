import { useState, useMemo } from 'react';
import {
  Smartphone, QrCode, Beer, UtensilsCrossed, ShoppingCart,
  Plus, Minus, X, CheckCircle, ChevronRight, GlassWater,
  Sparkles, AlertCircle, Clock, LayoutGrid, List,
} from 'lucide-react';
import { useBrewery } from '../../context/BreweryContext';
import { useData } from '../../context/DataContext';
import { clsx } from 'clsx';
import type { OpenTab } from '../../types';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function kegBadge(pct: number) {
  if (pct > 75) return { label: 'Fresh Keg', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  if (pct > 40) return { label: 'Available', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  if (pct > 15) return { label: 'Running Low', cls: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
  return { label: 'Last Pours!', cls: 'bg-red-500/20 text-red-300 border-red-500/30' };
}

function srmColor(srm?: number): string {
  if (!srm) return '#F8A600';
  if (srm <= 4) return '#FFE699';
  if (srm <= 8) return '#FFBF42';
  if (srm <= 13) return '#F8A600';
  if (srm <= 20) return '#EA8F00';
  if (srm <= 29) return '#CF6900';
  return '#4A1A00';
}

type CartItem = { id: string; name: string; size: string; price: number; qty: number; category: 'beer' | 'food' };
type Stage = 'menu' | 'cart' | 'info' | 'confirm';

// ─── QR PREVIEW PANEL ─────────────────────────────────────────────────────────

function QrPreviewPanel() {
  const [copied, setCopied] = useState(false);
  const guestUrl = `${window.location.origin}/#guest-order`;

  function copy() {
    navigator.clipboard.writeText(guestUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <QrCode className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-brewery-100">QR Code Setup</h3>
          <p className="text-xs text-brewery-400">Print & place at each table</p>
        </div>
      </div>

      {/* Mock QR code (SVG pattern) */}
      <div className="flex justify-center">
        <div className="bg-white rounded-xl p-4 w-40 h-40 relative overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Corner squares */}
            <rect x="5" y="5" width="28" height="28" rx="2" fill="black"/>
            <rect x="9" y="9" width="20" height="20" rx="1" fill="white"/>
            <rect x="13" y="13" width="12" height="12" rx="1" fill="black"/>

            <rect x="67" y="5" width="28" height="28" rx="2" fill="black"/>
            <rect x="71" y="9" width="20" height="20" rx="1" fill="white"/>
            <rect x="75" y="13" width="12" height="12" rx="1" fill="black"/>

            <rect x="5" y="67" width="28" height="28" rx="2" fill="black"/>
            <rect x="9" y="71" width="20" height="20" rx="1" fill="white"/>
            <rect x="13" y="75" width="12" height="12" rx="1" fill="black"/>

            {/* Data pattern (decorative) */}
            {[37,40,43,46,52,55,58,61,64].map((x,i) =>
              [37,40,43,46,52,55,58,61,64].map((y,j) =>
                ((i + j * 3) % 4 < 2) ? <rect key={`${i}-${j}`} x={x} y={y} width="2.5" height="2.5" fill="black"/> : null
              )
            )}
            {/* Bearded Hop logo area */}
            <rect x="41" y="41" width="18" height="18" rx="2" fill="black"/>
            <text x="50" y="53" fontSize="10" textAnchor="middle" fill="white" fontWeight="bold">🍺</text>
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-brewery-400 text-center">Scan to order from your table</p>
        <div className="flex items-center gap-2 bg-brewery-800/50 rounded-lg px-3 py-2 border border-brewery-700/30">
          <span className="text-xs text-brewery-300 flex-1 truncate">{guestUrl}</span>
          <button
            onClick={copy}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium shrink-0"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/20 hover:bg-amber-600/30 transition-colors text-xs font-medium">
          <QrCode className="w-3.5 h-3.5" />
          Download PNG
        </button>
        <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brewery-700/30 text-brewery-300 border border-brewery-600/20 hover:bg-brewery-700/50 transition-colors text-xs font-medium">
          <List className="w-3.5 h-3.5" />
          Print Sheet
        </button>
      </div>
    </div>
  );
}

// ─── STATS PANEL ──────────────────────────────────────────────────────────────

function OrderStats({ orders }: { orders: number }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Orders Today', value: orders + 4, color: 'text-amber-400' },
        { label: 'Avg Order', value: '$28.40', color: 'text-emerald-400' },
        { label: 'QR Scans', value: orders * 3 + 12, color: 'text-blue-400' },
      ].map(s => (
        <div key={s.label} className="bg-brewery-900/60 border border-brewery-700/30 rounded-xl p-3 text-center">
          <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-[10px] text-brewery-400 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── GUEST VIEW (mobile-first order UI) ───────────────────────────────────────

function GuestView({ onOrderPlaced }: { onOrderPlaced: () => void }) {
  const { tapLines, menuItems, createTab, addToTab } = useBrewery();
  const { events } = useData();
  const [tab, setTab] = useState<'beers' | 'food'>('beers');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [stage, setStage] = useState<Stage>('menu');
  const [guestName, setGuestName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const activeTaps = useMemo(() => tapLines.filter(t => t.status === 'active'), [tapLines]);
  const availableFood = useMemo(() => menuItems.filter(m => m.isAvailable && m.category !== 'merchandise'), [menuItems]);
  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return events.filter(e => e.date >= today).slice(0, 2);
  }, [events]);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  function addBeer(tapNumber: number, beerName: string, sizeName: string, price: number) {
    const id = `beer-${tapNumber}-${sizeName}`;
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) return prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id, name: beerName, size: sizeName, price, qty: 1, category: 'beer' }];
    });
  }

  function addFood(foodId: string, name: string, price: number) {
    setCart(prev => {
      const existing = prev.find(i => i.id === foodId);
      if (existing) return prev.map(i => i.id === foodId ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: foodId, name, size: 'Full', price, qty: 1, category: 'food' }];
    });
  }

  function removeItem(id: string) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    );
  }

  function placeOrder() {
    if (!guestName.trim()) return;
    const newTab: OpenTab = {
      id: `qr-${Date.now()}`,
      customerName: guestName.trim(),
      items: [],
      openedAt: new Date().toISOString(),
      server: 'QR Order',
      subtotal: 0,
      tableNumber: tableNumber.trim() || undefined,
    };
    createTab(newTab);
    cart.forEach(item => {
      addToTab(newTab.id, { name: item.name, size: item.size, price: item.price, qty: item.qty });
    });
    setStage('confirm');
    onOrderPlaced();
  }

  // ── Cart screen ──────────────────────────────────────────────────────────────
  if (stage === 'cart') {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <button onClick={() => setStage('menu')} className="flex items-center gap-1.5 text-brewery-400 hover:text-brewery-200 transition-colors text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to menu
        </button>
        <h2 className="text-xl font-bold text-brewery-50">Your Order</h2>
        {cart.length === 0 ? (
          <div className="text-center py-12 text-brewery-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.id} className="bg-brewery-800/60 rounded-xl p-3 flex items-center gap-3 border border-brewery-700/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brewery-100 truncate">{item.name}</p>
                  <p className="text-xs text-brewery-400">{item.size} · ${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full bg-brewery-700/60 flex items-center justify-center hover:bg-red-600/30 transition-colors">
                    <Minus className="w-3 h-3 text-brewery-300" />
                  </button>
                  <span className="text-sm font-bold text-brewery-100 w-4 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full bg-brewery-700/60 flex items-center justify-center hover:bg-emerald-600/30 transition-colors">
                    <Plus className="w-3 h-3 text-brewery-300" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center hover:bg-red-600/40 transition-colors ml-1">
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                </div>
                <p className="text-sm font-bold text-amber-400 w-14 text-right">${(item.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t border-brewery-700/40 pt-3 flex justify-between items-center">
              <span className="text-brewery-400">Total</span>
              <span className="text-xl font-bold text-amber-400">${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        )}
        {cart.length > 0 && (
          <button
            onClick={() => setStage('info')}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brewery-950 font-bold text-sm transition-colors"
          >
            Proceed to Checkout →
          </button>
        )}
      </div>
    );
  }

  // ── Info screen ──────────────────────────────────────────────────────────────
  if (stage === 'info') {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <button onClick={() => setStage('cart')} className="flex items-center gap-1.5 text-brewery-400 hover:text-brewery-200 transition-colors text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to cart
        </button>
        <h2 className="text-xl font-bold text-brewery-50">Your Details</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-brewery-400 mb-1 block">Your Name *</label>
            <input
              type="text"
              placeholder="e.g. Sarah"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              className="w-full bg-brewery-800/60 border border-brewery-700/40 rounded-xl px-4 py-3 text-brewery-100 placeholder-brewery-600 focus:outline-none focus:border-amber-500/60 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-brewery-400 mb-1 block">Table Number <span className="text-brewery-600">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. 4 or Patio 2"
              value={tableNumber}
              onChange={e => setTableNumber(e.target.value)}
              className="w-full bg-brewery-800/60 border border-brewery-700/40 rounded-xl px-4 py-3 text-brewery-100 placeholder-brewery-600 focus:outline-none focus:border-amber-500/60 text-sm"
            />
          </div>
          <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">Your server will come to your table to verify your order and collect payment at the end.</p>
          </div>
        </div>
        <button
          onClick={placeOrder}
          disabled={!guestName.trim()}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-brewery-950 font-bold text-sm transition-colors"
        >
          Place Order — ${cartTotal.toFixed(2)}
        </button>
      </div>
    );
  }

  // ── Confirm screen ───────────────────────────────────────────────────────────
  if (stage === 'confirm') {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-8">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-brewery-50 mb-2">Order Sent! 🍺</h2>
          <p className="text-brewery-400">Hey {guestName}, your order has been received.</p>
          {tableNumber && <p className="text-brewery-400 text-sm mt-1">Table {tableNumber}</p>}
        </div>
        <div className="bg-brewery-800/60 rounded-2xl p-4 border border-brewery-700/30 text-left space-y-2">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-brewery-300">{item.qty}× {item.name} <span className="text-brewery-500">({item.size})</span></span>
              <span className="text-brewery-100">${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-brewery-700/40 pt-2 flex justify-between font-bold">
            <span className="text-brewery-100">Total</span>
            <span className="text-amber-400">${cartTotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-brewery-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>Your server will be right with you</span>
        </div>
        <button
          onClick={() => { setCart([]); setStage('menu'); setGuestName(''); setTableNumber(''); }}
          className="w-full py-3 rounded-xl bg-brewery-700/40 text-brewery-300 hover:bg-brewery-700/60 transition-colors text-sm font-medium"
        >
          Order More Items
        </button>
      </div>
    );
  }

  // ── Menu screen ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="text-center space-y-1 pb-2">
        <div className="flex items-center justify-center gap-2">
          <Beer className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-bold text-brewery-50">Bearded Hop Brewery</h2>
        </div>
        <p className="text-sm text-brewery-400">Bulverde, TX · Order from your table</p>
      </div>

      {/* Upcoming events banner */}
      {upcomingEvents.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300"><span className="font-semibold">{upcomingEvents[0].title}</span> · {upcomingEvents[0].date}</p>
        </div>
      )}

      {/* Category tabs + view toggle */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 bg-brewery-900/60 rounded-xl p-1 border border-brewery-700/30">
          <button
            onClick={() => setTab('beers')}
            className={clsx('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors', tab === 'beers' ? 'bg-amber-600/30 text-amber-300' : 'text-brewery-400 hover:text-brewery-200')}
          >
            <Beer className="w-4 h-4" /> Beers on Tap
            <span className="text-xs opacity-70">({activeTaps.length})</span>
          </button>
          <button
            onClick={() => setTab('food')}
            className={clsx('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors', tab === 'food' ? 'bg-amber-600/30 text-amber-300' : 'text-brewery-400 hover:text-brewery-200')}
          >
            <UtensilsCrossed className="w-4 h-4" /> Food
            <span className="text-xs opacity-70">({availableFood.length})</span>
          </button>
        </div>
        <button
          onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
          className="p-2 rounded-xl bg-brewery-900/60 border border-brewery-700/30 text-brewery-400 hover:text-brewery-200 transition-colors"
        >
          {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
        </button>
      </div>

      {/* Beer cards */}
      {tab === 'beers' && (
        <div className={clsx(viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-2')}>
          {activeTaps.map(tap => {
            const badge = kegBadge(tap.kegLevel);
            const defaultPour = tap.pourSizes?.[0];
            return (
              <div
                key={tap.tapNumber}
                className={clsx(
                  'bg-brewery-900/70 border rounded-2xl overflow-hidden transition-all',
                  tap.kegLevel < 15 ? 'border-red-500/30' : tap.kegLevel < 35 ? 'border-amber-500/20' : 'border-brewery-700/30',
                  viewMode === 'list' ? 'flex items-center gap-3 p-3' : 'p-4'
                )}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Grid card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-brewery-600/30 shrink-0"
                          style={{ backgroundColor: srmColor((tap as any).srm) }}
                        />
                        <div>
                          <p className="font-semibold text-brewery-100 text-sm leading-tight">{tap.beerName}</p>
                          <p className="text-xs text-brewery-400">{tap.style}</p>
                        </div>
                      </div>
                      <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full border', badge.cls)}>{badge.label}</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {tap.abv && <span className="text-xs bg-brewery-800/60 rounded-lg px-2 py-0.5 text-brewery-300">{tap.abv}% ABV</span>}
                      {tap.ibu && <span className="text-xs bg-brewery-800/60 rounded-lg px-2 py-0.5 text-brewery-300">{tap.ibu} IBU</span>}
                    </div>
                    {/* Keg level bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-brewery-500 mb-1">
                        <span>Keg Level</span>
                        <span>{tap.kegLevel}%</span>
                      </div>
                      <div className="h-1.5 bg-brewery-800 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full transition-all', tap.kegLevel < 15 ? 'bg-red-500' : tap.kegLevel < 35 ? 'bg-amber-500' : 'bg-emerald-500')}
                          style={{ width: `${tap.kegLevel}%` }}
                        />
                      </div>
                    </div>
                    {/* Pour size buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {(tap.pourSizes || []).map(ps => (
                        <button
                          key={ps.name}
                          onClick={() => addBeer(tap.tapNumber, tap.beerName || 'Beer', ps.name, ps.price)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/20 hover:bg-amber-600/40 active:scale-95 transition-all text-xs font-medium"
                        >
                          <GlassWater className="w-3 h-3" />
                          {ps.name} · ${ps.price.toFixed(2)}
                        </button>
                      ))}
                      {(!tap.pourSizes || tap.pourSizes.length === 0) && (
                        <button
                          onClick={() => addBeer(tap.tapNumber, tap.beerName || 'Beer', 'Pint', 7.00)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/20 hover:bg-amber-600/40 active:scale-95 transition-all text-xs font-medium"
                        >
                          <GlassWater className="w-3 h-3" />
                          Pint · $7.00
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  // List row
                  <>
                    <div
                      className="w-7 h-7 rounded-full border-2 border-brewery-600/30 shrink-0"
                      style={{ backgroundColor: srmColor((tap as any).srm) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-brewery-100 text-sm truncate">{tap.beerName}</p>
                        <span className={clsx('text-[9px] font-medium px-1.5 py-0.5 rounded-full border shrink-0', badge.cls)}>{badge.label}</span>
                      </div>
                      <p className="text-xs text-brewery-400">{tap.style} {tap.abv ? `· ${tap.abv}%` : ''}</p>
                    </div>
                    {defaultPour && (
                      <button
                        onClick={() => addBeer(tap.tapNumber, tap.beerName || 'Beer', defaultPour.name, defaultPour.price)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/20 hover:bg-amber-600/40 active:scale-95 transition-all text-xs font-medium shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        ${defaultPour.price.toFixed(2)}
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Food items */}
      {tab === 'food' && (
        <div className={clsx(viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-2')}>
          {availableFood.length === 0 ? (
            <div className="text-center py-12 col-span-2">
              <UtensilsCrossed className="w-10 h-10 mx-auto text-brewery-600 mb-2" />
              <p className="text-brewery-400 text-sm">No food items available right now</p>
            </div>
          ) : availableFood.map(item => (
            <div
              key={item.id}
              className={clsx('bg-brewery-900/70 border border-brewery-700/30 rounded-2xl overflow-hidden', viewMode === 'list' ? 'flex items-center gap-3 p-3' : 'p-4')}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-brewery-100 text-sm">{item.name}</p>
                      <p className="text-xs text-brewery-500 capitalize">{item.category}</p>
                    </div>
                    <p className="text-amber-400 font-bold text-sm">${item.price.toFixed(2)}</p>
                  </div>
                  {item.description && <p className="text-xs text-brewery-400 mb-3 line-clamp-2">{item.description}</p>}
                  {item.dietaryTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.dietaryTags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] bg-green-900/30 text-green-400 border border-green-500/20 rounded-full px-1.5 py-0.5">{tag}</span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => addFood(item.id, item.name, item.price)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/20 hover:bg-amber-600/40 active:scale-95 transition-all text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add — ${item.price.toFixed(2)}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brewery-100 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-brewery-400 capitalize">{item.category}</p>
                  </div>
                  <button
                    onClick={() => addFood(item.id, item.name, item.price)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/20 hover:bg-amber-600/40 active:scale-95 transition-all text-xs font-medium shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    ${item.price.toFixed(2)}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Floating cart button */}
      {cartCount > 0 && (
        <div className="sticky bottom-4 left-0 right-0 flex justify-center pointer-events-none">
          <button
            onClick={() => setStage('cart')}
            className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-brewery-950 font-bold shadow-2xl shadow-amber-900/50 transition-all active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
            <span className="bg-brewery-950/20 rounded-lg px-2 py-0.5 text-sm">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function GuestOrderPage() {
  const [adminView, setAdminView] = useState<'preview' | 'qr' | 'stats'>('preview');
  const [guestOrderCount, setGuestOrderCount] = useState(0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-brewery-50">Mobile Order Portal</h1>
            <p className="text-sm text-brewery-400">Customer QR ordering · Orders go directly to POS</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['preview', 'qr', 'stats'] as const).map(v => (
            <button
              key={v}
              onClick={() => setAdminView(v)}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize', adminView === v ? 'bg-amber-600/30 text-amber-300 border border-amber-500/20' : 'bg-brewery-800/40 text-brewery-400 border border-brewery-700/20 hover:text-brewery-200')}
            >
              {v === 'preview' ? '📱 Preview' : v === 'qr' ? '⬡ QR Setup' : '📊 Stats'}
            </button>
          ))}
        </div>
      </div>

      {adminView === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QrPreviewPanel />
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-brewery-100">Setup Guide</h3>
            <ol className="space-y-3">
              {[
                'Download the QR code PNG or print the table sheet',
                'Place QR cards at each table and the bar counter',
                'Customers scan → see live tap menu → order',
                'Orders appear instantly in your POS as new tabs',
                'Your server confirms and collects payment at close',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-brewery-300">{step}</p>
                </li>
              ))}
            </ol>
            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-3">
              <p className="text-xs text-emerald-300">💡 <span className="font-semibold">Tip:</span> Enable on Friday & Saturday nights to reduce server walkbacks and increase order throughput by ~30%.</p>
            </div>
          </div>
        </div>
      )}

      {adminView === 'stats' && (
        <div className="space-y-4">
          <OrderStats orders={guestOrderCount} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Hourly activity (mock) */}
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-2xl p-4">
              <h3 className="font-semibold text-brewery-100 mb-3 text-sm">Hourly Activity Today</h3>
              <div className="flex items-end gap-1.5 h-24">
                {[0,0,0,0,0,0,0,0,0,0,0,1,2,3,1,2,guestOrderCount+2,guestOrderCount+4,guestOrderCount+3,guestOrderCount+1,0,0,0,0].map((v,i) => {
                  const max = Math.max(1, guestOrderCount + 4);
                  const h = Math.round((v / max) * 100);
                  const hour = i;
                  const label = hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour-12}p`;
                  const isActive = i >= 16 && i <= 19;
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                      <div className="w-full rounded-t" style={{ height: `${Math.max(2, h)}%`, backgroundColor: isActive ? '#f59e0b' : v > 0 ? '#78350f' : '#1c1208' }} />
                      {(i % 4 === 0) && <span className="text-[7px] text-brewery-600">{label}</span>}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-brewery-500 mt-2">Peak: 4–8 PM · Amber bars = current session</p>
            </div>
            {/* Top items ordered */}
            <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-2xl p-4">
              <h3 className="font-semibold text-brewery-100 mb-3 text-sm">Top Items via QR Today</h3>
              {[
                { name: 'Prickly Pear Sour — Pint', count: 12, revenue: 84 },
                { name: 'Texas Hill Country Lager — Pint', count: 9, revenue: 63 },
                { name: 'Smoked Wings', count: 7, revenue: 104.93 },
                { name: 'Bulverde Blonde Ale — Half', count: 6, revenue: 30 },
                { name: 'Brew Cheese Pretzel Board', count: 5, revenue: 69.95 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-brewery-800/60 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-brewery-500 w-4 shrink-0">{i + 1}</span>
                    <span className="text-xs text-brewery-300 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-brewery-400">×{item.count}</span>
                    <span className="text-xs font-medium text-amber-400">${item.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-2xl p-4">
            <h3 className="font-semibold text-brewery-100 mb-3 text-sm">This Session ({guestOrderCount} QR orders)</h3>
            {guestOrderCount === 0 ? (
              <div className="text-center py-8">
                <Smartphone className="w-10 h-10 mx-auto text-brewery-700 mb-3" />
                <p className="text-brewery-400 text-sm">No QR orders placed this session.</p>
                <p className="text-brewery-600 text-xs mt-1">Switch to Preview and try placing a test order.</p>
              </div>
            ) : (
              <p className="text-brewery-300 text-sm">{guestOrderCount} order{guestOrderCount !== 1 ? 's' : ''} placed via QR this session — check your POS for the open tabs.</p>
            )}
          </div>
        </div>
      )}

      {adminView === 'preview' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-brewery-500">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer view — this is what guests see on their phone</span>
          </div>
          {/* Split: phone frame + side info */}
          <div className="flex gap-6 items-start">
            {/* Phone frame — always 390px wide like iPhone */}
            <div className="w-[390px] shrink-0">
              <div className="bg-brewery-950 border border-brewery-700/40 rounded-3xl overflow-hidden shadow-2xl">
                {/* Phone status bar (decorative) */}
                <div className="bg-brewery-900/80 px-6 py-2 flex items-center justify-between text-[10px] text-brewery-500">
                  <span>9:41</span>
                  <div className="w-16 h-3 bg-brewery-700/60 rounded-full" />
                  <span>●●●</span>
                </div>
                {/* Guest menu content with scroll fade */}
                <div className="relative">
                  <div className="overflow-y-auto max-h-[620px] px-4 py-4 scrollbar-hide">
                    <GuestView onOrderPlaced={() => setGuestOrderCount(n => n + 1)} />
                  </div>
                  {/* Scroll fade hint */}
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-brewery-950 to-transparent pointer-events-none rounded-b-3xl" />
                </div>
              </div>
            </div>
            {/* Side info panel */}
            <div className="flex-1 min-w-0 space-y-4 hidden lg:block">
              <div className="bg-brewery-900/60 border border-brewery-700/30 rounded-2xl p-5 space-y-3">
                <h3 className="font-semibold text-brewery-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  How it works
                </h3>
                <ol className="space-y-2.5">
                  {['Customer scans QR at table', 'Browses live tap menu & food', 'Selects items & places order', 'Order appears in POS instantly', 'Server confirms & collects payment'].map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm text-brewery-300">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-xs text-emerald-300">💡 <strong>Tip:</strong> Runs best on Friday & Saturday nights — reduces server walkbacks and increases table throughput by ~30%.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
