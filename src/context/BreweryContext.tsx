import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { OpenTab, TapLine, Batch, GravityReading, FloorTable, ServiceAlert, Customer, Reservation, BreweryEvent, EmailCampaign, MugClubMember, InventoryItem, MenuItem, Keg, DetailedRecipe, TicketSale, BeerRating } from '../types';
import { api } from '../api/client';
import * as mock from '../data/mockData';

interface BusinessSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  taxRate: string;
  timezone: string;
}

interface BreweryState {
  tabs: OpenTab[];
  tapLines: TapLine[];
  batches: Batch[];
  floorTables: FloorTable[];
  serviceAlerts: ServiceAlert[];
  customers: Customer[];
  reservations: Reservation[];
  events: BreweryEvent[];
  emailCampaigns: EmailCampaign[];
  mugClubMembers: MugClubMember[];
  inventoryItems: InventoryItem[];
  menuItems: MenuItem[];
  kegs: Keg[];
  detailedRecipes: DetailedRecipe[];
  settings: BusinessSettings;
  loading: boolean;
  addToTab: (tabId: string, item: { name: string; size: string; price: number; qty: number }) => void;
  closeTab: (tabId: string) => void;
  holdTab: (tab: OpenTab) => void;
  createTab: (tab: OpenTab) => void;
  updateTapLine: (tapNumber: number, updates: Partial<TapLine>) => void;
  advanceBatchStatus: (batchId: string) => void;
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  addGravityReading: (batchId: string, reading: GravityReading) => void;
  updateTable: (tableId: string, updates: Partial<FloorTable>) => void;
  dismissAlert: (alertId: string) => void;
  addAlert: (alert: ServiceAlert) => void;
  seatGuests: (tableId: string, customerName: string, partySize: number, serverId: string, serverName: string, customerId?: string) => void;
  clearTable: (tableId: string) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  ticketSales: TicketSale[];
  addEvent: (event: Omit<BreweryEvent, 'id'>) => void;
  sellTickets: (sale: Omit<TicketSale, 'id' | 'ticketCode' | 'checkedIn' | 'purchasedAt'>) => void;
  checkInTicket: (saleId: string) => void;
  addCampaign: (campaign: Omit<EmailCampaign, 'id'>) => void;
  updateCampaign: (id: string, updates: Partial<EmailCampaign>) => void;
  addMugClubMember: (member: Omit<MugClubMember, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  deleteInventoryItem: (id: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addKeg: (keg: Omit<Keg, 'id'>) => void;
  updateKeg: (id: string, updates: Partial<Keg>) => void;
  deleteKeg: (id: string) => void;
  addDetailedRecipe: (recipe: Omit<DetailedRecipe, 'id'>) => void;
  updateDetailedRecipe: (id: string, updates: Partial<DetailedRecipe>) => void;
  deleteDetailedRecipe: (id: string) => void;
  updateSettings: (updates: Partial<BusinessSettings>) => void;
  beerRatings: BeerRating[];
  addBeerRating: (rating: Omit<BeerRating, 'id'>) => void;
  deleteBeerRating: (id: string) => void;
  refetch: () => void;
}

const BreweryContext = createContext<BreweryState | null>(null);

const statusOrder: Batch['status'][] = ['planned', 'mashing', 'boiling', 'fermenting', 'conditioning', 'carbonating', 'ready', 'packaged'];

const defaultSettings: BusinessSettings = {
  businessName: 'Bearded Hop Brewery',
  address: '123 Main Street, Bulverde, TX 78163',
  phone: '(830) 555-BREW',
  email: 'hello@beardedhopbrewery.com',
  taxRate: '8.25%',
  timezone: 'America/Chicago (CST)',
};

// Snake_case → camelCase field mapping for API responses
function toCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function mapKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[toCamel(k)] = v;
  }
  return out;
}

function mapArray<T>(arr: Record<string, unknown>[]): T[] {
  return arr.map(item => mapKeys(item) as T);
}

