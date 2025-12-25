import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, ChevronDown } from "lucide-react";
import heroImg from "@/assets/hero-resort.jpg";
import OptimizedImage from "@/components/ui/OptimizedImage";

export function HeroSection() {
  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: "smooth" });
  };

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-gray-900">
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <OptimizedImage
          src={heroImg}
          alt="Luxury Himalayan resort sanctuary"
          className="w-full h-full object-cover"
          fallbackQuery="resort,wellness,spa"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/8 to-black/55" />
      </div>
      {/* Content */}
      <div className="relative z-10 container-padding text-center text-white max-w-4xl mx-auto" style={{ zIndex: 10 }}>
        {/* Main Heading */}
        <h1 
          className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold leading-snug mb-6 hero-title tracking-tight"
          style={{ animationDelay: "0.4s" }}
        >
          Where Wellness
          <br />
          <span className="italic font-normal">Meets the Divine</span>
        </h1>

        {/* Description */}
        <p 
          className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-10 leading-relaxed font-light tracking-normal"
          style={{ animationDelay: "0.6s" }}
        >
          Embark on a transformative journey at our award-winning sanctuary. Organic wellness, 
          holistic healing, natural luxury, and earthbound tranquility.
        </p>

        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animationDelay: "0.8s" }}
        >
          <Link to="/booking">
            <Button variant="gold" size="lg" className="px-10 py-3 shadow-glow">
              Begin Your Journey
            </Button>
          </Link>
          <Button
            size="xl"
            className="gap-3 border-2 border-white/60 text-white hover:bg-white/10 bg-transparent uppercase tracking-wider font-semibold px-8"
            title="Watch our story video"
            aria-label="Play video of our resort story"
          >
            <Play className="h-4 w-4" />
            Watch Our Story
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white cursor-pointer"
        style={{ zIndex: 10 }}
        title="Scroll to content"
        aria-label="Scroll down to discover more"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest uppercase opacity-70">Discover</span>
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </div>
      </button>
    </section>
  );
}
