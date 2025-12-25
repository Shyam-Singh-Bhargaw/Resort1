import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";

interface BookingItemLocal { id: string; name: string; price: number; qty: number; paid?: boolean; }

export default function AdminBookingsPage() {
  const [items, setItems] = useState<BookingItemLocal[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('booking_v1');
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const total = items.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <Layout>
      <main className="container-padding py-12">
        <h1 className="text-2xl font-serif">Admin — Bookings & Expenses</h1>
        <p className="text-sm text-muted-foreground mt-2">Local booking records (stored in localStorage). For production, wire to backend endpoints.</p>

        <div className="mt-6">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No bookings yet.</div>
          ) : (
            <div className="space-y-3">
              {items.map(it => (
                <div key={it.id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-muted-foreground">Qty: {it.qty} • ₹{it.price} each</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{it.price * it.qty}</div>
                    <div className="text-xs text-muted-foreground">{it.paid ? 'Paid' : 'Unpaid'}</div>
                  </div>
                </div>
              ))}
              <div className="p-3 border rounded">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">Total</div>
                  <div className="font-semibold">₹{total}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
