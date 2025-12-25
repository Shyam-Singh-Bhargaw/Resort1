import React, { createContext, useContext, useEffect, useState } from "react";

export interface BookingItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  portion?: string;
  paid?: boolean;
}

interface BookingContextValue {
  items: BookingItem[];
  addItem: (it: Omit<BookingItem, 'qty' | 'paid'>, qty?: number, payNow?: boolean) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  payItem: (id: string) => Promise<void>;
  payAll: () => Promise<void>;
  clear: () => void;
  total: number;
}

const BookingContext = createContext<BookingContextValue | null>(null);

const STORAGE_KEY = "booking_v1";

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BookingItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const total = items.reduce((s, it) => s + it.price * it.qty, 0);

  const addItem = (it: Omit<BookingItem, 'qty' | 'paid'>, qty = 1, payNow = false) => {
    setItems((prev) => {
      const exists = prev.find(p => p.id === it.id);
      if (exists) {
        return prev.map(p => p.id === it.id ? { ...p, qty: p.qty + qty } : p);
      }
      const newItem: BookingItem = { ...it, qty, paid: !!payNow } as BookingItem;
      return [newItem, ...prev];
    });

    if (payNow) {
      // simulate payment - mark paid after tiny delay
      setTimeout(() => {
        setItems(prev => prev.map(p => p.id === it.id ? { ...p, paid: true } : p));
      }, 600);
    }
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(p => p.id !== id));
  const updateQty = (id: string, qty: number) => setItems(prev => prev.map(p => p.id === id ? { ...p, qty } : p));

  const payItem = async (id: string) => {
    // dummy payment flow
    await new Promise(res => setTimeout(res, 600));
    setItems(prev => prev.map(p => p.id === id ? { ...p, paid: true } : p));
  };

  const payAll = async () => {
    await new Promise(res => setTimeout(res, 700));
    setItems(prev => prev.map(p => ({ ...p, paid: true })));
  };

  const clear = () => setItems([]);

  return (
    <BookingContext.Provider value={{ items, addItem, removeItem, updateQty, payItem, payAll, clear, total }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
