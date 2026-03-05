import { createContext, useContext, useState, useCallback } from 'react';
import type { OpenTab, TapLine, Batch, GravityReading, FloorTable, ServiceAlert, Customer, Reservation, BreweryEvent, EmailCampaign, MugClubMember, InventoryItem } from '../types';
import { openTabs as initialTabs, tapLines as initialTapLines, batches as initialBatches, floorTables as initialFloorTables, serviceAlerts as initialAlerts, customers as initialCustomers, reservations as initialReservations, events as initialEvents, emailCampaigns as initialCampaigns, mugClubMembers as initialMugClubMembers, inventoryItems as initialInventoryItems } from '../data/mockData';

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
  settings: BusinessSettings;
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
  updateSettings: (updates: Partial<BusinessSettings>) => void;
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

export function BreweryProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<OpenTab[]>(initialTabs);
  const [tapLineState, setTapLines] = useState<TapLine[]>(initialTapLines);
  const [batchState, setBatches] = useState<Batch[]>(initialBatches);
  const [floorTables, setFloorTables] = useState<FloorTable[]>(initialFloorTables);
  const [serviceAlerts, setServiceAlerts] = useState<ServiceAlert[]>(initialAlerts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [events, setEvents] = useState<BreweryEvent[]>(initialEvents);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>(initialCampaigns);
  const [mugClubMembers, setMugClubMembers] = useState<MugClubMember[]>(initialMugClubMembers);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);

  const addToTab = useCallback((tabId: string, item: { name: string; size: string; price: number; qty: number }) => {
    setTabs(prev => prev.map(t => {
      if (t.id !== tabId) return t;
      const existing = t.items.find(i => i.name === item.name && i.size === item.size);
      const items = existing
        ? t.items.map(i => i.name === item.name && i.size === item.size ? { ...i, qty: i.qty + item.qty } : i)
        : [...t.items, item];
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      return { ...t, items, subtotal };
    }));
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => prev.filter(t => t.id !== tabId));
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
  }, []);

  const updateTapLine = useCallback((tapNumber: number, updates: Partial<TapLine>) => {
    setTapLines(prev => prev.map(t => t.tapNumber === tapNumber ? { ...t, ...updates } : t));
  }, []);

  const advanceBatchStatus = useCallback((batchId: string) => {
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      const idx = statusOrder.indexOf(b.status);
      if (idx < 0 || idx >= statusOrder.length - 1) return b;
      return { ...b, status: statusOrder[idx + 1] };
    }));
  }, []);

  const addBatch = useCallback((batch: Omit<Batch, 'id'>) => {
    setBatches(prev => [...prev, { ...batch, id: `batch-${Date.now()}` }]);
  }, []);

  const addGravityReading = useCallback((batchId: string, reading: GravityReading) => {
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      return { ...b, gravityReadings: [...b.gravityReadings, reading] };
    }));
  }, []);

  const updateTable = useCallback((tableId: string, updates: Partial<FloorTable>) => {
    setFloorTables(prev => prev.map(t => t.id === tableId ? { ...t, ...updates } : t));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setServiceAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const addAlert = useCallback((alert: ServiceAlert) => {
    setServiceAlerts(prev => [...prev, alert]);
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
  }, []);

  const addCustomer = useCallback((customer: Omit<Customer, 'id'>) => {
    setCustomers(prev => [...prev, { ...customer, id: `c-${Date.now()}` }]);
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const addReservation = useCallback((reservation: Omit<Reservation, 'id'>) => {
    setReservations(prev => [...prev, { ...reservation, id: `res-${Date.now()}` }]);
  }, []);

  const updateReservation = useCallback((id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const addEvent = useCallback((event: Omit<BreweryEvent, 'id'>) => {
    setEvents(prev => [...prev, { ...event, id: `evt-${Date.now()}` }]);
  }, []);

  const addCampaign = useCallback((campaign: Omit<EmailCampaign, 'id'>) => {
    setEmailCampaigns(prev => [...prev, { ...campaign, id: `camp-${Date.now()}` }]);
  }, []);

  const addMugClubMember = useCallback((member: Omit<MugClubMember, 'id'>) => {
    setMugClubMembers(prev => [...prev, { ...member, id: `mc-${Date.now()}` }]);
  }, []);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventoryItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const updateSettings = useCallback((updates: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <BreweryContext.Provider value={{
      tabs, tapLines: tapLineState, batches: batchState, floorTables, serviceAlerts,
      customers, reservations, events, emailCampaigns, mugClubMembers, inventoryItems, settings,
      addToTab, closeTab, holdTab, createTab, updateTapLine, advanceBatchStatus, addBatch, addGravityReading,
      updateTable, dismissAlert, addAlert, seatGuests, clearTable,
      addCustomer, updateCustomer, addReservation, updateReservation,
      addEvent, addCampaign, addMugClubMember, updateInventoryItem, updateSettings,
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
