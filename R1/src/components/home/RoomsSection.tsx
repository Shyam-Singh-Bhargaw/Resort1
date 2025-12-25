import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCottages } from "@/hooks/useApi";
import { Users, Maximize, Eye } from "lucide-react";
import suiteImage from "@/assets/luxury-suite.jpg";
import OptimizedImage from "@/components/ui/OptimizedImage";

export function RoomsSection() {
  const { data: cottages, loading } = useCottages();
  const featuredRooms = (Array.isArray(cottages) ? cottages : []).filter((c: any) => c.featured).slice(0, 3);

  return (
    <section className="section-padding bg-background">
      <div className="container-padding max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Sanctuary Stays
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
            Luxurious Accommodations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each residence is thoughtfully designed to harmonize with nature while 
            providing the ultimate in comfort and privacy.
          </p>
        </div>

        {/* Featured Room - Large */}
        <div className="mb-12">
            <Link
            to={`/rooms/${featuredRooms[0]?.id}`}
            className="group block relative overflow-hidden rounded-lg"
          >
            <div className="aspect-[21/9] md:aspect-[21/8]">
              <OptimizedImage
                src={suiteImage}
                alt={featuredRooms[0]?.name || 'Featured room'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                fallbackQuery="rooms,luxury,resort"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
            </div>

            <div className="absolute inset-0 flex items-center">
              <div className="p-8 md:p-16 max-w-xl text-primary-foreground">
                <p className="text-xs tracking-[0.2em] uppercase opacity-80 mb-3">
                  Featured Accommodation
                </p>
                <h3 className="font-serif text-3xl md:text-4xl font-medium mb-4 group-hover:translate-x-2 transition-transform duration-300">
                  {featuredRooms[0]?.name}
                </h3>
                <p className="text-sm md:text-base opacity-90 mb-6 leading-relaxed">
                  {featuredRooms[0]?.shortDescription}
                </p>
                <div className="flex items-center gap-6 text-sm opacity-80 mb-6">
                  <span className="flex items-center gap-2">
                    <Maximize className="h-4 w-4" />
                    {featuredRooms[0]?.size} sqm
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Up to {featuredRooms[0]?.maxGuests} guests
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {featuredRooms[0]?.view}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-serif">
                    From ${featuredRooms[0]?.basePrice}
                    <span className="text-sm opacity-70"> / night</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Other Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredRooms.slice(1).map((room) => (
            <Link
              key={room.id}
              to={`/rooms/${room.id}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              <OptimizedImage
                src={suiteImage}
                alt={room.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                fallbackQuery="rooms,luxury,resort"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-primary-foreground">
                <p className="text-xs tracking-[0.2em] uppercase opacity-70 mb-2">
                  {room.category}
                </p>
                <h3 className="font-serif text-xl md:text-2xl font-medium mb-2 group-hover:translate-x-2 transition-transform duration-300">
                  {room.name}
                </h3>
                <p className="text-sm opacity-80 mb-4">
                  {room.shortDescription}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-serif">
                    From ${room.basePrice}
                    <span className="text-xs opacity-70"> / night</span>
                  </span>
                  <span className="text-xs tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/rooms">
            <Button variant="outline" size="lg">
              View All Accommodations
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
