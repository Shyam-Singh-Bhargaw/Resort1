import React, { useEffect, useState } from "react";
import { useCottage, useExtraBedsForAccommodation, useAllExtraBeds } from "@/hooks/useApi";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/ui/OptimizedImage";

function ExtraBeddingSection({ cottage, onSelectForBooking }: { cottage: any, onSelectForBooking?: (selection: { include: boolean; extraBedId?: string | null; qty?: number }) => void }) {
  const accId = cottage?.id || cottage?._id || null;
  // For now, force-enable extra bedding UI for all cottages (override backend flags)
  const allowedFlag = true;
  const allowedIds: number[] | undefined = cottage.allowedExtraBedIds ?? cottage.allowed_extra_bed_ids ?? undefined;
  // fetch all extra bed types when allowed
  const { data: allExtraBeds, loading: allEbLoading } = useAllExtraBeds();
  const availableFromCottage = cottage.extra_bedding ?? cottage.extra_beds ?? cottage.extraBedding;
  const bedsList = Array.isArray(allExtraBeds) ? allExtraBeds : [];
  const filteredBeds = allowedIds && Array.isArray(allowedIds) && allowedIds.length > 0
    ? bedsList.filter((b: any) => allowedIds.includes(Number(b.id || b._id || b.typeId || b.type)))
    : bedsList;

  const [selectedBedId, setSelectedBedId] = useState<string | null>(filteredBeds.length > 0 ? String(filteredBeds[0].id || filteredBeds[0]._id) : null);
  const [qty, setQty] = useState<number>(1);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [includeInBooking, setIncludeInBooking] = useState(false);

  useEffect(() => {
    if (onSelectForBooking) onSelectForBooking({ include: includeInBooking, extraBedId: selectedBedId, qty });
  }, [includeInBooking, selectedBedId, qty, onSelectForBooking]);

  const handleRequest = async () => {
    if (!accId) {
      setStatus("Accommodation id missing");
      return;
    }
    if (qty <= 0) {
      setStatus("Select quantity");
      return;
    }
    try {
      setIsLoading(true);
      setStatus(null);
      await apiClient.requestExtraBed({ accommodation_id: accId, quantity: qty });
      setStatus("Request submitted");
    } catch (err: any) {
      setStatus(err?.detail || err?.message || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Always render the extra bedding section (we allow it client-side by default)

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-medium mb-2">Optional Extra Bedding</h4>
      {allEbLoading ? (
        <p className="text-sm text-muted-foreground">Loading options…</p>
      ) : filteredBeds && filteredBeds.length > 0 ? (
        <fieldset className="space-y-2">
          <legend className="sr-only">Optional Extra Bedding</legend>
          {filteredBeds.map((b: any) => (
            <label key={b.id || b._id} className="flex items-center gap-3">
              <input type="radio" name="extraBed" value={b.id || b._id} checked={String(selectedBedId) === String(b.id || b._id)} onChange={() => setSelectedBedId(String(b.id || b._id))} />
              <span className="text-sm">{b.name || b.title || b.label} – ₹{b.pricePerNight || b.price || b.amount || '0'} / night</span>
            </label>
          ))}
          <div className="flex items-center gap-3 mt-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={includeInBooking} onChange={(e) => setIncludeInBooking(e.target.checked)} />
              <span className="text-sm">Add to booking</span>
            </label>
            <label className="text-sm text-muted-foreground">Quantity</label>
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className="p-1 rounded border">
              {Array.from({ length: Math.max(1, (availableFromCottage || 1)) }).map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <Button onClick={handleRequest} disabled={isLoading}>{isLoading ? 'Requesting…' : 'Request Extra Bed'}</Button>
          </div>
        </fieldset>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">No specific extra-bed types configured — use the default extra bedding for this cottage.</p>
          <div className="flex items-center gap-3 mt-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={includeInBooking} onChange={(e) => setIncludeInBooking(e.target.checked)} />
              <span className="text-sm">Add extra bedding to booking</span>
            </label>
            <label className="text-sm text-muted-foreground">Quantity</label>
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className="p-1 rounded border">
              {Array.from({ length: Math.max(1, (availableFromCottage || 1)) }).map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            { (cottage.extra_bedding_price || cottage.extraBeddingPrice) && (
              <span className="text-sm">₹{cottage.extra_bedding_price || cottage.extraBeddingPrice} / night</span>
            ) }
            <Button onClick={handleRequest} disabled={isLoading}>{isLoading ? 'Requesting…' : 'Request Extra Bed'}</Button>
          </div>
        </div>
      )}
      {status && <p className="text-sm mt-2">{status}</p>}
    </div>
  );
}

export default function CottageDetailModal({ id, onClose, onBook }: { id: string | null; onClose: () => void; onBook?: (id: string, extraBedId?: string | null, extraBedQty?: number, adults?: number, children?: number) => void }) {
  const { data, loading, error } = useCottage(id || undefined);
  const [selectedExtraForBooking, setSelectedExtraForBooking] = useState<{ include: boolean; extraBedId?: string | null; qty?: number } | null>(null);
  const [selectedAdults, setSelectedAdults] = useState<number>(1);
  const [selectedChildren, setSelectedChildren] = useState<number>(0);

  if (!id) return null;

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded shadow">Loading…</div>
    </div>
  );
  if (error) return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded shadow">Error loading cottage.</div>
    </div>
  );

  const cottage = data as any;
  const images: string[] = (cottage && cottage.media && Array.isArray(cottage.media) && cottage.media.length > 0) ? cottage.media : (cottage && cottage.images) || [];

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-4xl w-full bg-background border border-border rounded-lg shadow-xl overflow-auto max-h-[90vh]">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-2xl mb-2">{cottage.title || cottage.name}</h2>
                <span className="inline-block text-xs px-2 py-1 bg-muted rounded text-muted-foreground" title={`Capacity: ${(cottage.capacity_adults ?? cottage.capacity ?? 0)} adults • ${(cottage.capacity_children ?? 0)} children`}>
                  {(cottage.capacity_adults ?? cottage.capacity ?? 0)}a{(cottage.capacity_children ?? 0) ? ` • ${cottage.capacity_children}c` : ''}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{cottage.description}</p>
            </div>
            <div>
              <Button variant="ghost" onClick={onClose}>Close</Button>
            </div>
          </div>

          {/* Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {images.length > 0 ? images.map((src, i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden rounded">
                <OptimizedImage src={src} alt={cottage.title || `Image ${i+1}`} className="w-full h-full object-cover" />
              </div>
            )) : (
              <div className="col-span-3 text-center text-muted-foreground">No images available</div>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-medium mb-2">Amenities</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {(cottage.amenities || []).map((a: string) => <li key={a}>{a}</li>)}
              </ul>

              <h3 className="font-medium mt-4 mb-2">Capacity</h3>
              <p className="text-sm">{cottage.capacity || cottage.capacity_max || cottage.maxGuests || '—'} guests</p>

              <h3 className="font-medium mt-4 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {((cottage.tags || cottage.metadata?.tags) || []).map((t: string) => (
                  <span key={t} className="text-xs px-2 py-1 bg-muted rounded">{t}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Price</h3>
              <p className="text-2xl font-serif text-primary">{cottage.price_per_night || cottage.price || '—'}</p>

              { (cottage.extra_bedding || cottage.extra_beds || cottage.extraBedding) ? (
                <div className="mt-3">
                  <p className="text-sm">Extra bedding available: {cottage.extra_bedding ?? cottage.extra_beds ?? cottage.extraBedding} pcs</p>
                  { (cottage.extra_bedding_price || cottage.extraBeddingPrice) && (
                    <p className="text-sm text-muted-foreground">Extra bedding: {cottage.extra_bedding_price || cottage.extraBeddingPrice} per night</p>
                  )}
                </div>
              ) : null }

              {/* Fetch extra-bed entries from backend */}
              <ExtraBeddingSection cottage={cottage} onSelectForBooking={setSelectedExtraForBooking} />

              <h3 className="font-medium mt-4 mb-2">Availability</h3>
              <p className="text-sm text-muted-foreground">{cottage.available ? 'Available' : 'Unavailable / Maintenance'}</p>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Guests</h4>
                <div className="flex items-center gap-3">
                  <label className="text-sm">Adults</label>
                  <select value={selectedAdults} onChange={(e) => setSelectedAdults(Number(e.target.value))} className="p-1 rounded border">
                    {Array.from({ length: Math.max(1, (cottage.capacity_adults ?? cottage.capacity ?? 2)) }).map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                  </select>
                  <label className="text-sm">Children</label>
                  <select value={selectedChildren} onChange={(e) => setSelectedChildren(Number(e.target.value))} className="p-1 rounded border">
                    {Array.from({ length: Math.max(1, (cottage.capacity_children ?? 0) + 1) }).map((_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Per-room selection: if backend provides per-accommodation rooms, allow selecting a specific room */}
              {Array.isArray(cottage.rooms) && cottage.rooms.length > 0 ? (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Rooms</h4>
                  <div className="flex flex-col gap-2">
                    {cottage.rooms.map((r: any, idx: number) => (
                      <label key={r.id || r._id || idx} className="p-3 border rounded flex items-center gap-3">
                        <input
                          type="radio"
                          name="selectedRoom"
                          value={r.id || r._id}
                          defaultChecked={idx === 0}
                          onChange={() => { /* selection handled onBook click via form state */ }}
                          className="form-radio"
                          aria-label={`Select room ${r.name}`}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{r.name}</div>
                          <div className="text-sm text-muted-foreground">{(r.capacity || r.capacity === 0) ? `${r.capacity} guests` : ''} • {r.price_per_night || r.price || '—'} / night</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{r.available ? 'Available' : 'Unavailable'}</div>
                      </label>
                    ))}
                    <div className="text-sm text-muted-foreground mt-2">Select a room above, then click <strong>Book This Cottage</strong> to proceed.</div>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex gap-3">
                  <Button onClick={() => {
                  // If a room radio is selected, prefer that id; else fall back to cottage id
                  let roomId: string | null = null;
                  try {
                    const el = document.querySelector('input[name="selectedRoom"]:checked') as HTMLInputElement | null;
                    if (el && el.value) roomId = el.value;
                  } catch (err) { /* ignore DOM access errors */ }
                  const idToBook = roomId || cottage.id || cottage._id;
                  if (onBook && idToBook) onBook(String(idToBook), selectedExtraForBooking?.extraBedId ?? null, selectedExtraForBooking?.qty ?? 0, selectedAdults, selectedChildren);
                }}>Book This Cottage</Button>
                <Button variant="outline" onClick={onClose}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
