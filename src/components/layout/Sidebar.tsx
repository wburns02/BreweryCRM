import { LayoutDashboard, Users, Crown, GlassWater, FlaskConical, Calendar, BookOpen, UtensilsCrossed, Warehouse, UserCog, Truck, Megaphone, BarChart3, BarChart2, Settings, ChevronLeft, ChevronRight, X, Package, Beaker, DollarSign, CreditCard, Map, LogOut } from 'lucide-react';
import type { PageId } from '../../types';
import { clsx } from 'clsx';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onLogout?: () => void;
}

const navItems: { id: PageId; label: string; icon: React.ElementType; group: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { id: 'pos', label: 'POS', icon: CreditCard, group: 'Taproom' },
  { id: 'floor-plan', label: 'Floor Plan', icon: Map, group: 'Taproom' },
  { id: 'customers', label: 'Customers', icon: Users, group: 'Guests' },
  { id: 'mug-club', label: 'Mug Club', icon: Crown, group: 'Guests' },
  { id: 'reservations', label: 'Reservations', icon: BookOpen, group: 'Guests' },
  { id: 'taps', label: 'Tap Management', icon: GlassWater, group: 'Brewery' },
  { id: 'brewing', label: 'Production', icon: FlaskConical, group: 'Brewery' },
  { id: 'recipes', label: 'Recipe Lab', icon: Beaker, group: 'Brewery' },
  { id: 'kegs', label: 'Keg Tracking', icon: Package, group: 'Brewery' },
  { id: 'menu', label: 'Food & Menu', icon: UtensilsCrossed, group: 'Operations' },
  { id: 'inventory', label: 'Inventory', icon: Warehouse, group: 'Operations' },
  { id: 'taproom-analytics', label: 'Taproom Analytics', icon: BarChart2, group: 'Operations' },
  { id: 'events', label: 'Events', icon: Calendar, group: 'Marketing' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, group: 'Marketing' },
  { id: 'financials', label: 'Financials', icon: DollarSign, group: 'Finance' },
  { id: 'staff', label: 'Staff', icon: UserCog, group: 'Management' },
  { id: 'distribution', label: 'Distribution', icon: Truck, group: 'Management' },
  { id: 'reports', label: 'Reports', icon: BarChart3, group: 'Management' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'System' },
];

export default function Sidebar({ currentPage, onNavigate, collapsed, onToggle, mobileOpen, onMobileClose, onLogout }: SidebarProps) {
  let lastGroup = '';

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onMobileClose} />
      )}
      <aside className={clsx(
        'fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 bg-brewery-900/95 backdrop-blur-lg border-r border-brewery-700/30',
        collapsed ? 'w-[68px]' : 'w-[240px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className={clsx('flex items-center gap-3 px-4 h-16 border-b border-brewery-700/30', collapsed && 'justify-center')}>
          <img src="/logo.jpeg" alt="Bearded Hop" className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-brewery-50 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>Bearded Hop</h1>
              <p className="text-[10px] text-brewery-400 -mt-0.5">Brewery CRM</p>
            </div>
          )}
          <button onClick={onMobileClose} className="ml-auto lg:hidden text-brewery-400 hover:text-brewery-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <div key={item.id}>
                {showGroup && !collapsed && (
                  <div className="text-[10px] font-semibold text-brewery-500 uppercase tracking-wider px-3 pt-4 pb-1.5">{item.group}</div>
                )}
                <button
                  onClick={() => { onNavigate(item.id); onMobileClose(); }}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive ? 'bg-amber-600/20 text-amber-400' : 'text-brewery-400 hover:text-brewery-100 hover:bg-brewery-800/50',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={clsx('w-[18px] h-[18px] flex-shrink-0', isActive && 'text-amber-400')} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Logout + Collapse Toggle */}
        <div className="border-t border-brewery-700/30">
          {onLogout && (
            <button
              onClick={onLogout}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-brewery-400 hover:text-red-400 hover:bg-brewery-800/50 transition-colors',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          )}
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center w-full h-10 text-brewery-500 hover:text-brewery-200 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
