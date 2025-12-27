import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import OptimizedImage from '@/components/ui/OptimizedImage';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.request('/bookings/me');
        if (mounted) setBookings(Array.isArray(res) ? res : []);
      } catch (err) {
        setBookings([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!bookings || bookings.length === 0) return <div className="p-6">No bookings found.</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-serif mb-4">My Bookings</h2>
      <div className="space-y-4">
        {bookings.map(b => (
          <div key={b.id} className="p-4 border rounded bg-card flex items-center gap-4">
            <div className="w-20 h-14 rounded overflow-hidden">
              <OptimizedImage src={b.accommodation?.images?.[0] || '/assets/luxury-suite.jpg'} alt={b.accommodation?.name || 'room'} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{b.accommodation?.name || b.accommodation_id}</div>
              <div className="text-sm text-muted-foreground">{new Date(b.check_in).toLocaleDateString()} → {new Date(b.check_out).toLocaleDateString()}</div>
              <div className="text-sm">{b.guests} guests</div>
            </div>
            <div className="text-sm">{b.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
