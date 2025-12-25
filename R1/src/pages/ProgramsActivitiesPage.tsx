import React, { useEffect } from "react";
import { useProgramsActivities } from "@/hooks/useApi";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useNavigate } from "react-router-dom";

export default function ProgramsActivitiesPage() {
  const { data, loading, error } = useProgramsActivities();
  const navigate = useNavigate();

  useEffect(() => {
    // debug log and transient badge
    // eslint-disable-next-line no-console
    console.debug('DEBUG: Resort Activities Page Mounted');
    const el = document.createElement('div');
    el.setAttribute('id', 'debug-activities-mounted');
    el.style.position = 'fixed';
    el.style.top = '12px';
    el.style.right = '160px';
    el.style.background = '#fff';
    el.style.border = '1px solid #f0c24b';
    el.style.padding = '6px 10px';
    el.style.zIndex = '9999';
    el.style.fontSize = '12px';
    el.style.borderRadius = '6px';
    el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
    el.innerText = 'DEBUG: Resort Activities Page Mounted';
    document.body.appendChild(el);
    return () => { try { document.body.removeChild(el); } catch (e) {} };
  }, []);

  if (loading) return <div className="container-padding py-12">Loading Resort Activities…</div>;
  if (error) return <div className="container-padding py-12">Error loading programs: {String(error.detail || error)}</div>;

  const items: any[] = Array.isArray(data)
    ? data
    : (data && (data.items || data.value)) || [];

  // Determine backend base URL for dev when image paths are relative.
  const API_BASE = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? 'http://localhost:8000' : '');

  return (
    <Layout>
      {/* Hero similar to RoomsPage */}
      <section className="relative pt-24 pb-8 bg-warm">
        <div className="container-padding max-w-7xl mx-auto text-left">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Programs</p>
          <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">Resort Activities</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">Explore our curated activities designed to reconnect you with nature.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-padding max-w-7xl mx-auto">
          {items.length === 0 ? (
            <div className="text-center py-16">No activities available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {items.map((act: any) => {
                const title = act.title || act.name || 'Activity';
                const description = act.description || act.summary || '';
                const schedule = act.schedule || act.duration || '';
                const location = act.location || '';
                const price = typeof act.price !== 'undefined' ? act.price : null;
                // Accept either `imageUrl` (older compatibility) or `image` (newer endpoints)
                const imgField = act.imageUrl || act.image || null;
                const media = act.media && act.media.length ? act.media : (imgField ? [imgField] : (act.images || []));
                const firstMedia = media && media.length > 0 ? media[0] : undefined;
                let src = firstMedia;
                if (src && typeof src === 'string' && src.startsWith('/') && API_BASE) {
                  src = `${API_BASE.replace(/\/$/, '')}${src}`;
                }

                return (
                  <div key={act.id || title} className="group relative overflow-hidden rounded-lg bg-card shadow-soft hover:shadow-elegant transition-all duration-500">
                    <div className="aspect-[4/3] overflow-hidden">
                      <OptimizedImage
                        src={src}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        debug={false}
                        fallbackQuery={title.split(' ').slice(0,3).join(',')}
                      />
                    </div>

                    <div className="p-6">
                      <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2">Program</p>
                      <h3 className="font-serif text-2xl font-medium mb-2 group-hover:text-primary transition-colors">{title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{description}</p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {schedule && <span className="flex items-center gap-1">{schedule}</span>}
                        {location && <span className="flex items-center gap-1">{location}</span>}
                        {price !== null && <span className="font-serif text-lg text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)}</span>}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Button variant="luxury" size="sm" onClick={(e:any) => { e.preventDefault(); navigate(`/booking?program=${encodeURIComponent(act.id || title)}`); }} aria-label={`Book ${title}`}>
                            BOOK
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e:any) => { e.preventDefault(); navigate(`/programs/activities/${encodeURIComponent(act.id || title)}`); }} aria-label={`View details for ${title}`}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
