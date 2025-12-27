import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Accommodation } from "@/types/api";
import { Users, Maximize, Eye, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import suiteImage from "@/assets/luxury-suite.jpg";
import OptimizedImage from "@/components/ui/OptimizedImage";
import yogaImg from "@/assets/yoga-wellness.jpg";
import spaImg from "@/assets/spa-treatment.jpg";
import ayurvedaImg from "@/assets/ayurveda-therapy.jpg";
import { useCottages } from "@/hooks/useApi";
import { apiClient } from "@/lib/api-client";
import { connectEvents } from "@/lib/sse";
import CottageDetailModal from "@/components/cottages/CottageDetailModal";

// Placeholder images by category (using local assets)
const placeholderImages: Record<string, string[]> = {
  default: [suiteImage, yogaImg, spaImg],
};

const RoomsPage = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "size">("price-asc");
  const [openCottageId, setOpenCottageId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const { data: accommodations, loading: accommodationsLoading, error: accommodationsError, refetch: refetchAccommodations } = useCottages();
  const [adHocAccommodations, setAdHocAccommodations] = useState<any[] | null>(null);
  const [adHocLoading, setAdHocLoading] = useState(false);
  const [showRefreshBanner, setShowRefreshBanner] = useState(false);

  // Listen for cross-tab room updates (admin actions set `rooms.updated` in localStorage)
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'rooms.updated') {
        setShowRefreshBanner(true);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Attempt SSE subscription; fall back silently if backend has no SSE endpoint
  React.useEffect(() => {
    let stop: (() => void) | null = null;
    try {
      stop = connectEvents((evt: any) => {
        // event may be { event: 'rooms.updated', ... }
        if (!evt) return;
        const evName = evt.event || evt.type || '';
        if (evName === 'rooms.updated' || evName === 'bookings.created') {
          setShowRefreshBanner(true);
        }
      });
    } catch (err) {
      // ignore
    }
    return () => { if (stop) stop(); };
  }, []);

  const mapAccommodation = (a: Accommodation): any => {
    const category = ((a as any).category || (a as any).type || "deluxe").toLowerCase();
    const categoryImages = placeholderImages[category] || placeholderImages.deluxe;
    
    // If no images, assign placeholder images
    const images = a.images && Array.isArray(a.images) && a.images.length > 0 
      ? a.images 
      : categoryImages;

    return {
        id: a.slug ? String(a.slug) : (a.id ? String(a.id) : String(a.name || (a as any).title || '').toLowerCase().replace(/\s+/g, "-")),
        slug: a.slug || (a.id ? String(a.id) : undefined),
      name: a.name || (a as any).title || '',
      category: category,
      description: (a as any).description || "",
      shortDescription: ((a as any).description || "").slice(0, 140),
      basePrice: (a as any).price_per_night ?? (a as any).price ?? 0,
      maxGuests: (a as any).capacity ?? 2,
      capacityAdults: (a as any).capacity_adults ?? ((a as any).capacity ?? 2),
      capacityChildren: (a as any).capacity_children ?? 0,
      size: (a as any).size ?? 45,
      view: (a as any).view || "Mountain View",
      amenities: a.amenities || [],
      images: images,
      featured: (a as any).rating ? (a as any).rating >= 4.5 : false,
    };
  };

  const effectiveAccommodations = adHocAccommodations ?? accommodations;

  const sourceRooms: any[] = effectiveAccommodations && Array.isArray(effectiveAccommodations)
    ? effectiveAccommodations.map(mapAccommodation)
    : [];

  // Collect available tags dynamically from fetched cottages
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    sourceRooms.forEach(r => {
      const t = (r as any).tags || (r as any).metadata?.tags || [];
      if (Array.isArray(t)) t.forEach((x: string) => tags.add(x));
    });
    return Array.from(tags).sort();
  }, [sourceRooms]);

  const filteredRooms = sourceRooms
    .filter((room) => !activeTag || ((room as any).tags || (room as any).metadata?.tags || []).includes(activeTag))
    .sort((a, b) => {
      const aPrice = a.basePrice;
      const bPrice = b.basePrice;
      if (sortBy === "price-asc") return aPrice - bPrice;
      if (sortBy === "price-desc") return bPrice - aPrice;
      return (b as any).size - (a as any).size;
    });

  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-warm">
        <div className="container-padding max-w-7xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Your Sanctuary Awaits
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-medium mb-6">
            Luxury Accommodations
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Each residence is a private sanctuary, designed to harmonize with 
            the natural beauty of the Himalayas while offering every modern comfort.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border sticky top-20 bg-background/95 backdrop-blur-md z-40">
        <div className="container-padding max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Tag Filters (dynamic) */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={async () => { setActiveTag(null); setAdHocAccommodations(null); if (refetchAccommodations) await refetchAccommodations(); }}
                    className={cn(
                      "px-4 py-2 text-sm rounded-full transition-all duration-300",
                      !activeTag ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    All
                  </button>
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={async () => {
                        setActiveTag(tag);
                        // fetch with backend filter
                        try {
                          setAdHocLoading(true);
                          const items = await apiClient.getAllCottages({ tags: tag, sort: sortBy });
                          setAdHocAccommodations(Array.isArray(items) ? items : []);
                        } finally {
                          setAdHocLoading(false);
                        }
                      }}
                      className={cn(
                        "px-4 py-2 text-sm rounded-full transition-all duration-300",
                        activeTag === tag ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground"
                      )}
                      title={`Filter by ${tag}`}
                      aria-pressed={activeTag === tag}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={async (e) => { const v = e.target.value as typeof sortBy; setSortBy(v); if (activeTag) {
                    try { setAdHocLoading(true); const items = await apiClient.getAllCottages({ tags: activeTag, sort: v }); setAdHocAccommodations(Array.isArray(items) ? items : []); } finally { setAdHocLoading(false); }
                  } else {
                    // no tag active, just sort all
                    try { setAdHocLoading(true); const items = await apiClient.getAllCottages({ sort: v }); setAdHocAccommodations(Array.isArray(items) ? items : []); } finally { setAdHocLoading(false); }
                  } }}
                className="bg-muted px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Sort accommodations by price or size"
                title="Sort accommodations"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="size">Size: Largest First</option>
              </select>
              <button className="ml-2 px-3 py-2 text-sm border rounded" onClick={() => setShowMap(s => !s)}>
                {showMap ? 'Hide Map' : 'Map View'}
              </button>
              <button className="ml-2 px-3 py-2 text-sm border rounded" onClick={async () => { setAdHocAccommodations(null); if (refetchAccommodations) await refetchAccommodations(); }}>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {showMap && (
        <section className="section-padding bg-background">
          <div className="container-padding max-w-7xl mx-auto">
            <div className="h-64 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              Interactive map placeholder — integrate map provider to show cottages
            </div>
          </div>
        </section>
      )}

      {/* Refresh banner when other tab/admin updates rooms */}
      {showRefreshBanner && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">Rooms list was updated elsewhere.</div>
            <div>
              <Button variant="outline" size="sm" onClick={async () => { setAdHocAccommodations(null); if (refetchAccommodations) await refetchAccommodations(); setShowRefreshBanner(false); }}>Refresh</Button>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      <section className="section-padding bg-background">
        <div className="container-padding max-w-7xl mx-auto">
          {(adHocLoading || accommodationsLoading) ? (
            <div className="text-center py-16">Loading accommodations…</div>
          ) : accommodationsError ? (
            <div className="text-center py-16 text-destructive">
              <p>Failed to load accommodations.</p>
              <div className="mt-4">
                <Button aria-label="Retry loading accommodations" onClick={() => refetchAccommodations()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} onOpen={() => setOpenCottageId(room.id)} />
              ))}
            </div>
          )}

          {filteredRooms.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No rooms found in this category.</p>
            </div>
          )}
        </div>
      </section>
      {openCottageId && (
        <CottageDetailModal id={openCottageId} onClose={() => setOpenCottageId(null)} onBook={(id, extraBedId, extraBedQty, adults, children) => {
          // SPA navigation to booking with pre-selected cottage, guests, and optional extra bed
          const params = new URLSearchParams();
          params.set('room', String(id));
          if (extraBedId) {
            params.set('extraBedId', String(extraBedId));
            params.set('extraBedQty', String(extraBedQty || 1));
          }
          if (typeof adults !== 'undefined') params.set('adults', String(adults));
          if (typeof children !== 'undefined') params.set('children', String(children));
          const q = `?${params.toString()}`;
          navigate(`/booking${q}`);
        }} />
      )}
    </Layout>
  );
};

