import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import DashboardPage from './pages/dashboard/DashboardPage';
import CustomersPage from './pages/customers/CustomersPage';
import MugClubPage from './pages/mug-club/MugClubPage';
import TapsPage from './pages/taps/TapsPage';
import BrewingPage from './pages/brewing/BrewingPage';
import EventsPage from './pages/events/EventsPage';
import ReservationsPage from './pages/reservations/ReservationsPage';
import MenuPage from './pages/menu/MenuPage';
import InventoryPage from './pages/inventory/InventoryPage';
import StaffPage from './pages/staff/StaffPage';
import DistributionPage from './pages/distribution/DistributionPage';
import MarketingPage from './pages/marketing/MarketingPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import type { PageId } from './types';
import { clsx } from 'clsx';

const pageTitles: Record<PageId, string> = {
  dashboard: 'Dashboard',
  customers: 'Customer Management',
  'mug-club': 'Bulverde Brew Society',
  taps: 'Tap Management',
  brewing: 'Production & Brewing',
  events: 'Events & Entertainment',
  reservations: 'Reservations & Tables',
  menu: 'Food & Menu Engineering',
  inventory: 'Inventory Management',
  staff: 'Staff Management',
  distribution: 'Distribution & Wholesale',
  marketing: 'Marketing & Campaigns',
  reports: 'Reports & Analytics',
  settings: 'Settings & Compliance',
};

const pages: Record<PageId, React.ComponentType> = {
  dashboard: DashboardPage,
  customers: CustomersPage,
  'mug-club': MugClubPage,
  taps: TapsPage,
  brewing: BrewingPage,
  events: EventsPage,
  reservations: ReservationsPage,
  menu: MenuPage,
  inventory: InventoryPage,
  staff: StaffPage,
  distribution: DistributionPage,
  marketing: MarketingPage,
  reports: ReportsPage,
  settings: SettingsPage,
};

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const PageComponent = pages[currentPage];

  return (
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
  );
}

export default App;
