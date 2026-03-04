import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
}

export default function StatCard({ title, value, change, changeLabel, icon: Icon, iconColor = 'text-amber-400', iconBg = 'bg-amber-600/20' }: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-brewery-900/80 border border-brewery-700/30 rounded-xl p-5 hover:border-amber-500/20 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-brewery-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-brewery-50 mt-1">{value}</p>
        </div>
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={clsx('w-5 h-5', iconColor)} />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {isPositive && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
          {isNegative && <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
          {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5 text-brewery-500" />}
          <span className={clsx('text-xs font-medium', isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-brewery-500')}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-brewery-500">{changeLabel || 'vs last week'}</span>
        </div>
      )}
    </div>
  );
}
