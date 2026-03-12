import { useState } from 'react';
import { GlassWater, AlertTriangle, DollarSign, Droplets, Edit2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Modal from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';
import type { Beer } from '../../types';

export default function TapsPage() {
  const { tapLines, beers } = useData();
  const { updateTapLine } = useBrewery();
  const { toast } = useToast();
  const [selectedBeer, setSelectedBeer] = useState<Beer | null>(null);
  const [selectedTapInfo, setSelectedTapInfo] = useState<{ tapNumber: number; beerName: string; style: string; abv: number; kegLevel: number } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Edit tap state
  const [editTapNumber, setEditTapNumber] = useState<number | null>(null);
  const [editBeerId, setEditBeerId] = useState('');
  const [editKegLevel, setEditKegLevel] = useState(100);
  const [editKegSize, setEditKegSize] = useState<'1/2' | '1/4' | '1/6'>('1/2');
  const [editStatus, setEditStatus] = useState<'active' | 'empty' | 'cleaning' | 'reserved'>('active');

  const activeTaps = tapLines.filter(t => t.status === 'active');
  const totalRevenue = activeTaps.reduce((s, t) => s + t.revenueToday, 0);
  const totalPours = activeTaps.reduce((s, t) => s + t.totalPours, 0);
  const lowKegs = activeTaps.filter(t => t.kegLevel < 25);

  const openEditModal = (tapNumber: number) => {
    const tap = tapLines.find(t => t.tapNumber === tapNumber);
    if (!tap) return;
    setEditTapNumber(tapNumber);
    setEditBeerId(tap.beerId || '');
    setEditKegLevel(tap.kegLevel);
    setEditKegSize(tap.kegSize);
    setEditStatus(tap.status);
  };

  const handleEditSave = () => {
    if (editTapNumber === null) return;
    const beer = beers.find(b => b.id === editBeerId);
    updateTapLine(editTapNumber, {
      beerId: editBeerId || undefined,
      beerName: beer?.name,
      style: beer?.style,
      abv: beer?.abv,
      ibu: beer?.ibu,
      kegLevel: editKegLevel,
      kegSize: editKegSize,
      status: editStatus,
      tappedDate: new Date().toISOString().split('T')[0],
    });
    toast('success', `Tap #${editTapNumber} updated`);
    setEditTapNumber(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <GlassWater className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-brewery-400">Active Taps</span>
          </div>
          <p className="text-2xl font-bold text-brewery-50">{activeTaps.length} / 13</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-brewery-400">Today's Draft Revenue</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-brewery-400">Lifetime Pours</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{totalPours}</p>
        </div>
        <div className={`bg-brewery-900/80 border rounded-xl p-4 ${lowKegs.length > 0 ? 'border-red-500/30' : 'border-brewery-700/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-4 h-4 ${lowKegs.length > 0 ? 'text-red-400' : 'text-brewery-400'}`} />
            <span className="text-xs text-brewery-400">Low Kegs</span>
          </div>
          <p className={`text-2xl font-bold ${lowKegs.length > 0 ? 'text-red-400' : 'text-brewery-50'}`}>{lowKegs.length}</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-amber-600/20 text-amber-300' : 'text-brewery-400 hover:text-brewery-200'}`}>Grid View</button>
        <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-amber-600/20 text-amber-300' : 'text-brewery-400 hover:text-brewery-200'}`}>List View</button>
      </div>

      {/* Tap Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tapLines.map((tap) => {
            const beer = beers.find(b => b.id === tap.beerId);
            return (
              <div
                key={tap.tapNumber}
                className={`bg-brewery-900/80 border rounded-xl p-5 transition-all duration-300 hover:shadow-lg group ${
                  tap.kegLevel < 15 ? 'border-red-500/40 hover:border-red-400/60 hover:shadow-red-500/10' :
                  tap.kegLevel < 35 ? 'border-amber-500/30 hover:border-amber-400/60 hover:shadow-amber-500/10' :
                  'border-brewery-700/30 hover:border-amber-500/20 hover:shadow-amber-500/5'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex items-center gap-2 cursor-pointer flex-1"
                    onClick={() => beer ? setSelectedBeer(beer) : setSelectedTapInfo({ tapNumber: tap.tapNumber, beerName: tap.beerName || 'Unknown', style: tap.style || '', abv: tap.abv || 0, kegLevel: tap.kegLevel })}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      tap.status === 'active' ? 'bg-amber-600/20 text-amber-400' : 'bg-brewery-700/40 text-brewery-500'
                    }`}>
                      {tap.tapNumber}
                    </div>
                    <div>
                      {beer?.isNonAlcoholic && <Badge variant="blue">NA</Badge>}
                      {beer?.category === 'limited' && <Badge variant="purple">Limited</Badge>}
                      {beer?.category === 'seasonal' && <Badge variant="green">Seasonal</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brewery-400">{tap.abv}%</span>
                    <button
                      onClick={e => { e.stopPropagation(); openEditModal(tap.tapNumber); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-brewery-700/40 hover:bg-amber-600/20 text-brewery-400 hover:text-amber-300 transition-all"
                      title="Edit tap"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => beer ? setSelectedBeer(beer) : setSelectedTapInfo({ tapNumber: tap.tapNumber, beerName: tap.beerName || 'Unknown', style: tap.style || '', abv: tap.abv || 0, kegLevel: tap.kegLevel })}
                >
                  <h3 className="text-sm font-semibold text-brewery-100 mb-0.5">{tap.beerName || 'Empty'}</h3>
                  <p className="text-[10px] text-brewery-400 mb-3">{tap.style}</p>

                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-brewery-500 mb-1">
                      <span>Keg Level</span>
                      <span className={`font-medium ${tap.kegLevel < 25 ? 'text-red-400' : 'text-brewery-300'}`}>{tap.kegLevel}%</span>
                    </div>
                    <ProgressBar value={tap.kegLevel} size="md" color={tap.kegLevel < 25 ? 'red' : tap.kegLevel < 50 ? 'amber' : 'green'} />
                  </div>

                  <div className="flex justify-between text-[10px] mt-3 pt-3 border-t border-brewery-700/20">
                    <span className="text-brewery-400">{tap.totalPours} pours</span>
                    <span className="text-emerald-400 font-medium">${tap.revenueToday.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brewery-700/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Tap</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Beer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">Style</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase">ABV</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brewery-400 uppercase w-32">Keg Level</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-brewery-400 uppercase">Pours</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-brewery-400 uppercase">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-brewery-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brewery-700/20">
              {tapLines.map(tap => (
                <tr key={tap.tapNumber} className="hover:bg-brewery-800/30 transition-colors cursor-pointer" onClick={() => { const b = beers.find(b2 => b2.id === tap.beerId); b ? setSelectedBeer(b) : setSelectedTapInfo({ tapNumber: tap.tapNumber, beerName: tap.beerName || 'Unknown', style: tap.style || '', abv: tap.abv || 0, kegLevel: tap.kegLevel }); }}>
                  <td className="px-4 py-3 text-sm font-bold text-amber-400">#{tap.tapNumber}</td>
                  <td className="px-4 py-3 text-sm text-brewery-100">{tap.beerName}</td>
                  <td className="px-4 py-3 text-sm text-brewery-300">{tap.style}</td>
                  <td className="px-4 py-3 text-sm text-brewery-300">{tap.abv}%</td>
                  <td className="px-4 py-3"><ProgressBar value={tap.kegLevel} showLabel size="sm" /></td>
                  <td className="px-4 py-3 text-sm text-brewery-200 text-right">{tap.totalPours}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400 text-right font-medium">${tap.revenueToday.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={e => { e.stopPropagation(); openEditModal(tap.tapNumber); }}
                      className="p-1.5 rounded-lg bg-brewery-700/40 hover:bg-amber-600/20 text-brewery-400 hover:text-amber-300 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Tap Modal */}
      <Modal open={editTapNumber !== null} onClose={() => setEditTapNumber(null)} title={`Edit Tap #${editTapNumber}`} size="md">
        {editTapNumber !== null && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1.5">Beer on Tap</label>
              <select
                value={editBeerId}
                onChange={e => setEditBeerId(e.target.value)}
                className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
              >
                <option value="">— Empty Tap —</option>
                {beers.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.style}, {b.abv}%)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brewery-300 mb-1.5">Keg Level (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editKegLevel}
                  onChange={e => setEditKegLevel(Number(e.target.value))}
                  className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brewery-300 mb-1.5">Keg Size</label>
                <select
                  value={editKegSize}
                  onChange={e => setEditKegSize(e.target.value as '1/2' | '1/4' | '1/6')}
                  className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                >
                  <option value="1/2">½ Barrel (15.5 gal)</option>
                  <option value="1/4">¼ Barrel (7.75 gal)</option>
                  <option value="1/6">⅙ Barrel (5.16 gal)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brewery-300 mb-1.5">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['active', 'empty', 'cleaning', 'reserved'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setEditStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      editStatus === s
                        ? 'bg-amber-600/20 text-amber-300 border-amber-500/30'
                        : 'bg-brewery-800/40 text-brewery-400 border-brewery-700/30 hover:text-brewery-200'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-brewery-700/30">
              <button
                onClick={() => setEditTapNumber(null)}
                className="px-4 py-2 text-sm font-medium text-brewery-300 hover:text-brewery-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow-lg shadow-amber-600/20 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Tap Info Modal (when beer details unavailable) */}
      <Modal open={!!selectedTapInfo} onClose={() => setSelectedTapInfo(null)} title={`Tap #${selectedTapInfo?.tapNumber}`} size="sm">
        {selectedTapInfo && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brewery-100">{selectedTapInfo.beerName}</h3>
            <p className="text-sm text-brewery-400">{selectedTapInfo.style}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-brewery-800/30">
                <p className="text-xl font-bold text-amber-400">{selectedTapInfo.abv}%</p>
                <p className="text-[10px] text-brewery-400">ABV</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-brewery-800/30">
                <p className="text-xl font-bold text-brewery-100">{selectedTapInfo.kegLevel}%</p>
                <p className="text-[10px] text-brewery-400">Keg Level</p>
              </div>
            </div>
            <button
              onClick={() => { setSelectedTapInfo(null); openEditModal(selectedTapInfo.tapNumber); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/30 text-amber-300 rounded-lg text-sm font-semibold transition-all"
            >
              <Edit2 className="w-4 h-4" /> Edit Tap
            </button>
          </div>
        )}
      </Modal>

      {/* Beer Detail Modal */}
      <Modal open={!!selectedBeer} onClose={() => setSelectedBeer(null)} title={selectedBeer?.name || ''} size="lg">
        {selectedBeer && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="amber">{selectedBeer.style}</Badge>
              <Badge variant="blue">{selectedBeer.abv}% ABV</Badge>
              <Badge variant="green">{selectedBeer.ibu} IBU</Badge>
              <Badge variant="purple">{selectedBeer.category}</Badge>
              {selectedBeer.isNonAlcoholic && <Badge variant="blue">Non-Alcoholic</Badge>}
            </div>
            <p className="text-sm text-brewery-200">{selectedBeer.description}</p>
            <div>
              <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Tasting Notes</h4>
              <p className="text-sm text-brewery-200">{selectedBeer.tastingNotes}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Food Pairings</h4>
              <div className="flex flex-wrap gap-2">
                {selectedBeer.foodPairings.map(fp => <Badge key={fp} variant="gray">{fp}</Badge>)}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-brewery-800/30">
                <p className="text-xl font-bold text-amber-400">{selectedBeer.totalPours.toLocaleString()}</p>
                <p className="text-[10px] text-brewery-400">Total Pours</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-brewery-800/30">
                <p className="text-xl font-bold text-brewery-100">{selectedBeer.rating}</p>
                <p className="text-[10px] text-brewery-400">Rating</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-brewery-800/30">
                <p className="text-xl font-bold text-brewery-100">{selectedBeer.kegLevel}%</p>
                <p className="text-[10px] text-brewery-400">Keg Level</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
