import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, ShoppingCart, Users, Map, Beer } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import CommandPalette from './components/CommandPalette';
import DashboardPage from './pages/dashboard/DashboardPage';
import CustomersPage from './pages/customers/CustomersPage';
import MugClubPage from './pages/mug-club/MugClubPage';
import LoyaltyPage from './pages/loyalty/LoyaltyPage';
import FermentationPage from './pages/fermentation/FermentationPage';
import TapsPage from './pages/taps/TapsPage';
import BrewingPage from './pages/brewing/BrewingPage';
import RecipesPage from './pages/recipes/RecipesPage';
import KegsPage from './pages/kegs/KegsPage';
import FinancialsPage from './pages/financials/FinancialsPage';
import EventsPage from './pages/events/EventsPage';
import ReservationsPage from './pages/reservations/ReservationsPage';
import MenuPage from './pages/menu/MenuPage';
import InventoryPage from './pages/inventory/InventoryPage';
import TaproomAnalyticsPage from './pages/taproom-analytics/TaproomAnalyticsPage';
import StaffPage from './pages/staff/StaffPage';
import DistributionPage from './pages/distribution/DistributionPage';
import MarketingPage from './pages/marketing/MarketingPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import POSPage from './pages/pos/POSPage';
import FloorPlanPage from './pages/floor-plan/FloorPlanPage';
import ProductionPage from './pages/production/ProductionPage';
import TTBReportsPage from './pages/ttb-reports/TTBReportsPage';
import KegMonitorPage from './pages/keg-monitor/KegMonitorPage';
import TapMenuBoardPage from './pages/tap-menu/TapMenuBoardPage';
import BrewCostLabPage from './pages/brew-costs/BrewCostLabPage';
import LoginPage from './pages/auth/LoginPage';
import { BreweryProvider } from './context/BreweryContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/ui/ToastProvider';
import { login, getMe, logout } from './api/auth';
import { getToken } from './api/client';
import type { PageId } from './types';
import { clsx } from 'clsx';

const pageTitles: Record<PageId, string> = {
  dashboard: 'Dashboard',
  customers: 'Customer Management',
  'mug-club': 'Bearded Hop Mug Club',
  taps: 'Tap Management',
  brewing: 'Production & Brewing',
  recipes: 'Recipe Lab',
  kegs: 'Keg Tracking',
  financials: 'Financial Command Center',
  events: 'Events & Entertainment',
  reservations: 'Reservations & Tables',
  menu: 'Food & Menu Engineering',
  inventory: 'Inventory Management',
  'taproom-analytics': 'Taproom Analytics',
  staff: 'Staff Management',
  distribution: 'Distribution & Wholesale',
  marketing: 'Marketing & Campaigns',
  reports: 'Reports & Analytics',
  settings: 'Settings & Compliance',
  pos: 'Taproom POS',
  'floor-plan': 'Floor Plan & Table Management',
  production: 'Production Dashboard',
  'ttb-reports': 'TTB Compliance Center',
  'keg-monitor': 'Keg Health Monitor',
  'loyalty': 'Loyalty Check-in',
  'fermentation': 'Ferment Lab',
  'tap-menu': 'Live Tap Menu Board',
  'brew-costs': 'Brew Cost Lab',
};

const pages: Record<PageId, React.ComponentType> = {
  dashboard: DashboardPage,
  customers: CustomersPage,
  'mug-club': MugClubPage,
  taps: TapsPage,
  brewing: BrewingPage,
  recipes: RecipesPage,
  kegs: KegsPage,
  financials: FinancialsPage,
  events: EventsPage,
  reservations: ReservationsPage,
  menu: MenuPage,
  inventory: InventoryPage,
  'taproom-analytics': TaproomAnalyticsPage,
  staff: StaffPage,
  distribution: DistributionPage,
  marketing: MarketingPage,
  reports: ReportsPage,
  settings: SettingsPage,
  pos: POSPage,
  'floor-plan': FloorPlanPage,
  production: ProductionPage,
  'ttb-reports': TTBReportsPage,
  'keg-monitor': KegMonitorPage,
  'loyalty': LoyaltyPage,
  'fermentation': FermentationPage,
  'tap-menu': TapMenuBoardPage,
  'brew-costs': BrewCostLabPage,
};

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [, setDemoMode] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (localStorage.getItem('bh_demo') === '1' && token) {
      setDemoMode(true);
      getMe().then(() => setAuthenticated(true)).catch(() => {
        // Token expired, re-login
        login('admin@beardedhop.com', 'BrewDay2026!')
          .then(() => setAuthenticated(true))
          .catch(() => { setAuthenticated(false); localStorage.removeItem('bh_demo'); });
      });
      return;
    }
    if (token) {
      getMe().then(() => setAuthenticated(true)).catch(() => setAuthenticated(false));
    } else {
      setAuthenticated(false);
    }
  }, []);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    setAuthenticated(true);
  };

  const handleDemoMode = async () => {
    try {
      await login('admin@beardedhop.com', 'BrewDay2026!');
      localStorage.setItem('bh_demo', '1');
      setDemoMode(true);
      setAuthenticated(true);
    } catch {
      // If login fails, still enter demo mode (data will be empty)
      localStorage.setItem('bh_demo', '1');
      setDemoMode(true);
      setAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('bh_demo');
    setDemoMode(false);
    setAuthenticated(false);
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-brewery-950 flex items-center justify-center">
        <div className="text-brewery-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} onDemoMode={handleDemoMode} />;
  }

  const PageComponent = pages[currentPage];

  return (
    <DataProvider>
    <BreweryProvider>
    <ToastProvider>
    <div className="min-h-screen bg-brewery-950">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />
      <div className={clsx('transition-all duration-300', sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[240px]')}>
        <TopBar onMenuToggle={() => setMobileOpen(true)} pageTitle={pageTitles[currentPage]} onSearchClick={openCommandPalette} />
        <main className="p-4 lg:p-6 pb-20 lg:pb-6">
          <PageComponent />
        </main>
      </div>
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setCurrentPage}
      />

      {/* Mobile bottom nav bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-brewery-900/95 backdrop-blur-lg border-t border-brewery-700/30 flex">
        {([
          { id: 'dashboard', label: 'Home', Icon: LayoutDashboard },
          { id: 'pos', label: 'POS', Icon: ShoppingCart },
          { id: 'floor-plan', label: 'Floor', Icon: Map },
          { id: 'customers', label: 'Guests', Icon: Users },
          { id: 'taps', label: 'Taps', Icon: Beer },
        ] as { id: import('./types').PageId; label: string; Icon: React.ElementType }[]).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setCurrentPage(id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
              currentPage === id ? 'text-amber-400' : 'text-brewery-500 hover:text-brewery-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>
    </div>
    </ToastProvider>
    </BreweryProvider>
    </DataProvider>
  );
}

export default App;
