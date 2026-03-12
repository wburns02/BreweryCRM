import { useState } from 'react';
import { Warehouse, AlertTriangle, Package, ShoppingCart, Plus, Trash2, SlidersHorizontal } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Modal from '../../components/ui/Modal';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';

const categories = ['all', 'grain', 'hops', 'yeast', 'adjunct', 'chemical', 'packaging', 'food', 'na-beverage', 'merchandise', 'supplies'] as const;

const CATEGORY_OPTIONS = ['grain', 'hops', 'yeast', 'adjunct', 'chemical', 'packaging', 'food', 'na-beverage', 'merchandise', 'supplies'] as const;

const emptyForm = {
  name: '',
  category: 'grain' as typeof CATEGORY_OPTIONS[number],
  currentStock: 0,
  unit: '',
  parLevel: 0,
  reorderPoint: 0,
  costPerUnit: 0,
  supplier: '',
  location: '',
};

export default function InventoryPage() {
  const { inventoryItems, updateInventoryItem, addInventoryItem, deleteInventoryItem } = useBrewery();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [adjustItem, setAdjustItem] = useState<typeof inventoryItems[0] | null>(null);
  const [adjustMode, setAdjustMode] = useState<'use' | 'receive'>('use');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    const delta = parseFloat(adjustAmount) || 0;
    if (delta <= 0) { toast('error', 'Enter a positive amount'); return; }
    const change = adjustMode === 'use' ? -delta : delta;
    const newStock = Math.max(0, adjustItem.currentStock + change);
    updateInventoryItem(adjustItem.id, { currentStock: newStock });
    toast('success', `${adjustItem.name}: ${adjustMode === 'use' ? 'Used' : 'Received'} ${delta} ${adjustItem.unit} → ${newStock} remaining`);
    setAdjustItem(null);
    setAdjustAmount('');
    setAdjustNote('');
  };
  const filtered = activeCategory === 'all' ? inventoryItems : inventoryItems.filter(i => i.category === activeCategory);
  const lowStock = inventoryItems.filter(i => i.currentStock <= i.reorderPoint);
  const totalValue = inventoryItems.reduce((s, i) => s + (i.currentStock * i.costPerUnit), 0);

  const handleReorder = (item: typeof inventoryItems[0]) => {
    updateInventoryItem(item.id, { currentStock: item.parLevel });
    toast('success', `${item.name} restocked to par level (${item.parLevel} ${item.unit})`);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.unit.trim()) {
      toast('error', 'Name and unit are required');
      return;
    }
    if (Number(form.parLevel) <= 0) {
      toast('error', 'Par level must be greater than 0 — it prevents NaN display in stock tracking');
      return;
    }
    if (Number(form.reorderPoint) >= Number(form.parLevel)) {
      toast('error', 'Reorder point must be less than par level');
      return;
    }
    addInventoryItem({
      name: form.name.trim(),
      category: form.category,
      currentStock: Number(form.currentStock),
      unit: form.unit.trim(),
      parLevel: Number(form.parLevel),
      reorderPoint: Number(form.reorderPoint),
      costPerUnit: Number(form.costPerUnit),
      supplier: form.supplier.trim(),
      location: form.location.trim(),
    });
    toast('success', `${form.name.trim()} added to inventory`);
    setForm(emptyForm);
    setShowAddModal(false);
  };

  const handleDelete = (item: typeof inventoryItems[0]) => {
    if (window.confirm(`Delete "${item.name}" from inventory? This cannot be undone.`)) {
      deleteInventoryItem(item.id);
      toast('success', `${item.name} removed from inventory`);
    }
  };

  const inputClassName = "w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Package className="w-4 h-4 text-blue-400" /><span className="text-xs text-brewery-400">Total SKUs</span></div>
          <p className="text-2xl font-bold text-brewery-50">{inventoryItems.length}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Warehouse className="w-4 h-4 text-emerald-400" /><span className="text-xs text-brewery-400">Inventory Value</span></div>
          <p className="text-2xl font-bold text-emerald-400">${totalValue.toLocaleString()}</p>
        </div>
        <div className={`bg-brewery-900/80 border rounded-xl p-4 ${lowStock.length > 0 ? 'border-red-500/30' : 'border-brewery-700/30'}`}>
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className={`w-4 h-4 ${lowStock.length > 0 ? 'text-red-400' : 'text-brewery-400'}`} /><span className="text-xs text-brewery-400">Low Stock Items</span></div>
          <p className={`text-2xl font-bold ${lowStock.length > 0 ? 'text-red-400' : 'text-brewery-50'}`}>{lowStock.length}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><ShoppingCart className="w-4 h-4 text-amber-400" /><span className="text-xs text-brewery-400">Need Reorder</span></div>
          <p className="text-2xl font-bold text-amber-400">{lowStock.length}</p>
        </div>
      </div>

      {/* Add Item Button + Category Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${activeCategory === cat ? 'bg-amber-600/20 text-amber-300 border-amber-500/30' : 'bg-brewery-800/40 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'}`}>
            {cat === 'all' ? 'All' : cat.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-red-300">Low Stock Alert — Reorder Needed</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {lowStock.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-brewery-900/50">
                <div>
                  <p className="text-xs font-medium text-brewery-100">{item.name}</p>
                  <p className="text-[10px] text-brewery-400">{item.currentStock} {item.unit} left (par: {item.parLevel})</p>
                </div>
                <button onClick={() => handleReorder(item)} className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg font-medium">Reorder</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brewery-700/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase w-40">Stock Level</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-brewery-400 uppercase">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-brewery-400 uppercase">Par</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-brewery-400 uppercase">Cost/Unit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Location</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-brewery-400 uppercase w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brewery-700/20">
              {filtered.map(item => {
                const isLow = item.currentStock <= item.reorderPoint;
                return (
                  <tr key={item.id} className={`hover:bg-brewery-800/30 transition-colors ${isLow ? 'bg-red-900/10' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-brewery-100">{item.name}</p>
                      {item.expirationDate && <p className="text-[10px] text-brewery-500">Expires: {item.expirationDate}</p>}
                    </td>
                    <td className="px-4 py-3"><Badge variant="gray">{item.category}</Badge></td>
                    <td className="px-4 py-3"><ProgressBar value={item.currentStock} max={item.parLevel} showLabel size="sm" color={isLow ? 'red' : 'green'} /></td>
                    <td className="px-4 py-3 text-sm text-brewery-200 text-right">{item.currentStock} {item.unit}</td>
                    <td className="px-4 py-3 text-sm text-brewery-400 text-right">{item.parLevel} {item.unit}</td>
                    <td className="px-4 py-3 text-sm text-brewery-200 text-right">${item.costPerUnit.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-brewery-300">{item.supplier}</td>
                    <td className="px-4 py-3 text-sm text-brewery-400">{item.location}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <button
                          onClick={() => { setAdjustItem(item); setAdjustMode('use'); setAdjustAmount(''); }}
                          className="p-1.5 rounded-lg text-brewery-500 hover:text-amber-400 hover:bg-amber-900/20 transition-colors"
                          title={`Adjust stock for ${item.name}`}
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-brewery-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                          title={`Delete ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Item Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Inventory Item">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brewery-300 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Cascade Hops"
              className={inputClassName}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as typeof CATEGORY_OPTIONS[number] }))}
                className={inputClassName}
              >
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1">Unit *</label>
              <input
                type="text"
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                placeholder="e.g. lbs, oz, each"
                className={inputClassName}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1">Current Stock</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.currentStock}
                onChange={e => setForm(f => ({ ...f, currentStock: parseFloat(e.target.value) || 0 }))}
                className={inputClassName}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1">Par Level</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.parLevel}
                onChange={e => setForm(f => ({ ...f, parLevel: parseFloat(e.target.value) || 0 }))}
                className={inputClassName}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1">Reorder Point</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.reorderPoint}
                onChange={e => setForm(f => ({ ...f, reorderPoint: parseFloat(e.target.value) || 0 }))}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1">Cost Per Unit ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.costPerUnit}
                onChange={e => setForm(f => ({ ...f, costPerUnit: parseFloat(e.target.value) || 0 }))}
                className={inputClassName}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1">Supplier</label>
              <input
                type="text"
                value={form.supplier}
                onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                placeholder="e.g. BSG CraftBrewing"
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brewery-300 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Walk-in Cooler, Dry Storage"
              className={inputClassName}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm text-brewery-300 hover:text-brewery-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal open={!!adjustItem} onClose={() => setAdjustItem(null)} title={`Adjust Stock — ${adjustItem?.name ?? ''}`} size="sm">
        {adjustItem && (
          <form onSubmit={handleAdjust} className="space-y-4">
            <div className="p-3 rounded-xl bg-brewery-800/40 flex items-center justify-between">
              <div>
                <p className="text-xs text-brewery-400">Current Stock</p>
                <p className="text-xl font-bold text-brewery-100">{adjustItem.currentStock} <span className="text-sm font-normal text-brewery-400">{adjustItem.unit}</span></p>
              </div>
              <div>
                <p className="text-xs text-brewery-400 text-right">Par Level</p>
                <p className="text-xl font-bold text-brewery-400 text-right">{adjustItem.parLevel} <span className="text-sm font-normal">{adjustItem.unit}</span></p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-brewery-400 mb-2">Adjustment Type</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button"
                  onClick={() => setAdjustMode('use')}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-all ${adjustMode === 'use' ? 'bg-red-900/30 border-red-500/40 text-red-300' : 'bg-brewery-800/40 border-brewery-700/30 text-brewery-400'}`}>
                  Use / Remove
                </button>
                <button type="button"
                  onClick={() => setAdjustMode('receive')}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-all ${adjustMode === 'receive' ? 'bg-emerald-900/30 border-emerald-500/40 text-emerald-300' : 'bg-brewery-800/40 border-brewery-700/30 text-brewery-400'}`}>
                  Receive / Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brewery-300 mb-1.5">
                Amount ({adjustItem.unit})
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={adjustAmount}
                onChange={e => setAdjustAmount(e.target.value)}
                placeholder={`e.g. 5 ${adjustItem.unit}`}
                required
                className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                autoFocus
              />
              {adjustAmount && (
                <p className="text-xs mt-1 font-medium">
                  New stock: <span className={adjustMode === 'use' ? 'text-red-400' : 'text-emerald-400'}>
                    {Math.max(0, adjustItem.currentStock + (adjustMode === 'use' ? -1 : 1) * (parseFloat(adjustAmount) || 0)).toFixed(1)} {adjustItem.unit}
                  </span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Note (optional)</label>
              <input
                type="text"
                value={adjustNote}
                onChange={e => setAdjustNote(e.target.value)}
                placeholder="e.g. Batch 47, spillage, delivery..."
                className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setAdjustItem(null)} className="px-4 py-2 text-sm font-medium text-brewery-300 hover:text-brewery-100 transition-colors">Cancel</button>
              <button type="submit"
                className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${adjustMode === 'use' ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                {adjustMode === 'use' ? 'Record Usage' : 'Receive Stock'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
