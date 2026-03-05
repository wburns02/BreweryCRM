import { Thermometer, Gauge, Plus, Droplets } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import type { FermentationVessel } from '../../types';
import { clsx } from 'clsx';

const statusConfig: Record<string, { color: string; badge: 'amber' | 'blue' | 'green' | 'gray' | 'purple'; fillFrom: string; fillTo: string }> = {
  fermenting: { color: 'amber', badge: 'amber', fillFrom: '#D97706', fillTo: '#F59E0B' },
  conditioning: { color: 'blue', badge: 'blue', fillFrom: '#2563EB', fillTo: '#3B82F6' },
  carbonating: { color: 'green', badge: 'green', fillFrom: '#059669', fillTo: '#10B981' },
  cleaning: { color: 'purple', badge: 'purple', fillFrom: '#7C3AED', fillTo: '#8B5CF6' },
  empty: { color: 'gray', badge: 'gray', fillFrom: '#E5E7EB', fillTo: '#E5E7EB' },
  out_of_service: { color: 'gray', badge: 'gray', fillFrom: '#6B7280', fillTo: '#6B7280' },
};

function getDaysInTank(brewDate?: string): number {
  if (!brewDate) return 0;
  try {
    const start = new Date(brewDate);
    const now = new Date();
    return Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  } catch { return 0; }
}

interface TankCardProps {
  vessel: FermentationVessel;
  onClick: () => void;
}

export default function TankCard({ vessel, onClick }: TankCardProps) {
  const config = statusConfig[vessel.status] || statusConfig.empty;
  const isEmpty = vessel.status === 'empty';
  const isCleaning = vessel.status === 'cleaning';
  const days = getDaysInTank(vessel.batchBrewDate);
  const estimatedDays = vessel.status === 'fermenting' ? 14 : vessel.status === 'conditioning' ? 7 : vessel.status === 'carbonating' ? 5 : 0;
  const fillPct = isEmpty ? 0 : 75;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative flex flex-col items-center rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer w-full text-left',
        isEmpty
          ? 'border-2 border-dashed border-gray-500/40 bg-brewery-900/40 hover:border-gray-400/60'
          : 'border border-brewery-700/30 bg-brewery-900/80 shadow-lg hover:shadow-xl hover:border-amber-500/30'
      )}
    >
      {/* Tank Name */}
      <div className="w-full flex items-center justify-between mb-3">
        <span className="font-bold text-sm text-brewery-200">{vessel.name}</span>
        <span className="text-[10px] text-brewery-500">{vessel.capacityBbl} bbl</span>
      </div>

      {/* Tank Visualization */}
      <div className={clsx(
        'relative w-full rounded-xl overflow-hidden',
        isEmpty ? 'h-32' : 'h-40'
      )} style={{ background: '#1a120a' }}>
        {!isEmpty && (
          <>
            {/* Liquid fill */}
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
              style={{
                height: `${fillPct}%`,
                background: `linear-gradient(180deg, ${config.fillFrom} 0%, ${config.fillTo} 100%)`,
                opacity: 0.85,
              }}
            />
            {/* Wave effect */}
            <div
              className="absolute left-0 right-0"
              style={{
                bottom: `${fillPct - 3}%`,
                height: '12px',
                background: `linear-gradient(180deg, transparent 0%, ${config.fillFrom}80 100%)`,
                borderRadius: '50% 50% 0 0',
                animation: 'wave 3s ease-in-out infinite',
              }}
            />
          </>
        )}

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-3">
          {isEmpty ? (
            <div className="flex flex-col items-center gap-2">
              <Plus className="w-6 h-6 text-gray-500" />
              <span className="text-xs text-gray-500">Assign Batch</span>
            </div>
          ) : (
            <>
              <span className="font-semibold text-base text-white drop-shadow-lg text-center leading-tight">
                {vessel.batchBeerName || 'Unknown Beer'}
              </span>
              {vessel.batchStyle && (
                <span className="text-[10px] text-white/70 mt-0.5">{vessel.batchStyle}</span>
              )}
            </>
          )}
        </div>

        {/* Cleaning animation */}
        {isCleaning && (
          <div className="absolute inset-0 bg-purple-500/10 animate-pulse" />
        )}
      </div>

      {/* Readings */}
      {!isEmpty && (
        <div className="w-full mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            {vessel.temperatureF != null && (
              <div className="flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-red-400" />
                <span className="font-mono text-sm text-brewery-200">{vessel.temperatureF}°F</span>
              </div>
            )}
            {vessel.pressurePsi != null && (
              <div className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-blue-400" />
                <span className="font-mono text-sm text-brewery-200">{vessel.pressurePsi} PSI</span>
              </div>
            )}
          </div>
          {estimatedDays > 0 && (
            <div className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-brewery-400" />
              <span className="text-xs text-brewery-300">Day {days} of ~{estimatedDays}</span>
            </div>
          )}
        </div>
      )}

      {/* Status badge */}
      <div className="w-full mt-2">
        <Badge variant={config.badge}>{vessel.status.replace('_', ' ')}</Badge>
      </div>
    </button>
  );
}
