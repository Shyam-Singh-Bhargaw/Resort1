import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreatePackage, useDeletePackage } from "@/hooks/useApiMutation";
import { toast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/utils";

export function CreateOfferModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { mutate: createPackage, loading: creating, error: createError } = useCreatePackage();
  const { mutate: deletePackage } = useDeletePackage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string,string[]>>({});

  useEffect(() => {
    if (open) {
      setTitle(""); setDescription(""); setDiscount(""); setFieldErrors({});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!title.trim()) { setFieldErrors({ title: ['Title required'] }); return; }
    try {
      const payload = { title, description, discount: Number(discount) || 0 };
      const res: any = await createPackage(payload as any);
      if (res && res.id) {
        onOpenChange(false);
        const t = toast({ title: "Offer created", description: title, action: (
          <Button size="sm" variant="outline" onClick={async () => { await deletePackage(res.id); t.dismiss?.(); }}>Undo</Button>
        ) });
      } else {
        if (createError) setFieldErrors(parseApiError(createError));
        else alert("Failed to create offer");
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
          <DialogTitle>Create Seasonal Offer</DialogTitle>
          <DialogDescription>Quickly create a promotional or seasonal offer.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Offer title" required />
            {fieldErrors['title'] && <p className="text-xs text-destructive mt-1">{fieldErrors['title'][0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Offer description" />
            {fieldErrors['description'] && <p className="text-xs text-destructive mt-1">{fieldErrors['description'][0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Discount %</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full px-3 py-2 border border-border rounded bg-muted" aria-label="Discount percent" />
            {fieldErrors['discount'] && <p className="text-xs text-destructive mt-1">{fieldErrors['discount'][0]}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={creating}>{creating ? "Saving..." : "Create Offer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
