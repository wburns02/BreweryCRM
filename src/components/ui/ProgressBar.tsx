import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'amber' | 'green' | 'red' | 'blue';
  showLabel?: boolean;
}

const colors = {
  amber: 'bg-amber-500',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

export default function ProgressBar({ value, max = 100, size = 'md', color = 'amber', showLabel }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor = pct < 20 ? 'bg-red-500' : pct < 40 ? 'bg-amber-500' : colors[color];
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className="flex items-center gap-2">
      <div className={clsx('flex-1 bg-brewery-800 rounded-full overflow-hidden', heights[size])}>
        <div className={clsx('h-full rounded-full transition-all duration-500', barColor)} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs font-medium text-brewery-300 w-10 text-right">{Math.round(pct)}%</span>}
    </div>
  );
}
