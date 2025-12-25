import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateWellness, useDeleteWellness } from "@/hooks/useApiMutation";
import { toast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/utils";

export function CreateWellnessModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { mutate: createWellness, loading: creating, error: createError } = useCreateWellness();
  const { mutate: deleteWellness } = useDeleteWellness();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      setName(""); setDuration(""); setPrice(""); setFieldErrors({});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!name.trim()) { setFieldErrors({ name: ['Name required'] }); return; }

    try {
      const payload = { name, duration, price: Number(price) || 0 };
      const res: any = await createWellness(payload as any);
      if (res && res.id) {
        onOpenChange(false);
        const t = toast({ title: "Wellness program created", description: name, action: (
          <Button size="sm" variant="outline" onClick={async () => { await deleteWellness(res.id); t.dismiss?.(); }}>Undo</Button>
        ) });
      } else {
        if (createError) setFieldErrors(parseApiError(createError));
        else alert("Failed to create wellness program");
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
          <DialogTitle>Add Wellness Program</DialogTitle>
          <DialogDescription>Quickly add a new wellness program.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Program name" required />
            {fieldErrors['name'] && <p className="text-xs text-destructive mt-1">{fieldErrors['name'][0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Duration" />
            {fieldErrors['duration'] && <p className="text-xs text-destructive mt-1">{fieldErrors['duration'][0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Price" />
            {fieldErrors['price'] && <p className="text-xs text-destructive mt-1">{fieldErrors['price'][0]}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={creating}>{creating ? "Saving..." : "Add Program"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
