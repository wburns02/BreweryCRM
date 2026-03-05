import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { OpenTab, TapLine, Batch, GravityReading, FloorTable, ServiceAlert, Customer, Reservation, BreweryEvent, EmailCampaign, MugClubMember, InventoryItem, MenuItem, Keg, DetailedRecipe } from '../types';
import { api } from '../api/client';

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
  addEvent: (event: Omit<BreweryEvent, 'id'>) => void;
  addCampaign: (campaign: Omit<EmailCampaign, 'id'>) => void;
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
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [mugClubMembers, setMugClubMembers] = useState<MugClubMember[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [menuItemsState, setMenuItems] = useState<MenuItem[]>([]);
  const [kegsState, setKegs] = useState<Keg[]>([]);
  const [detailedRecipesState, setDetailedRecipes] = useState<DetailedRecipe[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
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

      setTabs(mapArray<OpenTab>(tabsData));
      setTapLines(mapArray<TapLine>(tapsData));
      setBatches(mapArray<Batch>(batchesData));
      setFloorTables(mapArray<FloorTable>(tablesData));
      setServiceAlerts(mapArray<ServiceAlert>(alertsData));
      setCustomers(mapArray<Customer>(customersData));
      setReservations(mapArray<Reservation>(reservationsData));
      setEvents(mapArray<BreweryEvent>(eventsData));
      setEmailCampaigns(mapArray<EmailCampaign>(campaignsData));
      setMugClubMembers(mapArray<MugClubMember>(mugClubData));
      setInventoryItems(mapArray<InventoryItem>(inventoryData));
      setMenuItems(mapArray<MenuItem>(menuItemsData));
      setKegs(mapArray<Keg>(kegsData));
      setDetailedRecipes(mapArray<DetailedRecipe>(detailedRecipesData));

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
    api.post('/batches/', batch).then(() => fetchAll()).catch(console.error);
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

  const addCampaign = useCallback((campaign: Omit<EmailCampaign, 'id'>) => {
    const tempId = `camp-${Date.now()}`;
    setEmailCampaigns(prev => [...prev, { ...campaign, id: tempId }]);
    api.post('/marketing/campaigns', toSnakeKeys(campaign as unknown as Record<string, unknown>)).then(() => fetchAll()).catch(console.error);
  }, [fetchAll]);

  const addMugClubMember = useCallback((member: Omit<MugClubMember, 'id'>) => {
    const tempId = `mc-${Date.now()}`;
    setMugClubMembers(prev => [...prev, { ...member, id: tempId }]);
    api.post('/mug-club/', toSnakeKeys(member as unknown as Record<string, unknown>)).then(() => fetchAll()).catch(console.error);
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
    api.post('/kegs/', toSnakeKeys(keg as unknown as Record<string, unknown>)).then(() => fetchAll()).catch(console.error);
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
    setDetailedRecipes(prev => [...prev, { ...recipe, id: tempId }]);
    api.post('/detailed-recipes/', toSnakeKeys(recipe as unknown as Record<string, unknown>)).then(() => fetchAll()).catch(console.error);
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

  return (
    <BreweryContext.Provider value={{
      tabs, tapLines: tapLineState, batches: batchState, floorTables, serviceAlerts,
      customers, reservations, events, emailCampaigns, mugClubMembers, inventoryItems,
      menuItems: menuItemsState, kegs: kegsState, detailedRecipes: detailedRecipesState,
      settings, loading,
      addToTab, closeTab, holdTab, createTab, updateTapLine, advanceBatchStatus, addBatch, addGravityReading,
      updateTable, dismissAlert, addAlert, seatGuests, clearTable,
      addCustomer, updateCustomer, addReservation, updateReservation,
      addEvent, addCampaign, addMugClubMember,
      updateInventoryItem, addInventoryItem, deleteInventoryItem,
      addMenuItem, updateMenuItem, deleteMenuItem,
      addKeg, updateKeg, deleteKeg,
      addDetailedRecipe, updateDetailedRecipe, deleteDetailedRecipe,
      updateSettings, refetch: fetchAll,
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
