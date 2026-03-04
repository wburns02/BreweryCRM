import { useState } from 'react';
import { UtensilsCrossed, TrendingUp, Baby, Eye } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { menuItems } from '../../data/mockData';

const categories = ['all', 'appetizer', 'entree', 'side', 'dessert', 'kids', 'beverage-na', 'merchandise'] as const;
const categoryLabels: Record<string, string> = { all: 'All Items', appetizer: 'Appetizers', entree: 'Entrees', side: 'Sides', dessert: 'Desserts', kids: 'Kids Menu', 'beverage-na': 'NA Beverages', merchandise: 'Merchandise' };

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter(m => m.category === activeCategory);
  const avgMargin = filtered.length > 0 ? Math.round(filtered.reduce((s, m) => s + ((m.price - m.cost) / m.price) * 100, 0) / filtered.length) : 0;
  const totalItems = menuItems.length;
  const available = menuItems.filter(m => m.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><UtensilsCrossed className="w-4 h-4 text-amber-400" /><span className="text-xs text-brewery-400">Menu Items</span></div>
          <p className="text-2xl font-bold text-brewery-50">{totalItems}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Eye className="w-4 h-4 text-emerald-400" /><span className="text-xs text-brewery-400">Available</span></div>
          <p className="text-2xl font-bold text-emerald-400">{available}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-blue-400" /><span className="text-xs text-brewery-400">Avg Margin</span></div>
          <p className="text-2xl font-bold text-blue-400">{avgMargin}%</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Baby className="w-4 h-4 text-purple-400" /><span className="text-xs text-brewery-400">Kids Items</span></div>
          <p className="text-2xl font-bold text-purple-400">{menuItems.filter(m => m.category === 'kids').length}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${activeCategory === cat ? 'bg-amber-600/20 text-amber-300 border-amber-500/30' : 'bg-brewery-800/40 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'}`}>
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(item => {
          const margin = Math.round(((item.price - item.cost) / item.price) * 100);
          return (
            <div key={item.id} className={`bg-brewery-900/80 border rounded-xl p-5 transition-all ${item.isAvailable ? 'border-brewery-700/30 hover:border-amber-500/20' : 'border-red-500/20 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-brewery-100">{item.name}</h3>
                    {!item.isAvailable && <Badge variant="red">86'd</Badge>}
                  </div>
                  <p className="text-[10px] text-brewery-400 capitalize">{item.category.replace('-', ' ')}</p>
                </div>
                <span className="text-lg font-bold text-amber-400">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-brewery-300 mb-3">{item.description}</p>

              {/* Margins */}
              <div className="flex items-center gap-4 mb-3 p-2 rounded-lg bg-brewery-800/30">
                <div className="text-center flex-1">
                  <p className="text-[10px] text-brewery-500">Cost</p>
                  <p className="text-xs font-medium text-brewery-200">${item.cost.toFixed(2)}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] text-brewery-500">Margin</p>
                  <p className={`text-xs font-bold ${margin >= 70 ? 'text-emerald-400' : margin >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{margin}%</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] text-brewery-500">Popularity</p>
                  <p className="text-xs font-medium text-brewery-200">{item.popularity}/100</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {item.dietaryTags.map(tag => (
                  <Badge key={tag} variant="green">{tag}</Badge>
                ))}
                {item.allergens.map(a => (
                  <Badge key={a} variant="red">{a}</Badge>
                ))}
                {item.isKidsFriendly && <Badge variant="blue">Kid Friendly</Badge>}
              </div>

              {/* Menu Engineering Classification */}
              <div className="mt-3 pt-3 border-t border-brewery-700/20">
                {item.popularity >= 80 && margin >= 65 ? (
                  <span className="text-[10px] font-medium text-emerald-400">⭐ Star — High Profit, High Popularity</span>
                ) : item.popularity >= 80 && margin < 65 ? (
                  <span className="text-[10px] font-medium text-blue-400">🐴 Plowhorse — Low Profit, High Popularity</span>
                ) : item.popularity < 80 && margin >= 65 ? (
                  <span className="text-[10px] font-medium text-amber-400">🧩 Puzzle — High Profit, Low Popularity</span>
                ) : (
                  <span className="text-[10px] font-medium text-brewery-500">🐕 Dog — Low Profit, Low Popularity</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
