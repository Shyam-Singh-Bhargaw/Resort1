import React, { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api-client';

const client = new ApiClient();

export default function RoomsTest() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  useEffect(() => {
    (async () => {
      try {
        const items = await client.getAllCottages({ limit: 10 });
        setData(items);
        console.log('Cottages (rooms mapped):', items);
      } catch (err) {
        setError(err);
        console.error(err);
      }
    })();
  }, []);

  if (error) return <div>Error: {String(error.message || error)}</div>;
  if (!data) return <div>Loading cottages…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Rooms Test</h1>
      {Array.isArray(data) ? (
        data.map((c: any) => (
          <div key={c.id} className="mb-4 border p-4 rounded">
            <h2 className="font-bold">{c.name || c.title || c.id}</h2>
            <div>Rooms:</div>
            <ul>
              {Array.isArray(c.rooms) && c.rooms.length > 0 ? c.rooms.map((r:any) => (
                <li key={r.id}>{r.name || r.id} — capacity: {r.capacity} — price: {r.price_per_night} — available: {String(r.available)}</li>
              )) : <li>No rooms</li>}
            </ul>
          </div>
        ))
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
