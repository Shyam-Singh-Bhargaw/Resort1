import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHomePageData } from "@/hooks/useApi";
import heroImage from "@/assets/hero-resort.jpg";
import OptimizedImage from "@/components/ui/OptimizedImage";

export function SeasonalOfferSection() {
  const { data } = useHomePageData();
  const offers = data && (data.seasonalOffers || data.offers || []);
  const offer = Array.isArray(offers) && offers.length > 0 ? offers[0] : null;
  if (!offer) return null;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <OptimizedImage src={heroImage} alt="Seasonal offer" className="w-full h-full object-cover" fallbackQuery="resort,offer" />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-padding max-w-4xl mx-auto text-center text-primary-foreground">
        {/* Badge */}
        <div className="inline-block bg-primary/90 backdrop-blur-sm px-6 py-2 rounded-full mb-8">
          <span className="text-xs tracking-widest uppercase font-semibold">
            Limited Time Offer
          </span>
        </div>

        <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-medium mb-6">
          {offer.title}
        </h2>

        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8 leading-relaxed">
          {offer.description}
        </p>

        {/* Discount Badge */}
        <div className="inline-flex items-baseline gap-2 mb-10">
          <span className="font-serif text-6xl md:text-7xl font-medium">
            {offer.discount}%
          </span>
          <span className="text-xl opacity-80">OFF</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/booking">
            <Button variant="hero" size="xl">
              Book This Offer
            </Button>
          </Link>
          <p className="text-sm opacity-70">
            Valid until{" "}
            {new Date(offer.validUntil).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
