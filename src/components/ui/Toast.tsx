import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onDismiss: (id: string) => void;
}

const icons = { success: CheckCircle, warning: AlertTriangle, error: XCircle, info: Info };
const colors = {
  success: 'border-l-emerald-500 bg-emerald-900/20',
  warning: 'border-l-amber-500 bg-amber-900/20',
  error: 'border-l-red-500 bg-red-900/20',
  info: 'border-l-blue-500 bg-blue-900/20',
};
const iconColors = { success: 'text-emerald-400', warning: 'text-amber-400', error: 'text-red-400', info: 'text-blue-400' };
const barColors = { success: 'bg-emerald-500', warning: 'bg-amber-500', error: 'bg-red-500', info: 'bg-blue-500' };

export default function Toast({ id, type, message, onDismiss }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);
  const Icon = icons[type];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const start = Date.now();
    const duration = 4000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) requestAnimationFrame(tick);
      else onDismiss(id);
    };
    requestAnimationFrame(tick);
  }, [id, onDismiss]);

  return (
    <div className={clsx(
      'relative w-80 border-l-4 rounded-lg shadow-2xl backdrop-blur-xl transition-all duration-300',
      colors[type],
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    )}>
      <div className="flex items-start gap-3 p-3">
        <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', iconColors[type])} />
        <p className="text-sm text-brewery-100 flex-1">{message}</p>
        <button onClick={() => onDismiss(id)} className="text-brewery-400 hover:text-brewery-100">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="h-0.5 w-full overflow-hidden rounded-b-lg">
        <div className={clsx('h-full transition-none', barColors[type])} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
