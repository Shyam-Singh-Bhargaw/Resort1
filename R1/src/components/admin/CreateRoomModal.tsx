import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAccommodations } from "@/hooks/useApi";
import { useCreateAccommodation, useDeleteAccommodation } from "@/hooks/useApiMutation";
import { toast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/utils";

export function CreateRoomModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { refetch: refetchAccommodations } = useAccommodations();
  const { mutate: createAccommodation, loading: creating, error: createError } = useCreateAccommodation();
  const { mutate: deleteAccommodation } = useDeleteAccommodation();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [extraBeddingCount, setExtraBeddingCount] = useState("");
  const [extraBeddingPrice, setExtraBeddingPrice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string,string[]>>({});

  useEffect(() => {
    if (open) {
      setTitle("");
      setSlug("");
      setPrice("");
      setExtraBeddingCount("");
      setExtraBeddingPrice("");
      setFieldErrors({});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!title.trim()) { setFieldErrors({ title: ['Title is required'] }); return; }

    try {
      const payload = {
        title: title,
        slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
        price: Number(price) || 0,
        extra_bedding: extraBeddingCount ? Number(extraBeddingCount) : undefined,
        extra_bedding_price: extraBeddingPrice ? Number(extraBeddingPrice) : undefined,
      };

      const res: any = await createAccommodation(payload as any);
      if (res && res.id) {
        refetchAccommodations?.();
        try { localStorage.setItem('rooms.updated', String(Date.now())); } catch (e) {}
        onOpenChange(false);
        const t = toast({
          title: "Room created",
          description: res.title || res.name,
          action: (
            <Button size="sm" variant="outline" onClick={async () => {
              await deleteAccommodation(res.id as any);
              refetchAccommodations?.();
              t.dismiss?.();
            }}>Undo</Button>
          ),
        });
      } else {
        if (createError) setFieldErrors(parseApiError(createError));
        else alert("Failed to create room");
      }
    } catch (err) {
      console.warn(err);
      setFieldErrors(parseApiError((err as any) || createError));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>Quickly add a new accommodation.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Room title" required />
            {fieldErrors['title'] && <p className="text-xs text-destructive mt-1">{fieldErrors['title'][0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Slug (optional)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Room slug" />
            {fieldErrors['slug'] && <p className="text-xs text-destructive mt-1">{fieldErrors['slug'][0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Room price" />
            {fieldErrors['price'] && <p className="text-xs text-destructive mt-1">{fieldErrors['price'][0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Extra Bedding (count)</label>
            <input type="number" min={0} value={extraBeddingCount} onChange={(e) => setExtraBeddingCount(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Extra bedding count" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Extra Bedding Price (per night)</label>
            <input type="number" min={0} value={extraBeddingPrice} onChange={(e) => setExtraBeddingPrice(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Extra bedding price" />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={creating}>{creating ? "Saving..." : "Add Room"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
