import { Menu, Bell, Search, User } from 'lucide-react';

interface TopBarProps {
  onMenuToggle: () => void;
  pageTitle: string;
}

export default function TopBar({ onMenuToggle, pageTitle }: TopBarProps) {
  return (
    <header className="h-16 border-b border-brewery-700/30 bg-brewery-900/60 backdrop-blur-lg flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="lg:hidden text-brewery-400 hover:text-brewery-100">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-brewery-50" style={{ fontFamily: 'var(--font-display)' }}>{pageTitle}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center bg-brewery-800/50 border border-brewery-700/40 rounded-lg px-3 py-1.5 gap-2">
          <Search className="w-4 h-4 text-brewery-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-brewery-200 placeholder-brewery-500 outline-none w-48"
          />
          <kbd className="text-[10px] text-brewery-500 bg-brewery-700/50 px-1.5 py-0.5 rounded">⌘K</kbd>
        </div>
        <button className="relative p-2 text-brewery-400 hover:text-brewery-100 hover:bg-brewery-800/50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-brewery-700/30">
          <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center">
            <User className="w-4 h-4 text-amber-400" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-brewery-100">Derek Wilson</p>
            <p className="text-[10px] text-brewery-400">Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
