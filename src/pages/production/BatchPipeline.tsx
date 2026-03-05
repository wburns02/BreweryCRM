import Badge from '../../components/ui/Badge';
import type { BatchTimelineEntry } from '../../types';
import { clsx } from 'clsx';

const statusBarColors: Record<string, string> = {
  mashing: 'bg-amber-500',
  boiling: 'bg-orange-500',
  fermenting: 'bg-amber-400',
  conditioning: 'bg-blue-500',
  carbonating: 'bg-emerald-500',
  ready: 'bg-green-500',
};

const statusBadgeColors: Record<string, 'amber' | 'blue' | 'green' | 'gray' | 'purple'> = {
  mashing: 'amber',
  boiling: 'amber',
  fermenting: 'amber',
  conditioning: 'blue',
  carbonating: 'green',
  ready: 'green',
};

interface BatchPipelineProps {
  timeline: BatchTimelineEntry[];
  onBatchClick?: (entry: BatchTimelineEntry) => void;
}

export default function BatchPipeline({ timeline, onBatchClick }: BatchPipelineProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-brewery-300 uppercase tracking-wider mb-4">Batch Pipeline</h3>
      {timeline.length === 0 ? (
        <div className="bg-brewery-900/60 border border-brewery-700/30 rounded-xl p-6 text-center">
          <p className="text-brewery-500 text-sm">No active batches</p>
        </div>
      ) : (
        <div className="space-y-3">
          {timeline.map(entry => (
            <button
              key={entry.id}
              onClick={() => onBatchClick?.(entry)}
              className="w-full bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-4 hover:border-amber-500/20 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-brewery-100">{entry.beerName}</span>
                <Badge variant={statusBadgeColors[entry.status] || 'gray'}>{entry.status}</Badge>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-brewery-800/50 rounded-full h-2.5 mb-2">
                <div
                  className={clsx('h-2.5 rounded-full transition-all duration-500', statusBarColors[entry.status] || 'bg-gray-500')}
                  style={{ width: `${Math.max(5, entry.progressPct)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-brewery-400">
                <span>
                  Day {entry.daysInCurrentPhase}/{entry.estimatedPhaseDays} — {entry.vesselName}
                </span>
                {entry.estimatedCompletion && (
                  <span>Est. {entry.estimatedCompletion}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
