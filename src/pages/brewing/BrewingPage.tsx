import { useState } from 'react';
import { FlaskConical, Thermometer, Droplets, Plus, CheckCircle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Modal from '../../components/ui/Modal';
import { useBrewery } from '../../context/BreweryContext';
import { useToast } from '../../components/ui/ToastProvider';
import { useData } from '../../context/DataContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const statusColors: Record<string, 'amber' | 'green' | 'blue' | 'purple' | 'gray' | 'red'> = {
  planned: 'gray', mashing: 'amber', boiling: 'amber', fermenting: 'amber', conditioning: 'blue', carbonating: 'purple', ready: 'green', packaged: 'green',
};

const tanks = [
  { id: 'FV-1', name: 'Fermenter 1', capacity: 7, status: 'in-use', batch: 'BH-2026-001' },
  { id: 'FV-2', name: 'Fermenter 2', capacity: 7, status: 'available', batch: null },
  { id: 'FV-3', name: 'Fermenter 3', capacity: 7, status: 'in-use', batch: 'BH-2026-014' },
  { id: 'FV-4', name: 'Fermenter 4', capacity: 14, status: 'available', batch: null },
  { id: 'BT-1', name: 'Brite Tank 1', capacity: 7, status: 'in-use', batch: 'BH-2026-015' },
  { id: 'BT-2', name: 'Brite Tank 2', capacity: 14, status: 'in-use', batch: 'BH-2026-016' },
  { id: 'BT-3', name: 'Brite Tank 3', capacity: 7, status: 'available', batch: null },
];