// Deep-mapper for DetailedRecipe — nested grain/hop/yeast arrays also need camelCase conversion
function mapDetailedRecipe(item: Record<string, unknown>): DetailedRecipe {
  const base = mapKeys(item) as Record<string, unknown>;
  const mapNested = (arr: unknown): Record<string, unknown>[] =>
    Array.isArray(arr) ? (arr as Record<string, unknown>[]).map(mapKeys) : [];
  return {
    ...base,
    grainBill: mapNested(base.grainBill),
    hopSchedule: mapNested(base.hopSchedule),
    yeast: base.yeast && typeof base.yeast === 'object'
      ? mapKeys(base.yeast as Record<string, unknown>)
      : base.yeast,
    waterProfile: base.waterProfile && typeof base.waterProfile === 'object'
      ? mapKeys(base.waterProfile as Record<string, unknown>)
      : base.waterProfile,
    waterAdjustments: mapNested(base.waterAdjustments),
    brewDaySteps: mapNested(base.brewDaySteps),
    brewHistory: mapNested(base.brewHistory),
  } as unknown as DetailedRecipe;
}

function toSnakeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)] = v;
  }
  return out;
}

export function BreweryProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<OpenTab[]>([]);
  const [tapLineState, setTapLines] = useState<TapLine[]>([]);
  const [batchState, setBatches] = useState<Batch[]>([]);
  const [floorTables, setFloorTables] = useState<FloorTable[]>([]);
  const [serviceAlerts, setServiceAlerts] = useState<ServiceAlert[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<BreweryEvent[]>([]);
  const [ticketSales, setTicketSales] = useState<TicketSale[]>(mock.ticketSales);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [mugClubMembers, setMugClubMembers] = useState<MugClubMember[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [menuItemsState, setMenuItems] = useState<MenuItem[]>([]);
  const [kegsState, setKegs] = useState<Keg[]>([]);
  const [detailedRecipesState, setDetailedRecipes] = useState<DetailedRecipe[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [beerRatings, setBeerRatings] = useState<BeerRating[]>(mock.beerRatings);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [
        tabsData, tapsData, batchesData, tablesData, alertsData,
        customersData, reservationsData, eventsData, campaignsData,
        mugClubData, inventoryData, settingsData,
        menuItemsData, kegsData, detailedRecipesData,
      ] = await Promise.all([
        api.get<Record<string, unknown>[]>('/pos/tabs').catch(() => []),
        api.get<Record<string, unknown>[]>('/taps/').catch(() => []),
        api.get<Record<string, unknown>[]>('/batches/').catch(() => []),
        api.get<Record<string, unknown>[]>('/floor-plan/tables').catch(() => []),
        api.get<Record<string, unknown>[]>('/floor-plan/alerts').catch(() => []),
        api.get<Record<string, unknown>[]>('/customers/').catch(() => []),
        api.get<Record<string, unknown>[]>('/reservations/').catch(() => []),
        api.get<Record<string, unknown>[]>('/events/').catch(() => []),
        api.get<Record<string, unknown>[]>('/marketing/campaigns').catch(() => []),
        api.get<Record<string, unknown>[]>('/mug-club/').catch(() => []),
        api.get<Record<string, unknown>[]>('/inventory/').catch(() => []),
        api.get<Record<string, unknown>>('/settings/').catch(() => null),
        api.get<Record<string, unknown>[]>('/menu-items/').catch(() => []),
        api.get<Record<string, unknown>[]>('/kegs/').catch(() => []),
        api.get<Record<string, unknown>[]>('/detailed-recipes/').catch(() => []),
      ]);

      const or = <T,>(apiData: T[], mockData: T[]): T[] => apiData.length > 0 ? apiData : mockData;

      // Normalize stale openedAt timestamps on tabs (> 4h old → recent)
      const fourHoursAgo = Date.now() - 4 * 3_600_000;
      const rawTabs = mapArray<OpenTab>(tabsData);
      const freshTabs = rawTabs.map((tab, idx) => ({
        ...tab,
        openedAt: new Date(tab.openedAt).getTime() < fourHoursAgo
          ? new Date(Date.now() - (30 + idx * 15) * 60_000).toISOString()
          : tab.openedAt,
      }));
      setTabs(freshTabs.length > 0 ? freshTabs : mock.openTabs);

      setTapLines(or(mapArray<TapLine>(tapsData), mock.tapLines));
      setBatches(or(mapArray<Batch>(batchesData), mock.batches));

      // Normalize stale floor table seatedAt timestamps
      const rawTables = mapArray<FloorTable>(tablesData);
      const freshTables = rawTables.map((t, idx) => ({
        ...t,
        seatedAt: t.seatedAt && new Date(t.seatedAt).getTime() < fourHoursAgo
          ? new Date(Date.now() - (20 + idx * 8) * 60_000).toISOString()
          : t.seatedAt,
      }));
      setFloorTables(freshTables.length > 0 ? freshTables : mock.floorTables);

      // Normalize stale service alert createdAt timestamps
      const rawAlerts = mapArray<ServiceAlert>(alertsData);
      const freshAlerts = rawAlerts.map((a, idx) => ({
        ...a,
        createdAt: new Date(a.createdAt).getTime() < fourHoursAgo
          ? new Date(Date.now() - (5 + idx * 4) * 60_000).toISOString()
          : a.createdAt,
      }));
      setServiceAlerts(freshAlerts.length > 0 ? freshAlerts : mock.serviceAlerts);
      setCustomers(or(mapArray<Customer>(customersData), mock.customers));
      setReservations(or(mapArray<Reservation>(reservationsData), mock.reservations));
      setEvents(or(mapArray<BreweryEvent>(eventsData), mock.events));
      setEmailCampaigns(or(mapArray<EmailCampaign>(campaignsData), mock.emailCampaigns));
      setMugClubMembers(or(mapArray<MugClubMember>(mugClubData), mock.mugClubMembers));
      setInventoryItems(or(mapArray<InventoryItem>(inventoryData), mock.inventoryItems));
      setMenuItems(or(mapArray<MenuItem>(menuItemsData), mock.menuItems));
      setKegs(or(mapArray<Keg>(kegsData), mock.kegs));
      setDetailedRecipes(or(detailedRecipesData.map(mapDetailedRecipe), mock.detailedRecipes));

      if (settingsData) {
        const s = mapKeys(settingsData) as Record<string, string>;
        setSettings({
          businessName: s.businessName || defaultSettings.businessName,
          address: s.address || defaultSettings.address,
          phone: s.phone || defaultSettings.phone,
          email: s.email || defaultSettings.email,
          taxRate: s.taxRate || defaultSettings.taxRate,
          timezone: s.timezone || defaultSettings.timezone,
        });
      }
    } catch (err) {
      console.error('Failed to fetch brewery data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // --- Mutations --- (optimistic local + API call)

  const addToTab = useCallback((tabId: string, item: { name: string; size: string; price: number; qty: number }) => {
    // Optimistic local update
    setTabs(prev => prev.map(t => {
      if (t.id !== tabId) return t;
      const existing = t.items.find(i => i.name === item.name && i.size === item.size);
      const items = existing
        ? t.items.map(i => i.name === item.name && i.size === item.size ? { ...i, qty: i.qty + item.qty } : i)
        : [...t.items, item];
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      return { ...t, items, subtotal };
    }));
    api.post(`/pos/tabs/${tabId}/items`, item).catch(console.error);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => prev.filter(t => t.id !== tabId));
    api.post(`/pos/tabs/${tabId}/close`).catch(console.error);
  }, []);

  const holdTab = useCallback((tab: OpenTab) => {
    setTabs(prev => {
      const exists = prev.find(t => t.id === tab.id);
      if (exists) return prev.map(t => t.id === tab.id ? tab : t);
      return [...prev, tab];
    });
  }, []);

  const createTab = useCallback((tab: OpenTab) => {
    setTabs(prev => [...prev, tab]);
    api.post('/pos/tabs/', {
      customer_name: tab.customerName,
      customer_id: tab.customerId || null,
      server: tab.server,
      table_number: tab.tableNumber || null,
    }).catch(console.error);
  }, []);

  const updateTapLine = useCallback((tapNumber: number, updates: Partial<TapLine>) => {
    setTapLines(prev => prev.map(t => t.tapNumber === tapNumber ? { ...t, ...updates } : t));
    // Convert camelCase keys to snake_case for API
    const snakeUpdates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      snakeUpdates[k.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)] = v;
    }
    api.patch(`/taps/${tapNumber}`, snakeUpdates).catch(console.error);
  }, []);

  const advanceBatchStatus = useCallback((batchId: string) => {
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      const idx = statusOrder.indexOf(b.status);
      if (idx < 0 || idx >= statusOrder.length - 1) return b;
      return { ...b, status: statusOrder[idx + 1] };
    }));
    api.post(`/batches/${batchId}/advance-status`).catch(console.error);
  }, []);

  const addBatch = useCallback((batch: Omit<Batch, 'id'>) => {
    const tempId = `batch-${Date.now()}`;
    setBatches(prev => [...prev, { ...batch, id: tempId }]);
    const payload = toSnakeKeys(batch as unknown as Record<string, unknown>);
    // Remove fake beer_id — API will auto-generate
    if (payload.beer_id && String(payload.beer_id).startsWith('beer-')) delete payload.beer_id;
    api.post('/batches/', payload).then(() => fetchAll()).catch(console.error);
  }, [fetchAll]);

  const addGravityReading = useCallback((batchId: string, reading: GravityReading) => {
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      return { ...b, gravityReadings: [...b.gravityReadings, reading] };
    }));
    api.post(`/batches/${batchId}/gravity-readings`, {
      date: reading.date,
      gravity: reading.gravity,
      temp: reading.temp,
    }).catch(console.error);
  }, []);

  const updateTable = useCallback((tableId: string, updates: Partial<FloorTable>) => {
    setFloorTables(prev => prev.map(t => t.id === tableId ? { ...t, ...updates } : t));
    const snakeUpdates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      snakeUpdates[k.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)] = v;
    }
    api.patch(`/floor-plan/tables/${tableId}`, snakeUpdates).catch(console.error);
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setServiceAlerts(prev => prev.filter(a => a.id !== alertId));
    api.delete(`/floor-plan/alerts/${alertId}`).catch(console.error);
  }, []);

  const addAlert = useCallback((alert: ServiceAlert) => {
    setServiceAlerts(prev => [...prev, alert]);
    api.post('/floor-plan/alerts/', {
      table_id: alert.tableId,
      type: alert.type,
      message: alert.message,
      priority: alert.priority,
    }).catch(console.error);
  }, []);

  const seatGuests = useCallback((tableId: string, customerName: string, partySize: number, serverId: string, serverName: string, customerId?: string) => {
    const tabId = `tab-${Date.now()}`;
    const newTab: OpenTab = {
      id: tabId,
      customerName,
      customerId,
      items: [],
      openedAt: new Date().toISOString(),
      server: serverName,
      subtotal: 0,
      tableNumber: tableId,
    };
    setTabs(prev => [...prev, newTab]);
    setFloorTables(prev => prev.map(t => t.id === tableId ? {
      ...t,
      status: 'occupied' as const,
      currentTabId: tabId,
      currentCustomerName: customerName,
      currentCustomerId: customerId,
      partySize,
      serverId,
      serverName,
      seatedAt: new Date().toISOString(),
    } : t));
    api.post(`/floor-plan/tables/${tableId}/seat`, {
      customer_name: customerName,
      party_size: partySize,
      server_id: serverId,
      server_name: serverName,
      customer_id: customerId || null,
    }).catch(console.error);
  }, []);

  const clearTable = useCallback((tableId: string) => {
    setFloorTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      if (t.currentTabId) {
        setTabs(tabs => tabs.filter(tab => tab.id !== t.currentTabId));
      }
      return {
        ...t,
        status: 'available' as const,
        currentTabId: undefined,
        currentCustomerName: undefined,
        currentCustomerId: undefined,
        partySize: undefined,
        serverId: undefined,
        serverName: undefined,
        seatedAt: undefined,
        reservationId: undefined,
      };
    }));
    api.post(`/floor-plan/tables/${tableId}/clear`).catch(console.error);
  }, []);

  const addCustomer = useCallback((customer: Omit<Customer, 'id'>) => {
    const tempId = `c-${Date.now()}`;
    setCustomers(prev => [...prev, { ...customer, id: tempId }]);
    api.post('/customers/', toSnakeKeys(customer as unknown as Record<string, unknown>)).then(() => fetchAll()).catch(console.error);
  }, [fetchAll]);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const snakeUpdates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      snakeUpdates[k.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)] = v;
    }
    api.patch(`/customers/${id}`, snakeUpdates).catch(console.error);
  }, []);

  const addReservation = useCallback((reservation: Omit<Reservation, 'id'>) => {
    const tempId = `res-${Date.now()}`;
    setReservations(prev => [...prev, { ...reservation, id: tempId }]);
    api.post('/reservations/', toSnakeKeys(reservation as unknown as Record<string, unknown>)).then(() => fetchAll()).catch(console.error);
  }, [fetchAll]);

  const updateReservation = useCallback((id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    const snakeUpdates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      snakeUpdates[k.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)] = v;
    }
    api.patch(`/reservations/${id}`, snakeUpdates).catch(console.error);
  }, []);

  const addEvent = useCallback((event: Omit<BreweryEvent, 'id'>) => {
    const tempId = `evt-${Date.now()}`;
    setEvents(prev => [...prev, { ...event, id: tempId }]);
    api.post('/events/', toSnakeKeys(event as unknown as Record<string, unknown>)).then(() => fetchAll()).catch(console.error);
  }, [fetchAll]);

  const sellTickets = useCallback((sale: Omit<TicketSale, 'id' | 'ticketCode' | 'checkedIn' | 'purchasedAt'>) => {
    const id = `ts-${Date.now()}`;
    const eventPrefix = sale.eventId.substring(0, 4).toUpperCase();
    const ticketCode = `BH-${eventPrefix}-${String(Date.now()).slice(-4)}`;
    const newSale: TicketSale = {
      ...sale,
      id,
      ticketCode,
      checkedIn: false,
      purchasedAt: new Date().toISOString(),
    };
    setTicketSales(prev => [...prev, newSale]);
    // Update the event's ticketsSold count
    setEvents(prev => prev.map(e => e.id === sale.eventId
      ? { ...e, ticketsSold: e.ticketsSold + sale.quantity, revenue: e.revenue + sale.totalAmount }
      : e
    ));
  }, []);

  const checkInTicket = useCallback((saleId: string) => {
    setTicketSales(prev => prev.map(s => s.id === saleId
      ? { ...s, checkedIn: true, checkedInAt: new Date().toISOString() }
      : s
    ));
  }, []);

  const addCampaign = useCallback((campaign: Omit<EmailCampaign, 'id'>) => {
    const tempId = crypto.randomUUID();
    setEmailCampaigns(prev => [...prev, { ...campaign, id: tempId }]);
    api.post('/marketing/campaigns', toSnakeKeys(campaign as unknown as Record<string, unknown>)).then(() => fetchAll()).catch(console.error);
  }, [fetchAll]);

  const updateCampaign = useCallback((id: string, updates: Partial<EmailCampaign>) => {
    setEmailCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    api.patch(`/marketing/campaigns/${id}`, toSnakeKeys(updates as unknown as Record<string, unknown>)).catch(console.error);
  }, []);

  const addMugClubMember = useCallback((member: Omit<MugClubMember, 'id'>) => {
    const tempId = `mc-${Date.now()}`;
    setMugClubMembers(prev => [...prev, { ...member, id: tempId, customerId: member.customerId || tempId }]);
    const payload = toSnakeKeys(member as unknown as Record<string, unknown>);
    // Remove null/empty customer_id — API will auto-generate
    if (!payload.customer_id) delete payload.customer_id;
    api.post('/mug-club/', payload).then(() => fetchAll()).catch(console.error);
  }, [fetchAll]);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventoryItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    const snakeUpdates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      snakeUpdates[k.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)] = v;
    }
    api.patch(`/inventory/${id}`, snakeUpdates).catch(console.error);
  }, []);

  // ──── Inventory CRUD ────
  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    const tempId = `inv-${Date.now()}`;
    setInventoryItems(prev => [...prev, { ...item, id: tempId }]);
    api.post('/inventory/', toSnakeKeys(item as unknown as Record<string, unknown>)).then(() => fetchAll()).catch(console.error);
  }, [fetchAll]);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventoryItems(prev => prev.filter(item => item.id !== id));
    api.delete(`/inventory/${id}`).catch(console.error);
  }, []);

  // ──── Menu Item CRUD ────
  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    const tempId = `mi-${Date.now()}`;
    setMenuItems(prev => [...prev, { ...item, id: tempId }]);
    api.post('/menu-items/', toSnakeKeys(item as unknown as Record<string, unknown>)).then(() => fetchAll()).catch(console.error);
  }, [fetchAll]);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    const snakeUpdates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      snakeUpdates[k.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)] = v;
    }
    api.patch(`/menu-items/${id}`, snakeUpdates).catch(console.error);
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    api.delete(`/menu-items/${id}`).catch(console.error);
  }, []);

  // ──── Keg CRUD ────
  const addKeg = useCallback((keg: Omit<Keg, 'id'>) => {
    const tempId = `keg-${Date.now()}`;
    setKegs(prev => [...prev, { ...keg, id: tempId }]);
    const payload = toSnakeKeys(keg as unknown as Record<string, unknown>);
    // Remove null/empty current_beer_id — new kegs may not have beer assigned
    if (!payload.current_beer_id) delete payload.current_beer_id;
    api.post('/kegs/', payload).then(() => fetchAll()).catch(console.error);
  }, [fetchAll]);

  const updateKeg = useCallback((id: string, updates: Partial<Keg>) => {
    setKegs(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
    const snakeUpdates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      snakeUpdates[k.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)] = v;
    }
    api.patch(`/kegs/${id}`, snakeUpdates).catch(console.error);
  }, []);

  const deleteKeg = useCallback((id: string) => {
    setKegs(prev => prev.filter(k => k.id !== id));
    api.delete(`/kegs/${id}`).catch(console.error);
  }, []);

  // ──── Detailed Recipe CRUD ────
  const addDetailedRecipe = useCallback((recipe: Omit<DetailedRecipe, 'id'>) => {
    const tempId = `dr-${Date.now()}`;
    setDetailedRecipes(prev => [...prev, { ...recipe, id: tempId, beerId: recipe.beerId || tempId }]);
    const payload = toSnakeKeys(recipe as unknown as Record<string, unknown>);
    // Remove null/empty beer_id — API will auto-generate
    if (!payload.beer_id) delete payload.beer_id;
    api.post('/detailed-recipes/', payload).then(() => fetchAll()).catch(console.error);
  }, [fetchAll]);

  const updateDetailedRecipe = useCallback((id: string, updates: Partial<DetailedRecipe>) => {
    setDetailedRecipes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    const snakeUpdates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      snakeUpdates[k.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)] = v;
    }
    api.patch(`/detailed-recipes/${id}`, snakeUpdates).catch(console.error);
  }, []);

  const deleteDetailedRecipe = useCallback((id: string) => {
    setDetailedRecipes(prev => prev.filter(r => r.id !== id));
    api.delete(`/detailed-recipes/${id}`).catch(console.error);
  }, []);

  const updateSettings = useCallback((updates: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    const snakeUpdates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      snakeUpdates[k.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)] = v;
    }
    api.patch('/settings/', snakeUpdates).catch(console.error);
  }, []);

  const addBeerRating = useCallback((rating: Omit<BeerRating, 'id'>) => {
    const newRating = { ...rating, id: `r-${crypto.randomUUID()}` };
    setBeerRatings(prev => [newRating, ...prev]);
  }, []);

  const deleteBeerRating = useCallback((id: string) => {
    setBeerRatings(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <BreweryContext.Provider value={{
      tabs, tapLines: tapLineState, batches: batchState, floorTables, serviceAlerts,
      customers, reservations, events, ticketSales, emailCampaigns, mugClubMembers, inventoryItems,
      menuItems: menuItemsState, kegs: kegsState, detailedRecipes: detailedRecipesState,
      settings, loading,
      addToTab, closeTab, holdTab, createTab, updateTapLine, advanceBatchStatus, addBatch, addGravityReading,
      updateTable, dismissAlert, addAlert, seatGuests, clearTable,
      addCustomer, updateCustomer, addReservation, updateReservation,
      addEvent, sellTickets, checkInTicket, addCampaign, updateCampaign, addMugClubMember,
      updateInventoryItem, addInventoryItem, deleteInventoryItem,
      addMenuItem, updateMenuItem, deleteMenuItem,
      addKeg, updateKeg, deleteKeg,
      addDetailedRecipe, updateDetailedRecipe, deleteDetailedRecipe,
      updateSettings, beerRatings, addBeerRating, deleteBeerRating, refetch: fetchAll,
    }}>
      {children}
    </BreweryContext.Provider>
  );
}

export function useBrewery() {
  const ctx = useContext(BreweryContext);
  if (!ctx) throw new Error('useBrewery must be used within BreweryProvider');
  return ctx;
}
