import React, { useState } from "react";
import { useBooking } from "@/context/BookingContext";
import OptimizedImage from "@/components/ui/OptimizedImage";

export default function CartDrawer() {
  const { items, total, removeItem, payAll, payItem, updateQty, clear } = useBooking();
  const [open, setOpen] = useState(false);
  // Only show cart toggle when there are items in the booking cart
  if (!items || items.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(s => !s)}
        aria-label="Toggle cart"
        className="fixed right-6 bottom-6 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg"
      >
        Cart ({items.length}) • ₹{total}
      </button>

      {open && (
        <div className="fixed right-6 bottom-20 z-50 w-96 max-w-full bg-background border border-border rounded-lg shadow-xl p-4">
          <h3 className="font-semibold">Booking Cart</h3>
          <div className="mt-3 space-y-3 max-h-64 overflow-auto">
            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground">No items yet.</div>
            ) : (
              items.map(it => (
                <div key={it.id} className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-muted rounded overflow-hidden">
                    <OptimizedImage src={it.imageUrl as any || ''} alt={it.name} fallbackQuery={it.name} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">₹{it.price} × {it.qty}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button className="text-sm text-primary" onClick={() => payItem(it.id)}>Pay</button>
                    <button className="text-xs text-muted-foreground" onClick={() => removeItem(it.id)}>Remove</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 border-t pt-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="font-semibold">₹{total}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => { clear(); setOpen(false); }}>Clear</button>
              <button className="btn btn-primary" onClick={async () => { await payAll(); setOpen(false); }}>Pay All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
