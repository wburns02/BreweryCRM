import { clsx } from 'clsx';

const variants = {
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  gray: 'bg-brewery-600/20 text-brewery-300 border-brewery-600/30',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export default function Badge({ children, variant = 'amber', className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  );
}
