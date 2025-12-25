import React, { useEffect, useState } from "react";
import { PackageItem, samplePackages, PACKAGES_STORAGE_KEY } from "@/types/packages";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { PackageItem, PACKAGES_STORAGE_KEY } from "@/types/packages";
function loadPackages(): PackageItem[] {
  try {
    const raw = localStorage.getItem(PACKAGES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export default function AdminPackagesPage() {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [editing, setEditing] = useState<PackageItem | null>(null);

  useEffect(() => {
    setItems(loadPackages());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const createId = () => `pkg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const createEmpty = (): PackageItem => ({ id: createId(), title: "", price: "", description: "", imageUrl: "" });

  const handleAdd = () => {
    const newItem = createEmpty();
    setItems(prev => [newItem, ...prev]);
    setEditing(newItem);
  };

  const handleSave = (item: PackageItem) => {
    setItems(prev => prev.map(p => (p.id === item.id ? item : p)));
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this package?")) return;
    setItems(prev => prev.filter(p => p.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  return (
    <main className="container-padding py-12">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif">Admin — Packages</h1>
          <p className="text-sm text-muted-foreground">Create and manage package offers (stored in localStorage).</p>
        </div>
        <div>
          <button onClick={handleAdd} className="btn btn-primary">Add Package</button>
        </div>
      </header>

      <section className="space-y-6">
        {items.map(item => (
          <div key={item.id} className="p-4 border rounded-lg bg-background/50 flex gap-4 items-start">
            <div className="w-40 h-28 flex-shrink-0 rounded overflow-hidden bg-gray-100">
              <OptimizedImage src={item.imageUrl || ""} alt={item.title} className="w-full h-full object-cover" fallbackQuery={item.title || "package"} />
            </div>
            <div className="flex-1">
              {editing?.id === item.id ? (
                <EditForm item={editing} onCancel={() => setEditing(null)} onSave={handleSave} />
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{item.title || "(Untitled)"}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(item)} className="btn btn-secondary">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-danger">Delete</button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{item.description}</div>
                  {item.price ? <div className="mt-2 text-sm font-medium">Price: {item.price}</div> : null}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

function EditForm({ item, onSave, onCancel }: { item: PackageItem; onSave: (p: PackageItem) => void; onCancel: () => void }) {
  const [state, setState] = useState<PackageItem>(item);

  useEffect(() => setState(item), [item]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={state.title} onChange={e => setState({ ...state, title: e.target.value })} placeholder="Title" className="input" />
        <input value={state.price} onChange={e => setState({ ...state, price: e.target.value })} placeholder="Price" className="input" />
      </div>
      <textarea value={state.description} onChange={e => setState({ ...state, description: e.target.value })} placeholder="Description" className="input h-24" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        <input value={state.imageUrl} onChange={e => setState({ ...state, imageUrl: e.target.value })} placeholder="Image URL" className="input" />
        <div className="h-24 w-full md:w-40 rounded overflow-hidden bg-gray-100">
          <OptimizedImage src={state.imageUrl || ""} alt={state.title} className="w-full h-full object-cover" fallbackQuery={state.title || "package"} />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSave(state)} className="btn btn-primary">Save</button>
        <button onClick={onCancel} className="btn">Cancel</button>
      </div>
    </div>
  );
}
