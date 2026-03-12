import { useState, useEffect, useCallback } from 'react';
import { FlaskConical, Warehouse, Calendar, Package, Clock, BarChart3 } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import TankFarmGrid from './TankFarmGrid';
import TankDetailPanel from './TankDetailPanel';
import BrewCalendar from './BrewCalendar';
import BatchPipeline from './BatchPipeline';
import ScheduleBrewModal from './ScheduleBrewModal';
import { api } from '../../api/client';
import { useData } from '../../context/DataContext';
import type {
  FermentationVessel, BrewDayLog, QualityCheckEntry,
  ProductionOverview, BatchTimelineEntry,
} from '../../types';

const MOCK_VESSELS: FermentationVessel[] = [
  { id: 'v1', name: 'FV-1 Armadillo', vesselType: 'Fermenter', capacityBbl: 15, status: 'fermenting', temperatureF: 68, pressurePsi: 12, notes: '', batchName: 'BH-2026-021', batchBeerName: 'Hill Country Haze', batchStatus: 'fermenting', batchStyle: 'Hazy IPA', batchBrewDate: '2026-03-08' },
  { id: 'v2', name: 'FV-2 Longhorn', vesselType: 'Fermenter', capacityBbl: 15, status: 'conditioning', temperatureF: 34, pressurePsi: 8, notes: '', batchName: 'BH-2026-020', batchBeerName: 'Bulverde Blonde', batchStatus: 'conditioning', batchStyle: 'American Blonde', batchBrewDate: '2026-03-01' },
  { id: 'v3', name: 'FV-3 Prickly', vesselType: 'Fermenter', capacityBbl: 10, status: 'empty', temperatureF: 38, pressurePsi: 0, notes: 'Ready for next batch' },
  { id: 'v4', name: 'BBT-1 Bluebonnet', vesselType: 'Brite Tank', capacityBbl: 20, status: 'carbonating', temperatureF: 32, pressurePsi: 15, notes: '', batchName: 'BH-2026-019', batchBeerName: 'Citra Smash IPA', batchStatus: 'carbonating', batchStyle: 'American IPA', batchBrewDate: '2026-02-22' },
  { id: 'v5', name: 'BBT-2 Roadrunner', vesselType: 'Brite Tank', capacityBbl: 20, status: 'empty', temperatureF: 36, pressurePsi: 2, notes: 'Post-CIP' },
  { id: 'v6', name: 'FV-4 Pecan', vesselType: 'Fermenter', capacityBbl: 7, status: 'fermenting', temperatureF: 72, pressurePsi: 10, notes: 'Open fermentation', batchName: 'BH-2026-022', batchBeerName: 'Prickly Pear Sour', batchStatus: 'fermenting', batchStyle: 'Fruited Sour', batchBrewDate: '2026-03-10' },
  { id: 'v7', name: 'FV-5 Mesquite', vesselType: 'Fermenter', capacityBbl: 15, status: 'cleaning', temperatureF: 140, pressurePsi: 0, notes: 'CIP in progress' },
];

function mapKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return out;
}

function mapArr<T>(arr: Record<string, unknown>[]): T[] {
  return (arr || []).map(item => mapKeys(item) as T);
}

