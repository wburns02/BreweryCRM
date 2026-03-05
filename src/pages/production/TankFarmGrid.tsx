import TankCard from './TankCard';
import type { FermentationVessel } from '../../types';

interface TankFarmGridProps {
  vessels: FermentationVessel[];
  onTankClick: (vessel: FermentationVessel) => void;
}

export default function TankFarmGrid({ vessels, onTankClick }: TankFarmGridProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-brewery-300 uppercase tracking-wider mb-4">Tank Farm</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vessels.map(vessel => (
          <TankCard key={vessel.id} vessel={vessel} onClick={() => onTankClick(vessel)} />
        ))}
      </div>
    </div>
  );
}