export default function BrewingPage() {
  const { beers } = useData();
  const { batches, addBatch } = useBrewery();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'batches' | 'tanks' | 'recipes'>('batches');
  const [showAddModal, setShowAddModal] = useState(false);
  const [beerName, setBeerName] = useState('');
  const [style, setStyle] = useState('');
  const [targetOG, setTargetOG] = useState('');
  const [volume, setVolume] = useState('');
  const [tankId, setTankId] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beerName.trim() || !style.trim()) return;

    const batchNumber = `BH-2026-${String(batches.length + 17).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    addBatch({
      batchNumber,
      beerId: `beer-${Date.now()}`,
      beerName: beerName.trim(),
      style: style.trim(),
      status: 'planned',
      brewDate: today,
      targetOG: parseFloat(targetOG) || 1.050,
      targetFG: parseFloat(targetOG) ? parseFloat(targetOG) * 0.75 : 1.012,
      tankId: tankId || 'TBD',
      volume: parseFloat(volume) || 7,
      notes: notes.trim(),
      gravityReadings: [],
      temperatureLog: [],
    });

    toast('success', `Batch ${batchNumber} (${beerName}) created successfully`);
    setShowAddModal(false);
    setBeerName('');
    setStyle('');
    setTargetOG('');
    setVolume('');
    setTankId('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><FlaskConical className="w-4 h-4 text-amber-400" /><span className="text-xs text-brewery-400">Active Batches</span></div>
          <p className="text-2xl font-bold text-brewery-50">{batches.filter(b => !['ready', 'packaged'].includes(b.status)).length}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Thermometer className="w-4 h-4 text-red-400" /><span className="text-xs text-brewery-400">Fermenting</span></div>
          <p className="text-2xl font-bold text-amber-400">{batches.filter(b => b.status === 'fermenting').length}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Droplets className="w-4 h-4 text-blue-400" /><span className="text-xs text-brewery-400">Tanks Available</span></div>
          <p className="text-2xl font-bold text-blue-400">{tanks.filter(t => t.status === 'available').length} / {tanks.length}</p>
        </div>
        <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-xs text-brewery-400">Ready to Package</span></div>
          <p className="text-2xl font-bold text-emerald-400">{batches.filter(b => b.status === 'ready').length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brewery-700/30">
        {(['batches', 'tanks', 'recipes'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === tab ? 'text-amber-400 border-amber-400' : 'text-brewery-400 border-transparent hover:text-brewery-200'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-amber-600/20">
              <Plus className="w-4 h-4" /> New Batch
            </button>
          </div>
          {batches.map(batch => (
            <div key={batch.id} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-brewery-100">{batch.beerName}</h3>
                    <Badge variant={statusColors[batch.status]}>{batch.status}</Badge>
                  </div>
                  <p className="text-xs text-brewery-400 mt-0.5">{batch.batchNumber} · {batch.tankId} · {batch.volume} bbl · Brewed {batch.brewDate}</p>
                </div>
                {batch.qualityScore && (
                  <div className={`flex items-center gap-2 mt-2 md:mt-0 px-3 py-1.5 rounded-lg ${batch.qualityScore >= 90 ? 'bg-emerald-600/20' : batch.qualityScore >= 80 ? 'bg-amber-600/20' : 'bg-red-600/20'}`}>
                    <span className="text-xs text-brewery-300">QC Score:</span>
                    <span className={`text-sm font-bold ${batch.qualityScore >= 90 ? 'text-emerald-400' : batch.qualityScore >= 80 ? 'text-amber-400' : 'text-red-400'}`}>{batch.qualityScore}</span>
                  </div>
                )}
              </div>

              {/* Gravity Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">Fermentation Progress</h4>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center"><p className="text-xs font-bold text-brewery-200">{batch.targetOG}</p><p className="text-[10px] text-brewery-500">Target OG</p></div>
                    <div className="text-center"><p className="text-xs font-bold text-amber-400">{batch.actualOG || '—'}</p><p className="text-[10px] text-brewery-500">Actual OG</p></div>
                    <div className="text-center"><p className="text-xs font-bold text-brewery-200">{batch.targetFG}</p><p className="text-[10px] text-brewery-500">Target FG</p></div>
                    <div className="text-center"><p className="text-xs font-bold text-emerald-400">{batch.actualFG || '—'}</p><p className="text-[10px] text-brewery-500">Actual FG</p></div>
                  </div>
                  {batch.actualOG && batch.gravityReadings.length > 0 && (
                    <ProgressBar
                      value={(batch.actualOG - batch.gravityReadings[batch.gravityReadings.length - 1].gravity)}
                      max={batch.actualOG - batch.targetFG}
                      color="green"
                      showLabel
                    />
                  )}
                </div>
                {batch.gravityReadings.length > 1 && (
                  <div>
                    <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3">Gravity Curve</h4>
                    <ResponsiveContainer width="100%" height={100}>
                      <LineChart data={batch.gravityReadings}>
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#c08a3e' }} axisLine={false} tickLine={false} tickFormatter={v => v.slice(5)} />
                        <YAxis tick={{ fontSize: 9, fill: '#c08a3e' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ background: '#24180b', border: '1px solid #5c3e1940', borderRadius: 8, fontSize: 11 }} />
                        <Line type="monotone" dataKey="gravity" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {batch.notes && <p className="text-xs text-brewery-300 mt-3 pt-3 border-t border-brewery-700/20 italic">"{batch.notes}"</p>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tanks' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tanks.map(tank => {
            const batch = batches.find(b => b.batchNumber === tank.batch);
            return (
              <div key={tank.id} className={`bg-brewery-900/80 border rounded-xl p-5 ${tank.status === 'available' ? 'border-emerald-500/20' : 'border-brewery-700/30'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${tank.status === 'available' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                    <h3 className="text-sm font-semibold text-brewery-100">{tank.name}</h3>
                  </div>
                  <span className="text-xs text-brewery-400">{tank.capacity} bbl</span>
                </div>
                {batch ? (
                  <div className="p-3 rounded-lg bg-brewery-800/30">
                    <p className="text-xs font-medium text-brewery-200">{batch.beerName}</p>
                    <p className="text-[10px] text-brewery-400">{batch.batchNumber}</p>
                    <Badge variant={statusColors[batch.status]}>{batch.status}</Badge>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/10 text-center">
                    <p className="text-xs text-emerald-400 font-medium">Available</p>
                    <p className="text-[10px] text-emerald-500">Ready for next batch</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {beers.slice(0, 8).map(beer => (
            <div key={beer.id} className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/20 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-brewery-100">{beer.name}</h3>
                <Badge variant={beer.category === 'flagship' ? 'amber' : beer.category === 'seasonal' ? 'green' : beer.category === 'limited' ? 'purple' : 'blue'}>
                  {beer.category}
                </Badge>
              </div>
              <p className="text-xs text-brewery-400 mb-3">{beer.style}</p>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 rounded-lg bg-brewery-800/30"><p className="text-xs font-bold text-brewery-200">{beer.abv}%</p><p className="text-[10px] text-brewery-500">ABV</p></div>
                <div className="text-center p-2 rounded-lg bg-brewery-800/30"><p className="text-xs font-bold text-brewery-200">{beer.ibu}</p><p className="text-[10px] text-brewery-500">IBU</p></div>
                <div className="text-center p-2 rounded-lg bg-brewery-800/30"><p className="text-xs font-bold text-brewery-200">{beer.srm}</p><p className="text-[10px] text-brewery-500">SRM</p></div>
                <div className="text-center p-2 rounded-lg bg-brewery-800/30"><p className="text-xs font-bold text-amber-400">{beer.rating || '—'}</p><p className="text-[10px] text-brewery-500">Rating</p></div>
              </div>
              <p className="text-xs text-brewery-300 mt-3 line-clamp-2">{beer.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* New Batch Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="New Brew Batch">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Beer Name *</label>
            <input type="text" value={beerName} onChange={e => setBeerName(e.target.value)} required
              placeholder="e.g. Hop Beard IPA"
              className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Style *</label>
            <input type="text" value={style} onChange={e => setStyle(e.target.value)} required
              placeholder="e.g. American IPA"
              className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Target OG</label>
              <input type="text" value={targetOG} onChange={e => setTargetOG(e.target.value)}
                placeholder="1.065"
                className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Volume (bbl)</label>
              <input type="text" value={volume} onChange={e => setVolume(e.target.value)}
                placeholder="7"
                className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Assign Tank</label>
            <select value={tankId} onChange={e => setTankId(e.target.value)}
              className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30">
              <option value="">Select tank...</option>
              {tanks.map(t => (
                <option key={t.id} value={t.id} disabled={t.status !== 'available'}>
                  {t.name} ({t.capacity} bbl) {t.status !== 'available' ? '- In Use' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brewery-300 mb-1.5">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Brew day notes, recipe adjustments, etc."
              className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-2 text-sm text-brewery-100 placeholder-brewery-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm font-medium text-brewery-300 hover:text-brewery-100 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow-lg shadow-amber-600/20 transition-colors">
              Create Batch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
