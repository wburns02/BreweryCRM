import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Users, Beer, Calendar, ChefHat, Package, DollarSign, Music, MapPin, Megaphone, LayoutDashboard, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { PageId } from '../types';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
}

interface SearchResult {
  id: string;
  type: 'customer' | 'beer' | 'event' | 'staff' | 'inventory' | 'menu' | 'page' | 'reservation' | 'wholesale';
  title: string;
  subtitle: string;
  page: PageId;
  icon: typeof Search;
}

const PAGE_RESULTS: { title: string; page: PageId; icon: typeof Search; keywords: string }[] = [
  { title: 'Dashboard', page: 'dashboard', icon: LayoutDashboard, keywords: 'home overview' },
  { title: 'Point of Sale', page: 'pos', icon: DollarSign, keywords: 'pos register checkout' },
  { title: 'Floor Plan', page: 'floor-plan', icon: MapPin, keywords: 'tables seating layout' },
  { title: 'Customers', page: 'customers', icon: Users, keywords: 'guests people contacts' },
  { title: 'Mug Club', page: 'mug-club', icon: Beer, keywords: 'membership loyalty' },
  { title: 'Reservations', page: 'reservations', icon: Calendar, keywords: 'booking tables' },
  { title: 'Tap Management', page: 'taps', icon: Beer, keywords: 'draft keg pour' },
  { title: 'Brewing', page: 'brewing', icon: Beer, keywords: 'production batch fermentation' },
  { title: 'Production Dashboard', page: 'production', icon: Beer, keywords: 'tanks vessels' },
  { title: 'Recipe Lab', page: 'recipes', icon: ChefHat, keywords: 'recipe grain hops' },
  { title: 'Keg Tracking', page: 'kegs', icon: Package, keywords: 'kegs fleet' },
  { title: 'Food & Menu', page: 'menu', icon: ChefHat, keywords: 'food dishes plates' },
  { title: 'Inventory', page: 'inventory', icon: Package, keywords: 'stock supplies ingredients' },
  { title: 'Taproom Analytics', page: 'taproom-analytics', icon: DollarSign, keywords: 'analytics shift live' },
  { title: 'Events', page: 'events', icon: Music, keywords: 'entertainment music trivia' },
  { title: 'Marketing', page: 'marketing', icon: Megaphone, keywords: 'campaigns email social' },
  { title: 'Financials', page: 'financials', icon: DollarSign, keywords: 'money revenue profit' },
  { title: 'Staff', page: 'staff', icon: Users, keywords: 'employees team schedule' },
  { title: 'Distribution', page: 'distribution', icon: Package, keywords: 'wholesale accounts' },
  { title: 'Reports', page: 'reports', icon: DollarSign, keywords: 'analytics charts' },
  { title: 'Settings', page: 'settings', icon: LayoutDashboard, keywords: 'config compliance' },
];

