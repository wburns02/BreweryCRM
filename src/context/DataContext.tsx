import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type {
  Beer, TapLine, Batch, Customer, Reservation, BreweryEvent,
  Performer, DailySales, MonthlyFinancial, ComplianceItem, InventoryItem,
  MenuItem, StaffMember, WholesaleAccount, MugClubMember, EmailCampaign,
  DetailedRecipe, Keg, VisitRecord, CustomerNote, FloorTable, ServiceAlert,
  OrderTimelineEntry,
} from '../types';

// Snake_case → camelCase with abbreviation support
const ABBREVIATIONS: Record<string, string> = {
  targetOg: 'targetOG', targetFg: 'targetFG', targetAbv: 'targetABV',
  targetIbu: 'targetIBU', targetSrm: 'targetSRM', actualOg: 'actualOG',
  actualFg: 'actualFG', isNa: 'isNA', naRevenue: 'naRevenue',
  ibuContribution: 'ibuContribution', alphaAcid: 'alphaAcid',
};

function toCamel(s: string): string {
  const camel = s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  return ABBREVIATIONS[camel] || camel;
}

function mapKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[toCamel(k)] = deepCamel(v);
  }
  return out;
}

function deepCamel(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(deepCamel);
  if (val !== null && typeof val === 'object') return mapKeys(val as Record<string, unknown>);
  return val;
}

function mapArray<T>(arr: Record<string, unknown>[]): T[] {
  return arr.map(item => mapKeys(item) as T);
}

interface DataState {
  beers: Beer[];
  tapLines: TapLine[];
  batches: Batch[];
  customers: Customer[];
  reservations: Reservation[];
  events: BreweryEvent[];
  performers: Performer[];
  dailySales: DailySales[];
  monthlyFinancials: MonthlyFinancial[];
  complianceItems: ComplianceItem[];
  inventoryItems: InventoryItem[];
  menuItems: MenuItem[];
  staff: StaffMember[];
  wholesaleAccounts: WholesaleAccount[];
  mugClubMembers: MugClubMember[];
  emailCampaigns: EmailCampaign[];
  detailedRecipes: DetailedRecipe[];
  kegs: Keg[];
  visitHistory: Record<string, VisitRecord[]>;
  customerNotes: Record<string, CustomerNote[]>;
  floorTables: FloorTable[];
  serviceAlerts: ServiceAlert[];
  orderTimelines: OrderTimelineEntry[];
  loading: boolean;
  refetch: () => void;
}

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [beers, setBeers] = useState<Beer[]>([]);
  const [tapLines, setTapLines] = useState<TapLine[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<BreweryEvent[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [monthlyFinancials, setMonthlyFinancials] = useState<MonthlyFinancial[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [wholesaleAccounts, setWholesaleAccounts] = useState<WholesaleAccount[]>([]);
  const [mugClubMembers, setMugClubMembers] = useState<MugClubMember[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [detailedRecipes, setDetailedRecipes] = useState<DetailedRecipe[]>([]);
  const [kegs, setKegs] = useState<Keg[]>([]);
  const [visitHistory] = useState<Record<string, VisitRecord[]>>({});
  const [customerNotes] = useState<Record<string, CustomerNote[]>>({});
  const [floorTables, setFloorTables] = useState<FloorTable[]>([]);
  const [serviceAlerts, setServiceAlerts] = useState<ServiceAlert[]>([]);
  const [orderTimelines, setOrderTimelines] = useState<OrderTimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const results = await Promise.all([
        api.get<Record<string, unknown>[]>('/beers/').catch(() => []),
        api.get<Record<string, unknown>[]>('/taps/').catch(() => []),
        api.get<Record<string, unknown>[]>('/batches/').catch(() => []),
        api.get<Record<string, unknown>[]>('/customers/').catch(() => []),
        api.get<Record<string, unknown>[]>('/reservations/').catch(() => []),
        api.get<Record<string, unknown>[]>('/events/').catch(() => []),
        api.get<Record<string, unknown>[]>('/performers/').catch(() => []),
        api.get<Record<string, unknown>[]>('/financials/daily-sales').catch(() => []),
        api.get<Record<string, unknown>[]>('/financials/monthly').catch(() => []),
        api.get<Record<string, unknown>[]>('/settings/compliance').catch(() => []),
        api.get<Record<string, unknown>[]>('/inventory/').catch(() => []),
        api.get<Record<string, unknown>[]>('/menu-items/').catch(() => []),
        api.get<Record<string, unknown>[]>('/staff/').catch(() => []),
        api.get<Record<string, unknown>[]>('/distribution/accounts').catch(() => []),
        api.get<Record<string, unknown>[]>('/mug-club/').catch(() => []),
        api.get<Record<string, unknown>[]>('/marketing/campaigns').catch(() => []),
        api.get<Record<string, unknown>[]>('/detailed-recipes/').catch(() => []),
        api.get<Record<string, unknown>[]>('/kegs/').catch(() => []),
        api.get<Record<string, unknown>[]>('/floor-plan/tables').catch(() => []),
        api.get<Record<string, unknown>[]>('/floor-plan/alerts').catch(() => []),
        Promise.resolve([]), // order timelines loaded per-table, not in bulk
      ]);

      setBeers(mapArray<Beer>(results[0]));
      setTapLines(mapArray<TapLine>(results[1]));
      setBatches(mapArray<Batch>(results[2]));
      setCustomers(mapArray<Customer>(results[3]));
      setReservations(mapArray<Reservation>(results[4]));
      setEvents(mapArray<BreweryEvent>(results[5]));
      setPerformers(mapArray<Performer>(results[6]));
      setDailySales(mapArray<DailySales>(results[7]));
      setMonthlyFinancials(mapArray<MonthlyFinancial>(results[8]));
      setComplianceItems(mapArray<ComplianceItem>(results[9]));
      setInventoryItems(mapArray<InventoryItem>(results[10]));
      setMenuItems(mapArray<MenuItem>(results[11]));
      setStaff(mapArray<StaffMember>(results[12]));
      setWholesaleAccounts(mapArray<WholesaleAccount>(results[13]));
      setMugClubMembers(mapArray<MugClubMember>(results[14]));
      setEmailCampaigns(mapArray<EmailCampaign>(results[15]));
      setDetailedRecipes(mapArray<DetailedRecipe>(results[16]));
      setKegs(mapArray<Keg>(results[17]));
      setFloorTables(mapArray<FloorTable>(results[18]));
      setServiceAlerts(mapArray<ServiceAlert>(results[19]));
      setOrderTimelines(mapArray<OrderTimelineEntry>(results[20]));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <DataContext.Provider value={{
      beers, tapLines, batches, customers, reservations, events, performers,
      dailySales, monthlyFinancials, complianceItems, inventoryItems, menuItems,
      staff, wholesaleAccounts, mugClubMembers, emailCampaigns, detailedRecipes,
      kegs, visitHistory, customerNotes, floorTables, serviceAlerts, orderTimelines,
      loading, refetch: fetchAll,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
