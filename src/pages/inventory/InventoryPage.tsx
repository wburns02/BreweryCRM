import { useState } from 'react';
import { Warehouse, AlertTriangle, Package, ShoppingCart } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import { inventoryItems } from '../../data/mockData';

const categories = ['all', 'grain', 'hops', 'yeast', 'adjunct', 'chemical', 'packaging', 'food', 'na-beverage', 'merchandise', 'supplies'] as const;

export default function InventoryPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const filtered = activeCategory === 'all' ? inventoryItems : inventoryItems.filter(i => i.category === activeCategory);
  const lowStock = inventoryItems.filter(i => i.currentStock <= i.reorderPoint);
  const totalValue = inventoryItems.reduce((s, i) => s + (i.currentStock * i.costPerUnit), 0);

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

      {/* Category Filter */}
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
                <button className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg font-medium">Reorder</button>
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