export default function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const data = useData();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Show pages when empty
      return PAGE_RESULTS.map(p => ({
        id: `page-${p.page}`,
        type: 'page' as const,
        title: p.title,
        subtitle: 'Go to page',
        page: p.page,
        icon: p.icon,
      }));
    }

    const matches: SearchResult[] = [];

    // Search pages
    for (const p of PAGE_RESULTS) {
      if (p.title.toLowerCase().includes(q) || p.keywords.includes(q)) {
        matches.push({
          id: `page-${p.page}`,
          type: 'page',
          title: p.title,
          subtitle: 'Go to page',
          page: p.page,
          icon: p.icon,
        });
      }
    }

    // Search customers
    for (const c of data.customers) {
      const name = `${c.firstName} ${c.lastName}`;
      if (name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)) {
        matches.push({
          id: `cust-${c.id}`,
          type: 'customer',
          title: name,
          subtitle: `${c.loyaltyTier} - ${c.totalVisits} visits - $${c.totalSpent.toFixed(0)} spent`,
          page: 'customers',
          icon: Users,
        });
      }
    }

    // Search beers
    for (const b of data.beers) {
      if (b.name.toLowerCase().includes(q) || b.style.toLowerCase().includes(q)) {
        matches.push({
          id: `beer-${b.id}`,
          type: 'beer',
          title: b.name,
          subtitle: `${b.style} - ${b.abv}% ABV${b.tapNumber ? ` - Tap #${b.tapNumber}` : ''}`,
          page: 'taps',
          icon: Beer,
        });
      }
    }

    // Search events
    for (const e of data.events) {
      if (e.title.toLowerCase().includes(q) || e.type?.toLowerCase().includes(q)) {
        matches.push({
          id: `event-${e.id}`,
          type: 'event',
          title: e.title,
          subtitle: `${e.date} - ${e.status}`,
          page: 'events',
          icon: Music,
        });
      }
    }

    // Search staff
    for (const s of data.staff) {
      const name = `${s.firstName} ${s.lastName}`;
      if (name.toLowerCase().includes(q) || s.role?.toLowerCase().includes(q)) {
        matches.push({
          id: `staff-${s.id}`,
          type: 'staff',
          title: name,
          subtitle: `${s.role} - ${s.status}`,
          page: 'staff',
          icon: Users,
        });
      }
    }

    // Search inventory
    for (const i of data.inventoryItems) {
      if (i.name.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q)) {
        matches.push({
          id: `inv-${i.id}`,
          type: 'inventory',
          title: i.name,
          subtitle: `${i.category} - ${i.currentStock} ${i.unit}`,
          page: 'inventory',
          icon: Package,
        });
      }
    }

    // Search menu items
    for (const m of data.menuItems) {
      if (m.name.toLowerCase().includes(q) || m.category?.toLowerCase().includes(q)) {
        matches.push({
          id: `menu-${m.id}`,
          type: 'menu',
          title: m.name,
          subtitle: `$${m.price} - ${m.category}`,
          page: 'menu',
          icon: ChefHat,
        });
      }
    }

    // Search wholesale accounts
    for (const w of data.wholesaleAccounts) {
      if (w.businessName.toLowerCase().includes(q) || w.contactName?.toLowerCase().includes(q)) {
        matches.push({
          id: `ws-${w.id}`,
          type: 'wholesale',
          title: w.businessName,
          subtitle: `${w.type} - ${w.contactName}`,
          page: 'distribution',
          icon: Package,
        });
      }
    }

    return matches.slice(0, 20);
  }, [query, data]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback((result: SearchResult) => {
    onNavigate(result.page);
    onClose();
  }, [onNavigate, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, results, selectedIndex, handleSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.children[selectedIndex] as HTMLElement;
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!open) return null;

  const typeLabels: Record<SearchResult['type'], string> = {
    page: 'Pages',
    customer: 'Customers',
    beer: 'Beers',
    event: 'Events',
    staff: 'Staff',
    inventory: 'Inventory',
    menu: 'Menu',
    reservation: 'Reservations',
    wholesale: 'Distribution',
  };

  // Group results by type
  const grouped: { type: SearchResult['type']; label: string; items: SearchResult[] }[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (!seen.has(r.type)) {
      seen.add(r.type);
      grouped.push({ type: r.type, label: typeLabels[r.type], items: [] });
    }
    grouped.find(g => g.type === r.type)!.items.push(r);
  }

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-xl bg-brewery-900 border border-brewery-700/50 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-brewery-700/30">
          <Search className="w-5 h-5 text-brewery-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search customers, beers, pages..."
            className="flex-1 bg-transparent text-brewery-100 placeholder-brewery-500 outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-brewery-500 hover:text-brewery-300">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] text-brewery-500 bg-brewery-800 px-1.5 py-0.5 rounded border border-brewery-700/50">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-brewery-500">
              No results for "{query}"
            </div>
          ) : (
            grouped.map(group => (
              <div key={group.type}>
                <div className="px-4 py-1.5 text-[10px] font-semibold text-brewery-500 uppercase tracking-wider">
                  {group.label}
                </div>
                {group.items.map(result => {
                  const idx = flatIndex++;
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        idx === selectedIndex
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'text-brewery-200 hover:bg-brewery-800/50'
                      }`}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        idx === selectedIndex ? 'bg-amber-500/20' : 'bg-brewery-800'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-brewery-500 truncate">{result.subtitle}</p>
                      </div>
                      {result.type !== 'page' && (
                        <span className="text-[10px] text-brewery-600 shrink-0">{typeLabels[result.type]}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-brewery-700/30 text-[10px] text-brewery-500">
          <span><kbd className="px-1 py-0.5 bg-brewery-800 rounded border border-brewery-700/50 mr-1">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1 py-0.5 bg-brewery-800 rounded border border-brewery-700/50 mr-1">↵</kbd> Select</span>
          <span><kbd className="px-1 py-0.5 bg-brewery-800 rounded border border-brewery-700/50 mr-1">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
