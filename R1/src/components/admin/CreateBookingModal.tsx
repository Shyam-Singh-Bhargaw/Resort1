import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAccommodations, useBookings } from "@/hooks/useApi";
import { useCreateBooking, useDeleteBooking } from "@/hooks/useApiMutation";
import { toast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/utils";

export function CreateBookingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: accommodations, refetch: refetchAccommodations } = useAccommodations();
  const { refetch: refetchBookings } = useBookings();
  const { mutate: createBooking, loading: creating, error: createError } = useCreateBooking();
  const { mutate: deleteBooking } = useDeleteBooking();

  const [guestName, setGuestName] = useState("");
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [checkIn, setCheckIn] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      // reset
      setGuestName("");
      setRoomId(accommodations && accommodations[0] ? accommodations[0].id : undefined);
      setCheckIn("");
      setFieldErrors({});
    }
  }, [open, accommodations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!guestName.trim() || !roomId || !checkIn) {
      const localErrors: Record<string, string[]> = {};
      if (!guestName.trim()) localErrors['guest_name'] = ['Guest name is required'];
      if (!roomId) localErrors['room_id'] = ['Select a room'];
      if (!checkIn) localErrors['check_in'] = ['Select check-in date'];
      setFieldErrors(localErrors);
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        guest_name: guestName,
        room_id: roomId,
        check_in: checkIn,
        status: "pending",
      };
      // include adults/children if provided
      if (typeof adults === 'number') payload.adults = adults;
      if (typeof children === 'number') payload.children = children;

      const res: any = await createBooking(payload as any);
      if (res && res.id) {
        refetchBookings?.();
        onOpenChange(false);
        const t = toast({
          title: "Booking created",
          description: `Booking ${res.id} created`,
          action: (
            <Button size="sm" variant="outline" onClick={async () => {
              await deleteBooking(res.id as any);
              refetchBookings?.();
              t.dismiss?.();
            }}>Undo</Button>
          ),
        });
      } else {
        // Show server-side validation errors if present
        if (createError) {
          setFieldErrors(parseApiError(createError));
        } else {
          alert("Failed to create booking");
        }
      }
    } catch (err) {
      console.warn(err);
      if ((err as any)?.detail || createError) {
        setFieldErrors(parseApiError((err as any) || createError));
      } else {
        alert("Error creating booking");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Booking</DialogTitle>
          <DialogDescription>Quickly create a booking for a guest.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Guest Name</label>
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Guest name" required />
            {fieldErrors['guest_name'] && <p className="text-xs text-destructive mt-1">{fieldErrors['guest_name'][0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Room</label>
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Select room" required>
              {(accommodations || []).map((a: any) => (
                <option key={a.id} value={a.id}>{a.title || a.name}</option>
              ))}
            </select>
            {fieldErrors['room_id'] && <p className="text-xs text-destructive mt-1">{fieldErrors['room_id'][0]}</p>}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Adults</label>
              <input type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value || 1))} className="w-full px-3 py-2 border border-border rounded bg-muted" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Children</label>
              <input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value || 0))} className="w-full px-3 py-2 border border-border rounded bg-muted" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Check-in Date</label>
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Check-in date" required />
            {fieldErrors['check_in'] && <p className="text-xs text-destructive mt-1">{fieldErrors['check_in'][0]}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Booking"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