function RoomCard({ room, onOpen }: { room: Room; onOpen?: () => void }) {
  const navigate = useNavigate();

  return (
    <div
      className="group relative overflow-hidden rounded-lg bg-card shadow-soft hover:shadow-elegant transition-all duration-500"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden">
        <Link to={`/rooms/${encodeURIComponent(room.id)}`} aria-label={`Open details for ${room.name}`}>
          <OptimizedImage
            src={(room.images && room.images.length > 0) ? room.images[0] : suiteImage}
            srcSet={(room.images && room.images.length > 0) ? `${room.images[0]} 800w` : undefined}
            loading="lazy"
            decoding="async"
            alt={room.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            fallbackQuery="rooms,luxury"
          />
        </Link>
        {room.featured && (
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 text-xs tracking-wider uppercase rounded">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2">
          {room.category}
        </p>
        <h3 className="font-serif text-2xl font-medium mb-2 group-hover:text-primary transition-colors">
          <Link to={`/rooms/${encodeURIComponent(room.id)}`} className="hover:underline">{room.name}</Link>
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {room.shortDescription}
        </p>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            {room.size} sqm
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {room.capacityAdults} adults{room.capacityChildren ? ` • ${room.capacityChildren} child${room.capacityChildren > 1 ? 'ren' : ''}` : ''}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {room.view}
          </span>
        </div>

        {/* Price & CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="font-serif text-2xl text-primary">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(room.basePrice)}
            </span>
            <span className="text-muted-foreground text-sm"> / night</span>
          </div>
            <div className="flex items-center gap-2">
              <Button variant="luxury" size="sm" onClick={(e:any) => { e.preventDefault(); navigate(`/booking?room=${encodeURIComponent(room.id)}&adults=${encodeURIComponent(String(room.capacityAdults ?? room.maxGuests ?? 1))}&children=${encodeURIComponent(String(room.capacityChildren ?? 0))}`); }}>
                Book
              </Button>
              <Button variant="outline" size="sm" onClick={(e:any) => { e.preventDefault(); onOpen && onOpen(); }}>
                View Details
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default RoomsPage;
