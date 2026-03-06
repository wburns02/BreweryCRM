import { useState, useMemo } from 'react';
import { Beer, UtensilsCrossed, GlassWater, ShoppingBag, Minus, Plus, Trash2, CreditCard, Banknote, Receipt, Crown, Clock, ChevronRight, ChevronLeft, Search, Check, Percent, X } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';
import { useData } from '../../context/DataContext';
import type { OpenTab } from '../../types';

type MenuCategory = 'draft' | 'food' | 'na-beverages' | 'merchandise';

const categoryTabs: { id: MenuCategory; label: string; icon: React.ElementType }[] = [
  { id: 'draft', label: 'Draft Beer', icon: Beer },
  { id: 'food', label: 'Food', icon: UtensilsCrossed },
  { id: 'na-beverages', label: 'NA Beverages', icon: GlassWater },
  { id: 'merchandise', label: 'Merchandise', icon: ShoppingBag },
];

const pourSizes = [
  { name: 'Taster', oz: 4, price: 3 },
  { name: 'Half Pint', oz: 10, price: 5 },
  { name: 'Pint', oz: 16, price: 7 },
  { name: 'Mug Club 20oz', oz: 20, price: 7 },
  { name: 'Growler', oz: 64, price: 14 },
  { name: 'Crowler', oz: 32, price: 8 },
];

const naPourSizes = [
  { name: 'Small', oz: 12, price: 4 },
  { name: 'Large', oz: 20, price: 6 },
];

type Discount = { label: string; type: 'percent' | 'fixed'; value: number };
const discounts: Discount[] = [
  { label: 'Mug Club 20oz Upgrade', type: 'fixed', value: 0 },
  { label: 'Happy Hour 20%', type: 'percent', value: 20 },
  { label: 'Employee 50%', type: 'percent', value: 50 },
  { label: 'Custom $', type: 'fixed', value: 0 },
];

const TAX_RATE = 0.0825;

function kegLevelColor(level: number): string {
  if (level > 50) return 'border-emerald-500/40 hover:border-emerald-400/60';
  if (level > 25) return 'border-amber-500/40 hover:border-amber-400/60';
  if (level > 0) return 'border-red-500/40 hover:border-red-400/60';
  return 'border-brewery-700/30 opacity-40';
}

