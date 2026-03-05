import { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export default function SlidePanel({ isOpen, onClose, title, children, width = 'w-[480px]' }: SlidePanelProps) {
  useEffect(() => {
    if (isOpen) {
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-[90] backdrop-blur-xl bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          'fixed top-0 right-0 h-full z-[95] flex flex-col bg-brewery-900 border-l border-brewery-700/30 shadow-2xl transition-transform duration-300',
          width,
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-brewery-700/30 flex-shrink-0">
          <h3 className="text-lg font-semibold text-brewery-50" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
          <button onClick={onClose} className="text-brewery-400 hover:text-brewery-100 p-1.5 rounded-lg hover:bg-brewery-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}
