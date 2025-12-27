import React from "react";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useProgramsWellness, useCottage } from "@/hooks/useApi";
import { Accommodation } from "@/types/api";
import { 
  Users, Maximize, Eye, Check, ArrowLeft, 
  Calendar, Wifi, Coffee, Bath, Wind, Leaf 
} from "lucide-react";
import suiteImage from "@/assets/luxury-suite.jpg";
import spaImage from "@/assets/spa-treatment.jpg";
import OptimizedImage from "@/components/ui/OptimizedImage";

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "King Bed": Bath,
  "Private Balcony": Wind,
  "Rain Shower": Bath,
  "Mini Bar": Coffee,
  "24/7 Butler Service": Check,
  "Organic Toiletries": Leaf,
  "Meditation Corner": Leaf,
  default: Wifi,
};

const RoomDetailPage = () => {
  const { id } = useParams();
  const { data: cottage, loading } = useCottage(id);
  // Call wellness programs hook at top-level so hook order is stable
  const { data: programsData } = useProgramsWellness();

  const mapAccommodation = (a: any): Room => ({
    id: a.id || String(a.name).toLowerCase().replace(/\s+/g, "-"),
    name: a.name || a.title || '',
    category: a.category || "deluxe",
    description: a.description || a.summary || "",
    shortDescription: (a.description || "").slice(0, 140),
    basePrice: a.price_per_night ?? a.pricePerNight ?? a.price ?? 0,
    maxGuests: a.capacity ?? a.sleeps ?? 2,
    size: a.sqm || a.size || 45,
    view: a.view || "Mountain View",
    amenities: a.amenities || a.features || [],
    images: a.images || a.media || [],
    featured: a.rating ? a.rating >= 4.5 : false,
  });

  const room = cottage ? mapAccommodation(cottage as any) : null;

  // SEO: set document title and meta description / OG tags for better indexing
  React.useEffect(() => {
    if (!room) return;
    try {
      const title = `${room.name} — Luxury Resort Rooms & Wellness`;
      document.title = title;
      let desc = room.shortDescription || room.description || 'Luxury rooms, wellness and detox retreats in Jamshedpur, Jharkhand.';
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', desc);

      // OpenGraph
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
      ogTitle.setAttribute('content', title);
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
      ogDesc.setAttribute('content', desc);

      // canonical
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
      const canonical = window.location.href.split('#')[0].split('?')[0];
      link.setAttribute('href', canonical);
    } catch (e) {
      // ignore DOM errors in SSR or tests
    }
  }, [room]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-4xl mb-4">Room Not Found</h1>
            <Link to="/rooms">
              <Button variant="outline">Back to Rooms</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  const allPrograms: any[] = Array.isArray(programsData) ? programsData : (programsData && programsData.items) || [];
  const relatedPrograms = allPrograms.filter((p) => p.featured).slice(0, 2);

  return (
    <Layout>
      {/* Back Button */}
      <div className="pt-24 pb-4 container-padding max-w-7xl mx-auto">
        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Cottages</span>
        </Link>
      </div>

      {/* Hero Gallery */}
      <section className="container-padding max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 aspect-[16/10] rounded-lg overflow-hidden">
            <OptimizedImage
              src={suiteImage}
              srcSet={`${suiteImage} 1200w`}
              loading="lazy"
              decoding="async"
              alt={room.name}
              className="w-full h-full object-cover"
              fallbackQuery="rooms,luxury"
            />
          </div>
          <div className="grid grid-rows-2 gap-4">
            <div className="aspect-[4/3] lg:aspect-auto rounded-lg overflow-hidden">
              <OptimizedImage
                src={spaImage}
                srcSet={`${spaImage} 800w`}
                loading="lazy"
                decoding="async"
                alt="Room amenities"
                className="w-full h-full object-cover"
                fallbackQuery="spa,amenities"
              />
            </div>
            <div className="aspect-[4/3] lg:aspect-auto rounded-lg overflow-hidden relative">
              <OptimizedImage
                src={suiteImage}
                srcSet={`${suiteImage} 800w`}
                loading="lazy"
                decoding="async"
                alt="Room view"
                className="w-full h-full object-cover"
                fallbackQuery="rooms,view"
              />
              <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                <Button variant="hero-outline" size="sm">
                  View Gallery
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-padding max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Title & Description */}
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">
                {room.category}
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-medium mb-6">
                {room.name}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
                <span className="flex items-center gap-2">
                  <Maximize className="h-5 w-5" />
                  {room.size} sqm
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Up to {room.maxGuests} guests
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {room.view}
                </span>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {room.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="font-serif text-2xl font-medium mb-6">
                Room Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || amenityIcons.default;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 p-4 bg-muted rounded-lg"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wellness Upsell */}
            <div>
              <h2 className="font-serif text-2xl font-medium mb-6">
                Enhance Your Stay
              </h2>
              <p className="text-muted-foreground mb-6">
                Complement your accommodation with our signature wellness experiences.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPrograms.map((program) => (
                          <Link
                            key={program.id}
                            to={`/programs/wellness`}
                    className="group flex gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <OptimizedImage src={spaImage} alt={program.name} className="w-full h-full object-cover" fallbackQuery="spa,wellness" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif font-medium group-hover:text-primary transition-colors">
                        {program.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        {program.duration}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        ${program.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-card border border-border rounded-lg p-6 shadow-soft">
              <div className="mb-6">
                <p className="text-muted-foreground text-sm mb-1">Starting from</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl text-primary">
                    ${room.basePrice}
                  </span>
                  <span className="text-muted-foreground">/ night</span>
                </div>
              </div>

              {/* Quick Booking Form */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">
                      Check-in
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">
                      Check-out
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-2">
                    Number of People
                  </label>
                  <select
                    value={String((window as any).__react_selected_people || 1)}
                    onChange={(e) => {
                      const val = e.target.value === "entire" ? "entire" : Number(e.target.value);
                      try {
                        // store locally so the Link href can pick it up during render
                        (window as any).__react_selected_people = val;
                      } catch {}
                    }}
                    className="w-full px-3 py-2 bg-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Array.from({ length: Math.max(room.maxGuests || 1, 100) }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? "Person" : "People"}
                      </option>
                    ))}
                    <option value="entire">Book entire accommodation</option>
                  </select>
                </div>
              </div>

              <Link to={`/booking?room=${room.id}`}>
                <Button variant="luxury" size="lg" className="w-full mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  Check Availability
                </Button>
              </Link>

              <p className="text-xs text-muted-foreground text-center">
                Free cancellation up to 7 days before check-in
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RoomDetailPage;
