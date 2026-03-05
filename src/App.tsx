import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import DashboardPage from './pages/dashboard/DashboardPage';
import CustomersPage from './pages/customers/CustomersPage';
import MugClubPage from './pages/mug-club/MugClubPage';
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
import { BreweryProvider } from './context/BreweryContext';
import { ToastProvider } from './components/ui/ToastProvider';
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
};

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const PageComponent = pages[currentPage];

  return (
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
      />
      <div className={clsx('transition-all duration-300', sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[240px]')}>
        <TopBar onMenuToggle={() => setMobileOpen(true)} pageTitle={pageTitles[currentPage]} />
        <main className="p-4 lg:p-6">
          <PageComponent />
        </main>
      </div>
    </div>
    </ToastProvider>
    </BreweryProvider>
  );
}

export default App;
