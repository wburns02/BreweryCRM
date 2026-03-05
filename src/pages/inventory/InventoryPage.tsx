import { useState } from 'react';
import { Warehouse, AlertTriangle, Package, ShoppingCart, Plus, Trash2 } from 'lucide-react';
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
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg text-brewery-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                        title={`Delete ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
    </div>
  );
}
