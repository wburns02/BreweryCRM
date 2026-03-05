import { useState } from 'react';
import { UtensilsCrossed, TrendingUp, Baby, Eye, Plus, Pencil, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';

const categories = ['all', 'appetizer', 'entree', 'side', 'dessert', 'kids', 'beverage-na', 'merchandise'] as const;
const editableCategories = ['appetizer', 'entree', 'side', 'dessert', 'kids', 'beverage-na', 'merchandise'] as const;
const categoryLabels: Record<string, string> = { all: 'All Items', appetizer: 'Appetizers', entree: 'Entrees', side: 'Sides', dessert: 'Desserts', kids: 'Kids Menu', 'beverage-na': 'NA Beverages', merchandise: 'Merchandise' };

type MenuCategory = 'appetizer' | 'entree' | 'side' | 'dessert' | 'kids' | 'beverage-na' | 'merchandise';

interface FormState {
  name: string;
  description: string;
  category: MenuCategory;
  price: string;
  cost: string;
  isAvailable: boolean;
  allergens: string;
  dietaryTags: string;
  isKidsFriendly: boolean;
  popularity: string;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  category: 'entree',
  price: '',
  cost: '',
  isAvailable: true,
  allergens: '',
  dietaryTags: '',
  isKidsFriendly: false,
  popularity: '50',
};

const inputClass = "w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30";

export default function MenuPage() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useBrewery();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter(m => m.category === activeCategory);
  const avgMargin = filtered.length > 0 ? Math.round(filtered.reduce((s, m) => s + ((m.price - m.cost) / m.price) * 100, 0) / filtered.length) : 0;
  const totalItems = menuItems.length;
  const available = menuItems.filter(m => m.isAvailable).length;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item: typeof menuItems[number]) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      category: item.category as MenuCategory,
      price: String(item.price),
      cost: String(item.cost),
      isAvailable: item.isAvailable,
      allergens: item.allergens.join(', '),
      dietaryTags: item.dietaryTags.join(', '),
      isKidsFriendly: item.isKidsFriendly,
      popularity: String(item.popularity),
    });
    setShowModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from the menu?`)) {
      deleteMenuItem(id);
      toast('success', `${name} removed from menu`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parseList = (s: string) => s.split(',').map(t => t.trim()).filter(Boolean);
    const data = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: parseFloat(form.price) || 0,
      cost: parseFloat(form.cost) || 0,
      isAvailable: form.isAvailable,
      allergens: parseList(form.allergens),
      dietaryTags: parseList(form.dietaryTags),
      isKidsFriendly: form.isKidsFriendly,
      popularity: Math.min(100, Math.max(0, parseInt(form.popularity) || 0)),
    };

    if (editingId) {
      updateMenuItem(editingId, data);
      toast('success', `${data.name} has been updated`);
    } else {
      addMenuItem(data);
      toast('success', `${data.name} added to menu`);
    }
    setShowModal(false);
  };

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

      {/* Category Filter + Add Button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${activeCategory === cat ? 'bg-amber-600/20 text-amber-300 border-amber-500/30' : 'bg-brewery-800/40 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'}`}>
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Add Item
        </button>
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
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(item)} className="p-1 text-brewery-400 hover:text-amber-400 transition-colors" title="Edit item">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item.id, item.name)} className="p-1 text-brewery-400 hover:text-red-400 transition-colors" title="Delete item">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-lg font-bold text-amber-400">${item.price.toFixed(2)}</span>
                </div>
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

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Menu Item' : 'Add Menu Item'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brewery-300 mb-1">Name</label>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Item name" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-brewery-300 mb-1">Description</label>
            <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" rows={2} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as MenuCategory }))} className={inputClass}>
                {editableCategories.map(cat => (
                  <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1">Popularity (0-100)</label>
              <input type="number" min={0} max={100} required value={form.popularity} onChange={e => setForm(f => ({ ...f, popularity: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1">Price ($)</label>
              <input type="number" step="0.01" min={0} required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1">Cost ($)</label>
              <input type="number" step="0.01" min={0} required value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="0.00" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brewery-300 mb-1">Allergens <span className="text-brewery-500">(comma-separated)</span></label>
            <input type="text" value={form.allergens} onChange={e => setForm(f => ({ ...f, allergens: e.target.value }))} placeholder="gluten, dairy, nuts" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-brewery-300 mb-1">Dietary Tags <span className="text-brewery-500">(comma-separated)</span></label>
            <input type="text" value={form.dietaryTags} onChange={e => setForm(f => ({ ...f, dietaryTags: e.target.value }))} placeholder="vegan, gf, organic" className={inputClass} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-brewery-200 cursor-pointer">
              <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))} className="rounded border-brewery-600 bg-brewery-800 text-amber-500 focus:ring-amber-500/30" />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-brewery-200 cursor-pointer">
              <input type="checkbox" checked={form.isKidsFriendly} onChange={e => setForm(f => ({ ...f, isKidsFriendly: e.target.checked }))} className="rounded border-brewery-600 bg-brewery-800 text-amber-500 focus:ring-amber-500/30" />
              Kids Friendly
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-brewery-300 hover:text-brewery-100 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors">
              {editingId ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
