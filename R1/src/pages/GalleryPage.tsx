import React, { useMemo, useState } from "react";
import { GalleryImage } from "../types/gallery";
import { useGallery } from "@/hooks/useApi";
import hero from "../assets/hero-resort.jpg";
import suite from "../assets/luxury-suite.jpg";
import spa from "../assets/spa-treatment.jpg";
import yoga from "../assets/yoga-wellness.jpg";
import ayurveda from "../assets/ayurveda-therapy.jpg";
import GalleryCard from "../components/ui/GalleryCard";
import Lightbox from "../components/ui/Lightbox";

const GalleryPage: React.FC = () => {
  const { data, loading, error } = useGallery();
  const items: GalleryImage[] = Array.isArray(data) ? (data as GalleryImage[]) : (data && (data.items || data.value)) || [];
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(items.map(i => i.category).filter(Boolean as any)));
    return cats as string[];
  }, [items]);

  const filtered = useMemo(() => {
    return items
      .filter(i => i.isVisible !== false)
      .filter(i => (filter === "all" ? true : i.category === filter))
      .filter(i => (q ? (i.caption || "").toLowerCase().includes(q.toLowerCase()) : true));
  }, [items, filter, q]);

  if (loading) return <div className="container-padding py-12">Loading gallery…</div>;
  if (error) return <div className="container-padding py-12">Error loading gallery: {String((error as any).detail || error)}</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-serif">Gallery</h1>
        <p className="text-muted-foreground mt-2">A curated collection showcasing our resort — rooms, spa, dining and immersive experiences.</p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter("all")} className={`px-3 py-1 rounded-full ${filter === "all" ? "bg-black text-white" : "bg-gray-100"}`}>All</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-full ${filter === cat ? "bg-black text-white" : "bg-gray-100"}`}>{cat}</button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search captions" className="border rounded px-3 py-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => (
          <GalleryCard key={item.id} item={item} onOpen={setSelected} />
        ))}
      </div>

      <Lightbox item={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default GalleryPage;