export default function ProductionPage() {
  const { batches: allBatches, staff } = useData();
  const [overview, setOverview] = useState<ProductionOverview | null>(null);
  const [vessels, setVessels] = useState<FermentationVessel[]>([]);
  const [brewDays, setBrewDays] = useState<BrewDayLog[]>([]);
  const [timeline, setTimeline] = useState<BatchTimelineEntry[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<FermentationVessel | null>(null);
  const [qualityChecks, setQualityChecks] = useState<QualityCheckEntry[]>([]);
  const [gravityReadings, setGravityReadings] = useState<{ date: string; gravity: number; temp: number }[]>([]);
  const [targetFG, setTargetFG] = useState<number | undefined>();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [ovRes, vesRes, bdRes, tlRes] = await Promise.all([
        api.get<Record<string, unknown>>('/production/overview').catch(() => null),
        api.get<Record<string, unknown>[]>('/vessels/').catch(() => []),
        api.get<Record<string, unknown>[]>('/brew-days/').catch(() => []),
        api.get<Record<string, unknown>[]>('/production/timeline').catch(() => []),
      ]);

      if (ovRes) {
        const mapped = mapKeys(ovRes) as Record<string, unknown>;
        mapped.activeBatches = mapArr(mapped.activeBatches as Record<string, unknown>[] || []);
        mapped.upcomingBrewDays = mapArr(mapped.upcomingBrewDays as Record<string, unknown>[] || []);
        if (mapped.nextBrewDay) mapped.nextBrewDay = mapKeys(mapped.nextBrewDay as Record<string, unknown>);
        setOverview(mapped as unknown as ProductionOverview);
      }
      const apiVessels = mapArr<FermentationVessel>(vesRes as Record<string, unknown>[] || []);
      setVessels(apiVessels.length > 0 ? apiVessels : MOCK_VESSELS);
      setBrewDays(mapArr<BrewDayLog>(bdRes as Record<string, unknown>[] || []));
      setTimeline(mapArr<BatchTimelineEntry>(tlRes as Record<string, unknown>[] || []));
    } catch (err) {
      console.error('Failed to fetch production data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleTankClick = async (vessel: FermentationVessel) => {
    setSelectedVessel(vessel);
    setQualityChecks([]);
    setGravityReadings([]);
    setTargetFG(undefined);

    if (vessel.currentBatchId) {
      try {
        const qcData = await api.get<Record<string, unknown>[]>(`/quality/?batch_id=${vessel.currentBatchId}`).catch(() => []);
        setQualityChecks(mapArr<QualityCheckEntry>(qcData));

        const batch = allBatches.find(b => b.id === vessel.currentBatchId);
        if (batch) {
          setGravityReadings(batch.gravityReadings || []);
          setTargetFG(batch.targetFG);
        }
      } catch { /* ignore */ }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-brewery-800/40 rounded-xl" />)}
        </div>
        <div className="h-8 w-48 bg-brewery-700/40 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-brewery-800/40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Batches In Progress"
          value={overview?.activeBatchesCount ?? 0}
          icon={FlaskConical}
          iconColor="text-amber-400"
          iconBg="bg-amber-600/20"
        />
        <StatCard
          title="Vessels In Use"
          value={`${overview?.vesselsInUse ?? 0} / ${overview?.vesselsTotal ?? 0}`}
          icon={Warehouse}
          iconColor="text-blue-400"
          iconBg="bg-blue-600/20"
        />
        <StatCard
          title="Next Brew Day"
          value={overview?.nextBrewDay?.scheduledDate ?? 'None'}
          icon={Calendar}
          iconColor="text-purple-400"
          iconBg="bg-purple-600/20"
        />
        <StatCard
          title="Ready to Package"
          value={overview?.batchesReadyToPackage ?? 0}
          icon={Package}
          iconColor={overview?.batchesReadyToPackage ? 'text-emerald-400' : 'text-brewery-400'}
          iconBg={overview?.batchesReadyToPackage ? 'bg-emerald-600/20' : 'bg-brewery-700/20'}
        />
        <StatCard
          title="Avg Days in Fermenter"
          value={overview?.avgDaysInFermenter ?? 0}
          icon={Clock}
          iconColor="text-orange-400"
          iconBg="bg-orange-600/20"
        />
        <StatCard
          title="Production (BBL/mo)"
          value={overview?.productionThisMonthBbl ?? 0}
          icon={BarChart3}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-600/20"
        />
      </div>

      {/* Tank Farm */}
      <TankFarmGrid vessels={vessels} onTankClick={handleTankClick} />

      {/* Bottom Section: Calendar + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-brewery-900/60 border border-brewery-700/30 rounded-xl p-5">
          <BrewCalendar brewDays={brewDays} onScheduleClick={() => setShowScheduleModal(true)} />
        </div>
        <div className="lg:col-span-2">
          <BatchPipeline timeline={timeline} />
        </div>
      </div>

      {/* Tank Detail Panel */}
      <TankDetailPanel
        vessel={selectedVessel}
        isOpen={!!selectedVessel}
        onClose={() => setSelectedVessel(null)}
        qualityChecks={qualityChecks}
        gravityReadings={gravityReadings}
        targetFG={targetFG}
        onReadingAdded={fetchAll}
      />

      {/* Schedule Brew Day Modal */}
      <ScheduleBrewModal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        recipes={[]}
        staff={staff}
        vessels={vessels}
        batches={allBatches.map(b => ({ id: b.id, batchNumber: b.batchNumber, beerName: b.beerName }))}
        onCreated={fetchAll}
      />

      {/* CSS for wave animation */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-3px) scaleY(1.3); }
        }
      `}</style>
    </div>
  );
}
