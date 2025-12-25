import React, { useEffect } from "react";
import { useProgramsWellness } from "@/hooks/useApi";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useNavigate } from "react-router-dom";

export default function ProgramsWellnessPage() {
  const { data, loading, error } = useProgramsWellness();
  const navigate = useNavigate();

  useEffect(() => {
    // show a transient debug badge in console and DOM for developers
    // eslint-disable-next-line no-console
    console.debug('DEBUG: Wellness Program Page Mounted');
    const el = document.createElement('div');
    el.setAttribute('id', 'debug-wellness-mounted');
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
    el.innerText = 'DEBUG: Wellness Program Page Mounted';
    document.body.appendChild(el);
    return () => { try { document.body.removeChild(el); } catch (e) {} };
  }, []);

  if (loading) return <div className="container-padding py-12">Loading Wellness Programs…</div>;
  if (error) return <div className="container-padding py-12">Error loading programs: {String(error.detail || error)}</div>;

  const items: any[] = Array.isArray(data)
    ? data
    : (data && (data.items || data.value)) || [];

  return (
    <Layout>
      <main className="container-padding py-12">
        <h1 className="text-3xl font-serif mb-6">Wellness Programs</h1>

        {items.length === 0 && (
          <div>
            <p>No wellness programs available.</p>
            <details className="mt-4 p-3 bg-muted rounded text-sm">
              <summary className="font-medium">Debug: raw API response</summary>
              <pre className="whitespace-pre-wrap mt-2 text-xs">{JSON.stringify(data, null, 2)}</pre>
              {error && (
                <div className="mt-2 text-xs text-rose-600">Error: {String(error.detail || error)}</div>
              )}
              <div className="mt-3 text-xs text-muted-foreground">If this is empty, open Browser DevTools → Network and check the request URL and response body for `/programs` or `/api/programs`.</div>
            </details>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((it: any) => {
            const media = it.media && it.media.length ? it.media : (it.imageUrl ? [it.imageUrl] : (it.images || []));
            // Normalize relative image paths to full URL using Vite runtime env if available
            const API_BASE = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.NEXT_PUBLIC_API_URL || '';
            const title = it.title || it.name || it.name_en || it.label || 'Untitled Program';
            const description = it.description || it.summary || it.shortDescription || '';
            const duration = it.duration || it.length || it.duration_minutes || null;
            const price = (typeof it.price !== 'undefined') ? it.price : (it.basePrice || it.cost || null);

            return (
              <article key={it.id || title} className="group relative overflow-hidden rounded-lg bg-card shadow-soft hover:shadow-elegant transition-all duration-500">
                <div className="aspect-[4/3] overflow-hidden">
                  <OptimizedImage
                    src={(media && media.length > 0) ? (media[0].startsWith('/') && API_BASE ? `${API_BASE.replace(/\/$/, '')}${media[0]}` : media[0]) : undefined}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    // Helpful debug overlay during development to inspect finalSrc and status
                    debug={true}
                    // Use title words as a friendly Unsplash fallback query if original fails
                    fallbackQuery={title.split(" ").slice(0,3).join(",")}
                  />
                </div>

                <div className="p-6">
                  <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2">Program</p>
                  <h3 className="font-serif text-2xl font-medium mb-2 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{description}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {duration && (
                      <span aria-label={`Duration ${duration}`}>{duration} {typeof duration === 'number' ? 'mins' : ''}</span>
                    )}
                    {price !== null && (
                      <span className="font-serif text-lg text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Button variant="luxury" size="sm" onClick={(e:any) => { e.preventDefault(); navigate(`/booking?program=${encodeURIComponent(it.id || title)}`); }} aria-label={`Book ${title}`}>
                        BOOK
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e:any) => { e.preventDefault(); navigate(`/programs/wellness/${encodeURIComponent(it.id || title)}`); }} aria-label={`View details for ${title}`}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </Layout>
  );
}
