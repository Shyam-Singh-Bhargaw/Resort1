import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { usePackages } from "@/hooks/useApi";
import { PackageItem } from "@/types/packages";
import { useNavigate } from "react-router-dom";

export default function PackagesPage() {
  const { data, loading, error } = usePackages();
  const [q, setQ] = useState("");

  useEffect(() => {
    // debug badge
    // eslint-disable-next-line no-console
    console.debug('DEBUG: Packages Page Mounted');
    const el = document.createElement('div');
    el.setAttribute('id', 'debug-packages-mounted');
    el.style.position = 'fixed';
    el.style.top = '12px';
    el.style.right = '12px';
    el.style.background = '#fff';
    el.style.border = '1px solid #f0c24b';
    el.style.padding = '6px 10px';
    el.style.zIndex = '9999';
    el.style.fontSize = '12px';
    el.style.borderRadius = '6px';
    el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
    el.innerText = 'DEBUG: Packages Page Mounted';
    document.body.appendChild(el);
    return () => { try { document.body.removeChild(el); } catch (e) {} };
  }, []);

  const itemsRaw: any[] = Array.isArray(data) ? data : (data && (data.items || data.value)) || [];
  const packages: PackageItem[] = itemsRaw.map((p: any) => ({
    id: p.id || p._id || String(p._id || p.id || ''),
    title: p.title || p.name || p.programName || '',
    description: p.description || p.summary || '',
    price: (typeof p.price !== 'undefined' && p.price !== null) ? String(p.price) : (p.price_display ? String(p.price_display) : ''),
    imageUrl: p.imageUrl || p.image || (p.images && p.images.length ? p.images[0] : undefined),
    featured: !!p.featured,
  }));

  const filtered = packages.filter(p => {
    if (!q) return true;
    return `${p.title} ${p.description} ${p.price}`.toLowerCase().includes(q.toLowerCase());
  });

  const navigate = useNavigate();

  if (loading) return <main className="container-padding py-12">Loading packages…</main>;
  if (error) return <main className="container-padding py-12">Error loading packages: {String(error.detail || error)}</main>;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-24 pb-8 bg-warm">
        <div className="container-padding max-w-7xl mx-auto text-left">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Packages</p>
          <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">Packages</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">Choose from curated experiences and offers.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="mb-6 w-full max-w-md">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search packages" className="input w-full" aria-label="Search packages" />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">No packages available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filtered.map(p => (
                <div key={p.id} className="group relative overflow-hidden rounded-lg bg-card shadow-soft hover:shadow-elegant transition-all duration-500">
                  <div className="aspect-[4/3] overflow-hidden">
                    <OptimizedImage src={p.imageUrl || ''} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" fallbackQuery={p.title} />
                  </div>
                  <div className="p-6">
                    <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2">Package</p>
                    <h3 className="font-serif text-2xl font-medium mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{p.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      {/* Duration not always available in package type; show if present */}
                      {/* duration field may be embedded in raw data under `duration` */}
                      {/* Price */}
                      {p.price ? <span className="font-serif text-lg text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(p.price))}</span> : null}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Button variant="luxury" size="sm" onClick={(e:any) => { e.preventDefault(); navigate(`/booking?package=${encodeURIComponent(p.id)}`); }} aria-label={`Book ${p.title}`}>
                          BOOK
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e:any) => { e.preventDefault(); navigate(`/packages/${encodeURIComponent(p.id)}`); }} aria-label={`View details for ${p.title}`}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
