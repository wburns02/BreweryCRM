import { createContext, useContext, useState, useCallback } from 'react';
import type { OpenTab, TapLine, Batch, GravityReading, FloorTable, ServiceAlert } from '../types';
import { openTabs as initialTabs, tapLines as initialTapLines, batches as initialBatches, floorTables as initialFloorTables, serviceAlerts as initialAlerts } from '../data/mockData';

interface BreweryState {
  tabs: OpenTab[];
  tapLines: TapLine[];
  batches: Batch[];
  floorTables: FloorTable[];
  serviceAlerts: ServiceAlert[];
  addToTab: (tabId: string, item: { name: string; size: string; price: number; qty: number }) => void;
  closeTab: (tabId: string) => void;
  holdTab: (tab: OpenTab) => void;
  createTab: (tab: OpenTab) => void;
  updateTapLine: (tapNumber: number, updates: Partial<TapLine>) => void;
  advanceBatchStatus: (batchId: string) => void;
  addGravityReading: (batchId: string, reading: GravityReading) => void;
  updateTable: (tableId: string, updates: Partial<FloorTable>) => void;
  dismissAlert: (alertId: string) => void;
  addAlert: (alert: ServiceAlert) => void;
  seatGuests: (tableId: string, customerName: string, partySize: number, serverId: string, serverName: string, customerId?: string) => void;
  clearTable: (tableId: string) => void;
}

const BreweryContext = createContext<BreweryState | null>(null);

const statusOrder: Batch['status'][] = ['planned', 'mashing', 'boiling', 'fermenting', 'conditioning', 'carbonating', 'ready', 'packaged'];

export function BreweryProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<OpenTab[]>(initialTabs);
  const [tapLineState, setTapLines] = useState<TapLine[]>(initialTapLines);
  const [batchState, setBatches] = useState<Batch[]>(initialBatches);
  const [floorTables, setFloorTables] = useState<FloorTable[]>(initialFloorTables);
  const [serviceAlerts, setServiceAlerts] = useState<ServiceAlert[]>(initialAlerts);

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

  return (
    <BreweryContext.Provider value={{
      tabs, tapLines: tapLineState, batches: batchState, floorTables, serviceAlerts,
      addToTab, closeTab, holdTab, createTab, updateTapLine, advanceBatchStatus, addGravityReading,
      updateTable, dismissAlert, addAlert, seatGuests, clearTable,
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
