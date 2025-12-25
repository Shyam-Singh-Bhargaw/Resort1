import React, { useEffect, useState } from "react";
import { GalleryImage, sampleCategories } from "../types/gallery";
import hero from "../assets/hero-resort.jpg";
import suite from "../assets/luxury-suite.jpg";
import spa from "../assets/spa-treatment.jpg";
import OptimizedImage from "../components/ui/OptimizedImage";

const STORAGE_KEY = "local_gallery_items";

const AdminGalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [form, setForm] = useState<Partial<GalleryImage>>({ imageUrl: hero, caption: "", category: "rooms", isVisible: true });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {}
    } else {
      // Do NOT seed default gallery items — leave empty so UI reflects backend/localStorage only
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const save = () => {
    const id = form.id || Math.random().toString(36).slice(2, 9);
    const next: GalleryImage = {
      id,
      imageUrl: form.imageUrl || hero,
      caption: form.caption || "",
      category: (form.category as any) || "rooms",
      isVisible: form.isVisible !== false,
      createdAt: form.createdAt || new Date().toISOString(),
    };
    setItems(prev => {
      const exists = prev.find(p => p.id === id);
      if (exists) return prev.map(p => (p.id === id ? next : p));
      return [next, ...prev];
    });
    setForm({ imageUrl: hero, caption: "", category: "rooms", isVisible: true });
  };

  // handle file input -> data URL for preview/upload (local dev)
  const onFile = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, imageUrl: String(reader.result) }));
    };
    reader.readAsDataURL(f);
  };

  const edit = (id: string) => {
    const it = items.find(i => i.id === id);
    if (it) setForm(it);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this item?")) return;
    setItems(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold mb-4">Admin Gallery</h1>
      <p className="text-sm text-gray-600 mb-6">Manage gallery items locally (stored in browser `localStorage`). This acts as a dev-friendly admin until backend is implemented.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white p-4 rounded shadow">
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input value={form.imageUrl || ""} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="mt-1 block w-full border rounded px-2 py-1" />
          <label className="block text-sm font-medium text-gray-700 mt-3">Or upload</label>
          <input type="file" accept="image/*" onChange={e => onFile(e.target.files?.[0])} className="mt-1 block w-full" />

          <label className="block text-sm font-medium text-gray-700 mt-3">Caption</label>
          <input value={form.caption || ""} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} className="mt-1 block w-full border rounded px-2 py-1" />

          <label className="block text-sm font-medium text-gray-700 mt-3">Category</label>
          <select value={form.category as string} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))} className="mt-1 block w-full border rounded px-2 py-1">
            {/* No default sample categories — allow free text or rely on stored items */}
            <option value="rooms">rooms</option>
            <option value="spa">spa</option>
            <option value="dining">dining</option>
            <option value="experiences">experiences</option>
            <option value="nature">nature</option>
          </select>

          <label className="flex items-center gap-2 mt-3">
            <input type="checkbox" checked={form.isVisible !== false} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))} />
            <span className="text-sm text-gray-700">Visible on public gallery</span>
          </label>

          <div className="mt-4 flex gap-2">
            <button onClick={save} className="px-3 py-1 bg-black text-white rounded">Save</button>
            <button onClick={() => setForm({ imageUrl: hero, caption: "", category: "rooms", isVisible: true })} className="px-3 py-1 border rounded">Reset</button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map(it => (
              <div key={it.id} className="flex bg-white rounded shadow overflow-hidden">
                <div className="w-32 h-24 overflow-hidden">
                  <OptimizedImage src={it.imageUrl} alt={it.caption} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex-1">
                  <div className="font-medium">{it.caption}</div>
                  <div className="text-sm text-gray-500">{it.category}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => edit(it.id)} className="text-sm px-2 py-1 border rounded">Edit</button>
                    <button onClick={() => remove(it.id)} className="text-sm px-2 py-1 border rounded">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGalleryPage;
