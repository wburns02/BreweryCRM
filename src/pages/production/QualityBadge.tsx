import { clsx } from 'clsx';
import { CheckCircle, XCircle, AlertTriangle, Minus } from 'lucide-react';

const config = {
  pass: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  fail: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  na: { icon: Minus, color: 'text-brewery-400', bg: 'bg-brewery-600/20' },
};

interface QualityBadgeProps {
  status: 'pass' | 'fail' | 'warning' | 'na';
  label?: string;
}

export default function QualityBadge({ status, label }: QualityBadgeProps) {
  const c = config[status] || config.na;
  const Icon = c.icon;
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', c.bg, c.color)}>
      <Icon className="w-3 h-3" />
      {label || status}
    </span>
  );
}