function kegLevelBg(level: number): string {
  if (level > 50) return 'bg-emerald-500';
  if (level > 25) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function POSPage() {
  const { customers, menuItems } = useData();
  const { tabs, tapLines, addToTab, closeTab, holdTab } = useBrewery();
  const { toast } = useToast();
  const [menuCat, setMenuCat] = useState<MenuCategory>('draft');
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [showPourModal, setShowPourModal] = useState(false);
  const [selectedBeerForPour, setSelectedBeerForPour] = useState<{ name: string; isNA: boolean } | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [customDiscount, setCustomDiscount] = useState('');
  const [tabsSidebarOpen, setTabsSidebarOpen] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Current working tab — either an existing one or a new blank
  const [workingTab, setWorkingTab] = useState<OpenTab>({
    id: `tab-new-${Date.now()}`,
    customerName: 'Walk-in',
    items: [],
    openedAt: new Date().toISOString(),
    server: 'Jessica Tran',
    subtotal: 0,
  });

  const activeTab = workingTab;
  const isExistingTab = activeTabId !== null && tabs.some(t => t.id === activeTabId);

  const subtotal = activeTab.items.reduce((s, i) => s + i.price * i.qty, 0);
  const [appliedDiscount, setAppliedDiscount] = useState<{ label: string; amount: number } | null>(null);
  const discountAmount = appliedDiscount?.amount || 0;
  const taxable = subtotal - discountAmount;
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;

  // Food items grouped
  const foodItems = menuItems.filter(m => ['appetizer', 'entree', 'side', 'dessert', 'kids'].includes(m.category));
  const naItems = menuItems.filter(m => m.category === 'beverage-na');
  const merchItems = menuItems.filter(m => m.category === 'merchandise');

  // Customer autocomplete
  const customerSuggestions = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const q = customerSearch.toLowerCase();
    return customers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [customerSearch]);

  function handleBeerTap(beerName: string, isNA: boolean) {
    setSelectedBeerForPour({ name: beerName, isNA });
    setShowPourModal(true);
  }

  function handleSelectPourSize(size: { name: string; price: number }) {
    if (!selectedBeerForPour) return;
    const item = { name: selectedBeerForPour.name, size: size.name, price: size.price, qty: 1 };

    if (isExistingTab && activeTabId) {
      addToTab(activeTabId, item);
    }
    setWorkingTab(prev => {
      const existing = prev.items.find(i => i.name === item.name && i.size === item.size);
      const items = existing
        ? prev.items.map(i => i.name === item.name && i.size === item.size ? { ...i, qty: i.qty + 1 } : i)
        : [...prev.items, item];
      return { ...prev, items, subtotal: items.reduce((s, i) => s + i.price * i.qty, 0) };
    });
    setShowPourModal(false);
    setSelectedBeerForPour(null);
    toast('success', `Added ${selectedBeerForPour.name} (${size.name})`);
  }

  function handleFoodTap(name: string, price: number) {
    const item = { name, size: '', price, qty: 1 };
    if (isExistingTab && activeTabId) {
      addToTab(activeTabId, item);
    }
    setWorkingTab(prev => {
      const existing = prev.items.find(i => i.name === item.name);
      const items = existing
        ? prev.items.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i)
        : [...prev.items, item];
      return { ...prev, items, subtotal: items.reduce((s, i) => s + i.price * i.qty, 0) };
    });
    toast('success', `Added ${name}`);
  }

  function updateItemQty(idx: number, delta: number) {
    const newItems = workingTab.items
      .map((item, i) => i === idx ? { ...item, qty: item.qty + delta } : item)
      .filter(item => item.qty > 0);
    const updated = { ...workingTab, items: newItems, subtotal: newItems.reduce((s, i) => s + i.price * i.qty, 0) };
    setWorkingTab(updated);
    if (isExistingTab) holdTab(updated);
  }

  function removeItem(idx: number) {
    const newItems = workingTab.items.filter((_, i) => i !== idx);
    const updated = { ...workingTab, items: newItems, subtotal: newItems.reduce((s, i) => s + i.price * i.qty, 0) };
    setWorkingTab(updated);
    if (isExistingTab) holdTab(updated);
  }

  function handleHoldTab() {
    if (activeTab.items.length === 0) return;
    const tabToHold = { ...activeTab, subtotal };
    holdTab(tabToHold);
    toast('info', `Tab held for ${activeTab.customerName}`);
    resetWorkingTab();
  }

  function handleCloseTab(method: 'cash' | 'card' | 'tab' | 'mug-club') {
    if (isExistingTab && activeTabId) {
      closeTab(activeTabId);
    }
    setShowPayment(false);
    setShowReceipt(true);
    toast('success', `Tab closed — $${total.toFixed(2)} (${method})`);
    setTimeout(() => {
      setShowReceipt(false);
      resetWorkingTab();
    }, 2000);
  }

  function resetWorkingTab() {
    setActiveTabId(null);
    setAppliedDiscount(null);
    setWorkingTab({
      id: `tab-new-${Date.now()}`,
      customerName: 'Walk-in',
      items: [],
      openedAt: new Date().toISOString(),
      server: 'Jessica Tran',
      subtotal: 0,
    });
  }

  function loadExistingTab(tabId: string) {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);
      setWorkingTab(tab);
      setAppliedDiscount(null);
    }
  }

  function applyDiscount(d: Discount) {
    if (d.label === 'Custom $') {
      const amount = parseFloat(customDiscount);
      if (!isNaN(amount) && amount > 0) {
        setAppliedDiscount({ label: `Custom -$${amount.toFixed(2)}`, amount: Math.min(amount, subtotal) });
      }
    } else if (d.type === 'percent') {
      const amount = Math.round(subtotal * (d.value / 100) * 100) / 100;
      setAppliedDiscount({ label: d.label, amount });
    }
    setShowDiscount(false);
    setCustomDiscount('');
    toast('info', `Discount applied: ${d.label}`);
  }

  function selectCustomer(name: string, id?: string) {
    if (isExistingTab) return;
    setWorkingTab(prev => ({ ...prev, customerName: name, customerId: id }));
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  }

  // Time calculations for open tabs
  function getMinutesOpen(openedAt: string): number {
    return Math.floor((Date.now() - new Date(openedAt).getTime()) / 60000);
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)] -mt-2">
      {/* LEFT — Menu Grid (60%) */}
      <div className="flex-[3] flex flex-col min-w-0">
        {/* Category Tabs */}
        <div className="flex gap-1 mb-4 border-b border-brewery-700/30 flex-shrink-0">
          {categoryTabs.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} onClick={() => setMenuCat(cat.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${menuCat === cat.id ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'}`}>
                <Icon className="w-4 h-4" /> {cat.label}
              </button>
            );
          })}
        </div>

        {/* Draft Beer Grid */}
        {menuCat === 'draft' && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto flex-1 pb-4 pr-1">
            {tapLines.filter(t => t.status === 'active' && t.beerName).map(tap => (
              <button
                key={tap.tapNumber}
                onClick={() => tap.kegLevel > 0 && handleBeerTap(tap.beerName!, !!tap.abv && tap.abv === 0)}
                disabled={tap.kegLevel === 0}
                className={`relative bg-brewery-900/90 border-2 rounded-xl p-4 text-left transition-all active:scale-[0.97] ${kegLevelColor(tap.kegLevel)} ${tap.kegLevel === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400/70">TAP {tap.tapNumber}</span>
                  <span className="text-xs text-brewery-400">{tap.abv}%</span>
                </div>
                <h3 className="text-sm font-bold text-brewery-100 mb-0.5 truncate">{tap.beerName}</h3>
                <p className="text-[10px] text-brewery-400 mb-2 truncate">{tap.style}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-amber-400">$7</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 rounded-full bg-brewery-700/50 overflow-hidden">
                      <div className={`h-full rounded-full ${kegLevelBg(tap.kegLevel)}`} style={{ width: `${tap.kegLevel}%` }} />
                    </div>
                    <span className="text-[10px] text-brewery-500">{tap.kegLevel}%</span>
                  </div>
                </div>
                {tap.kegLevel === 0 && (
                  <div className="absolute inset-0 bg-brewery-950/70 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold text-red-400">EMPTY</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Food Grid */}
        {menuCat === 'food' && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto flex-1 pb-4 pr-1">
            {foodItems.map(item => (
              <button
                key={item.id}
                onClick={() => item.isAvailable && handleFoodTap(item.name, item.price)}
                disabled={!item.isAvailable}
                className={`relative bg-brewery-900/90 border border-brewery-700/30 rounded-xl p-4 text-left transition-all active:scale-[0.97] ${item.isAvailable ? 'hover:border-amber-500/30 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
              >
                <h3 className="text-sm font-semibold text-brewery-100 mb-1 truncate">{item.name}</h3>
                <p className="text-[10px] text-brewery-400 mb-2 capitalize">{item.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-amber-400">${item.price.toFixed(2)}</span>
                  {item.dietaryTags.length > 0 && <Badge variant="green">{item.dietaryTags[0]}</Badge>}
                </div>
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-brewery-950/60 rounded-xl flex items-center justify-center">
                    <Badge variant="red">86'd</Badge>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* NA Beverages */}
        {menuCat === 'na-beverages' && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto flex-1 pb-4 pr-1">
            {/* NA tap beverages */}
            {tapLines.filter(t => t.status === 'active' && t.abv !== undefined && t.abv <= 0.5 && t.beerName).map(tap => (
              <button
                key={`na-tap-${tap.tapNumber}`}
                onClick={() => handleBeerTap(tap.beerName!, true)}
                className="bg-brewery-900/90 border border-blue-500/20 rounded-xl p-4 text-left transition-all active:scale-[0.97] hover:border-blue-400/40 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-1"><Badge variant="blue">On Tap</Badge></div>
                <h3 className="text-sm font-semibold text-brewery-100 mb-1">{tap.beerName}</h3>
                <span className="text-lg font-bold text-amber-400">$4–$6</span>
              </button>
            ))}
            {/* Non-tap NA items */}
            {naItems.map(item => (
              <button
                key={item.id}
                onClick={() => item.isAvailable && handleFoodTap(item.name, item.price)}
                disabled={!item.isAvailable}
                className="bg-brewery-900/90 border border-brewery-700/30 rounded-xl p-4 text-left transition-all active:scale-[0.97] hover:border-amber-500/30 cursor-pointer"
              >
                <h3 className="text-sm font-semibold text-brewery-100 mb-1">{item.name}</h3>
                <p className="text-[10px] text-brewery-400 mb-2 line-clamp-1">{item.description}</p>
                <span className="text-lg font-bold text-amber-400">${item.price.toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Merchandise */}
        {menuCat === 'merchandise' && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto flex-1 pb-4 pr-1">
            {merchItems.map(item => (
              <button
                key={item.id}
                onClick={() => item.isAvailable && handleFoodTap(item.name, item.price)}
                className="bg-brewery-900/90 border border-brewery-700/30 rounded-xl p-4 text-left transition-all active:scale-[0.97] hover:border-amber-500/30 cursor-pointer"
              >
                <h3 className="text-sm font-semibold text-brewery-100 mb-1">{item.name}</h3>
                <span className="text-lg font-bold text-amber-400">${item.price.toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — Active Tab (40%) */}
      <div className="flex-[2] flex flex-col bg-brewery-900/90 border border-brewery-700/30 rounded-xl overflow-hidden min-w-[280px]">
        {/* Customer Name */}
        <div className="px-4 py-3 border-b border-brewery-700/30 relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brewery-500" />
            <input
              type="text"
              value={isExistingTab ? activeTab.customerName : customerSearch || activeTab.customerName}
              onChange={(e) => {
                if (!isExistingTab) {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                  if (!e.target.value.trim()) selectCustomer('Walk-in');
                }
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              placeholder="Customer name..."
              className="w-full bg-brewery-800/50 border border-brewery-700/30 rounded-lg pl-8 pr-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/40"
              readOnly={isExistingTab}
            />
          </div>
          {showCustomerDropdown && customerSuggestions.length > 0 && (
            <div className="absolute left-4 right-4 top-full mt-1 bg-brewery-800 border border-brewery-700/30 rounded-lg shadow-xl z-10 overflow-hidden">
              {customerSuggestions.map(c => (
                <button key={c.id} onClick={() => selectCustomer(`${c.firstName} ${c.lastName}`, c.id)} className="w-full text-left px-3 py-2 text-sm text-brewery-200 hover:bg-brewery-700/40 flex items-center justify-between">
                  <span>{c.firstName} {c.lastName}</span>
                  <div className="flex items-center gap-1.5">
                    {c.mugClubMember && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                    <Badge variant="gray">{c.loyaltyTier}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab header info */}
        {isExistingTab && (
          <div className="px-4 py-2 bg-amber-600/10 border-b border-amber-500/20 flex items-center justify-between">
            <span className="text-xs text-amber-300">Editing open tab</span>
            {activeTab.tableNumber && <Badge variant="amber">Table {activeTab.tableNumber}</Badge>}
          </div>
        )}

        {/* Line Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {activeTab.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-brewery-500">
              <Receipt className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No items yet</p>
              <p className="text-xs">Tap a beer or food item to start</p>
            </div>
          ) : (
            activeTab.items.map((item, idx) => (
              <div key={`${item.name}-${item.size}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-brewery-800/30 group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brewery-100 truncate">{item.name}</p>
                  {item.size && <p className="text-[10px] text-brewery-400">{item.size}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateItemQty(idx, -1)} className="w-6 h-6 rounded bg-brewery-800 flex items-center justify-center text-brewery-400 hover:text-brewery-100 hover:bg-brewery-700 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium text-brewery-200 w-5 text-center">{item.qty}</span>
                  <button onClick={() => updateItemQty(idx, 1)} className="w-6 h-6 rounded bg-brewery-800 flex items-center justify-center text-brewery-400 hover:text-brewery-100 hover:bg-brewery-700 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm font-bold text-brewery-200 w-16 text-right">${(item.price * item.qty).toFixed(2)}</span>
                <button onClick={() => removeItem(idx)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-brewery-700/30 px-4 py-3 space-y-1.5 flex-shrink-0">
          <div className="flex justify-between text-sm">
            <span className="text-brewery-400">Subtotal</span>
            <span className="text-brewery-200">${subtotal.toFixed(2)}</span>
          </div>
          {appliedDiscount && (
            <div className="flex justify-between text-sm">
              <span className="text-amber-400 flex items-center gap-1">
                <Percent className="w-3 h-3" /> {appliedDiscount.label}
                <button onClick={() => setAppliedDiscount(null)} className="text-brewery-500 hover:text-red-400"><X className="w-3 h-3" /></button>
              </span>
              <span className="text-amber-400">-${appliedDiscount.amount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-brewery-400">Tax (8.25%)</span>
            <span className="text-brewery-200">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-1 border-t border-brewery-700/20">
            <span className="text-brewery-100">Total</span>
            <span className="text-amber-400">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4 flex flex-col gap-2 flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setShowDiscount(true)}
              disabled={activeTab.items.length === 0}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-purple-600/20 text-purple-300 border border-purple-500/20 hover:bg-purple-600/30 transition-colors disabled:opacity-40"
            >
              <Percent className="w-3.5 h-3.5" /> Discount
            </button>
            <button
              onClick={handleHoldTab}
              disabled={activeTab.items.length === 0}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-amber-600/20 text-amber-300 border border-amber-500/20 hover:bg-amber-600/30 transition-colors disabled:opacity-40"
            >
              <Clock className="w-3.5 h-3.5" /> Hold Tab
            </button>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            disabled={activeTab.items.length === 0}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-emerald-400 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Close Tab — ${total.toFixed(2)}
          </button>
        </div>
      </div>

      {/* OPEN TABS SIDEBAR */}
      <div className={`flex-shrink-0 flex flex-col transition-all duration-300 ${tabsSidebarOpen ? 'w-56' : 'w-8'}`}>
        <button
          onClick={() => setTabsSidebarOpen(!tabsSidebarOpen)}
          className="mb-2 flex items-center justify-center w-8 h-8 rounded-lg bg-brewery-900/80 border border-brewery-700/30 text-brewery-400 hover:text-brewery-100 self-end"
        >
          {tabsSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {tabsSidebarOpen && (
          <div className="flex-1 overflow-y-auto space-y-2">
            <h3 className="text-[10px] font-semibold text-brewery-500 uppercase tracking-wider px-1">Open Tabs ({tabs.length})</h3>
            {tabs.map(tab => {
              const mins = getMinutesOpen(tab.openedAt);
              const isWarning = mins > 45;
              return (
                <button
                  key={tab.id}
                  onClick={() => loadExistingTab(tab.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${activeTabId === tab.id ? 'bg-amber-600/20 border-amber-500/30' : 'bg-brewery-900/80 border-brewery-700/30 hover:border-amber-500/20'} ${isWarning ? 'animate-pulse' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-brewery-100 truncate">{tab.customerName}</span>
                    {tab.tableNumber && <span className="text-[10px] text-brewery-500">{tab.tableNumber}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] ${isWarning ? 'text-amber-400' : 'text-brewery-500'}`}>{tab.items.length} items · {mins}m</span>
                    <span className="text-xs font-bold text-amber-400">${tab.subtotal.toFixed(2)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pour Size Modal */}
      <Modal open={showPourModal} onClose={() => { setShowPourModal(false); setSelectedBeerForPour(null); }} title={`Select Size — ${selectedBeerForPour?.name || ''}`} size="sm">
        <div className="grid grid-cols-2 gap-3">
          {(selectedBeerForPour?.isNA ? naPourSizes : pourSizes).map(size => (
            <button
              key={size.name}
              onClick={() => handleSelectPourSize(size)}
              className="p-4 rounded-xl bg-brewery-800/50 border border-brewery-700/30 hover:border-amber-500/30 transition-all text-center active:scale-[0.97]"
            >
              <p className="text-sm font-bold text-brewery-100">{size.name}</p>
              <p className="text-[10px] text-brewery-400">{size.oz}oz</p>
              <p className="text-xl font-bold text-amber-400 mt-1">${size.price}</p>
            </button>
          ))}
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)} title="Close Tab" size="sm">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brewery-800/40 text-center">
            <p className="text-xs text-brewery-400 mb-1">Total Due</p>
            <p className="text-3xl font-bold text-amber-400">${total.toFixed(2)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleCloseTab('cash')} className="p-4 rounded-xl bg-emerald-600/20 border border-emerald-500/20 hover:bg-emerald-600/30 text-center transition-all active:scale-[0.97]">
              <Banknote className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-emerald-300">Cash</p>
            </button>
            <button onClick={() => handleCloseTab('card')} className="p-4 rounded-xl bg-blue-600/20 border border-blue-500/20 hover:bg-blue-600/30 text-center transition-all active:scale-[0.97]">
              <CreditCard className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-blue-300">Card</p>
            </button>
            <button onClick={() => handleCloseTab('tab')} className="p-4 rounded-xl bg-amber-600/20 border border-amber-500/20 hover:bg-amber-600/30 text-center transition-all active:scale-[0.97]">
              <Receipt className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-amber-300">Invoice</p>
            </button>
            <button onClick={() => handleCloseTab('mug-club')} className="p-4 rounded-xl bg-purple-600/20 border border-purple-500/20 hover:bg-purple-600/30 text-center transition-all active:scale-[0.97]">
              <Crown className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-purple-300">Mug Club</p>
            </button>
          </div>
        </div>
      </Modal>

      {/* Discount Modal */}
      <Modal open={showDiscount} onClose={() => setShowDiscount(false)} title="Apply Discount" size="sm">
        <div className="space-y-2">
          {discounts.map(d => (
            <button
              key={d.label}
              onClick={() => d.label === 'Custom $' ? undefined : applyDiscount(d)}
              className="w-full text-left p-3 rounded-lg bg-brewery-800/40 border border-brewery-700/30 hover:border-amber-500/30 transition-all flex items-center justify-between"
            >
              <span className="text-sm text-brewery-200">{d.label}</span>
              {d.type === 'percent' && <Badge variant="amber">{d.value}%</Badge>}
            </button>
          ))}
          <div className="flex gap-2 pt-2">
            <input
              type="number"
              placeholder="Custom $ amount"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(e.target.value)}
              className="flex-1 bg-brewery-800/50 border border-brewery-700/30 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/40"
            />
            <button onClick={() => applyDiscount({ label: 'Custom $', type: 'fixed', value: 0 })} className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-500">Apply</button>
          </div>
        </div>
      </Modal>

      {/* Receipt Confirmation Overlay */}
      {showReceipt && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center animate-bounce-once">
            <div className="w-20 h-20 rounded-full bg-emerald-600/30 flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-brewery-50">Tab Closed!</p>
            <p className="text-lg text-emerald-400 font-semibold">${total.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
