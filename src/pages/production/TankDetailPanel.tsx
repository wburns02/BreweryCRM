import { useState } from 'react';
import { Thermometer, Gauge, Droplets, Beaker, ClipboardCheck } from 'lucide-react';
import SlidePanel from '../../components/ui/SlidePanel';
import Badge from '../../components/ui/Badge';
import GravityChart from './GravityChart';
import QualityBadge from './QualityBadge';
import type { FermentationVessel, QualityCheckEntry } from '../../types';
import { api } from '../../api/client';
import { useToast } from '../../components/ui/ToastProvider';

interface TankDetailPanelProps {
  vessel: FermentationVessel | null;
  isOpen: boolean;
  onClose: () => void;
  qualityChecks: QualityCheckEntry[];
  gravityReadings: { date: string; gravity: number; temp: number }[];
  targetFG?: number;
  onReadingAdded?: () => void;
}

export default function TankDetailPanel({ vessel, isOpen, onClose, qualityChecks, gravityReadings, targetFG, onReadingAdded }: TankDetailPanelProps) {
  const { toast } = useToast();
  const [tempInput, setTempInput] = useState('');
  const [pressInput, setPressInput] = useState('');
  const [gravInput, setGravInput] = useState('');

  if (!vessel) return null;

  const handleRecordReading = async () => {
    try {
      await api.post(`/vessels/${vessel.id}/reading`, {
        temperature_f: tempInput ? parseFloat(tempInput) : null,
        pressure_psi: pressInput ? parseFloat(pressInput) : null,
        gravity: gravInput ? parseFloat(gravInput) : null,
        checked_by: 'Brewer',
        notes: '',
      });
      toast('success', 'Reading recorded');
      setTempInput('');
      setPressInput('');
      setGravInput('');
      onReadingAdded?.();
    } catch {
      toast('error', 'Failed to record reading');
    }
  };

  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} title={vessel.name} width="w-[520px]">
      <div className="space-y-6">
        {/* Vessel Info */}
        <div className="flex items-center gap-3">
          <Badge variant={vessel.status === 'fermenting' ? 'amber' : vessel.status === 'conditioning' ? 'blue' : vessel.status === 'carbonating' ? 'green' : 'gray'}>
            {vessel.status.replace('_', ' ')}
          </Badge>
          <span className="text-sm text-brewery-400">{vessel.vesselType} | {vessel.capacityBbl} bbl</span>
        </div>

        {/* Current Batch */}
        {vessel.batchBeerName && (
          <div className="bg-brewery-800/50 rounded-xl p-4 border border-brewery-700/30">
            <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-2">Current Batch</h4>
            <p className="text-lg font-semibold text-brewery-100">{vessel.batchBeerName}</p>
            <p className="text-xs text-brewery-400">{vessel.batchName} | {vessel.batchStyle}</p>
            {vessel.batchBrewDate && <p className="text-xs text-brewery-500 mt-1">Brewed: {vessel.batchBrewDate}</p>}
          </div>
        )}

        {/* Current Readings */}
        <div className="grid grid-cols-2 gap-3">
          {vessel.temperatureF != null && (
            <div className="bg-brewery-800/30 rounded-lg p-3 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-red-400" />
              <div>
                <p className="text-xs text-brewery-500">Temperature</p>
                <p className="font-mono text-lg font-bold text-brewery-100">{vessel.temperatureF}°F</p>
              </div>
            </div>
          )}
          {vessel.pressurePsi != null && (
            <div className="bg-brewery-800/30 rounded-lg p-3 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-brewery-500">Pressure</p>
                <p className="font-mono text-lg font-bold text-brewery-100">{vessel.pressurePsi} PSI</p>
              </div>
            </div>
          )}
        </div>

        {/* Gravity Chart */}
        <div>
          <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5" /> Gravity Curve
          </h4>
          <div className="bg-brewery-800/30 rounded-xl p-3 border border-brewery-700/20">
            <GravityChart readings={gravityReadings} targetFG={targetFG} />
          </div>
        </div>

        {/* Quality Checks */}
        {qualityChecks.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ClipboardCheck className="w-3.5 h-3.5" /> Quality Checks
            </h4>
            <div className="space-y-2">
              {qualityChecks.slice(0, 8).map(qc => (
                <div key={qc.id} className="bg-brewery-800/30 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-brewery-200 capitalize">{qc.checkType.replace('_', ' ')}</span>
                    <p className="text-sm text-brewery-100">{qc.value}</p>
                    {qc.notes && <p className="text-[10px] text-brewery-500 mt-0.5">{qc.notes}</p>}
                  </div>
                  <QualityBadge status={qc.passFail} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Record Reading Form */}
        {vessel.currentBatchId && (
          <div>
            <h4 className="text-xs font-semibold text-brewery-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Beaker className="w-3.5 h-3.5" /> Record Reading
            </h4>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="text-[10px] text-brewery-500 mb-1 block">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tempInput}
                  onChange={e => setTempInput(e.target.value)}
                  className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-2 py-1.5 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="64.5"
                />
              </div>
              <div>
                <label className="text-[10px] text-brewery-500 mb-1 block">PSI</label>
                <input
                  type="number"
                  step="0.1"
                  value={pressInput}
                  onChange={e => setPressInput(e.target.value)}
                  className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-2 py-1.5 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="1.2"
                />
              </div>
              <div>
                <label className="text-[10px] text-brewery-500 mb-1 block">Gravity</label>
                <input
                  type="number"
                  step="0.001"
                  value={gravInput}
                  onChange={e => setGravInput(e.target.value)}
                  className="w-full bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-2 py-1.5 text-sm text-brewery-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="1.042"
                />
              </div>
            </div>
            <button
              onClick={handleRecordReading}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 rounded-lg text-sm shadow-lg shadow-amber-600/20 transition-colors"
            >
              Save Reading
            </button>
          </div>
        )}
      </div>
    </SlidePanel>
  );
}
