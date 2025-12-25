import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/hooks/useApi";
import { useNavigation } from "@/hooks/useApi";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { data: navItems, loading: navLoading } = useNavigation();
  const { data: siteConfig } = useSiteConfig();

  // Use API-provided navigation only; avoid in-repo fallback/sample navigation
  const filteredNav = Array.isArray(navItems) ? navItems.filter((item: any) => item.is_visible) : [];
  const navigationItems = filteredNav.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  // Debug: log navigation state during development to diagnose missing nav
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[Header] navItems:', navItems, 'filteredNav:', filteredNav, '-> navigationItems:', navigationItems);
  }, [navItems]);

  // Separate regular links from button items
  const regularNavItems = navigationItems.filter((item: any) => item.type === "link");
  const buttonNavItems = navigationItems.filter((item: any) => item.type === "button");
  const [programsOpen, setProgramsOpen] = useState(false);
  const programsCloseTimer = useRef<number | null>(null);

  const clearProgramsTimer = () => {
    if (programsCloseTimer.current) {
      window.clearTimeout(programsCloseTimer.current);
      programsCloseTimer.current = null;
    }
  };

  const scheduleClosePrograms = (delay = 1000) => {
    clearProgramsTimer();
    programsCloseTimer.current = window.setTimeout(() => setProgramsOpen(false), delay);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerBg = isScrolled || !isHomePage
    ? "bg-background/95 backdrop-blur-md border-b border-border shadow-soft"
    : "bg-transparent";

  const textColor = isScrolled || !isHomePage
    ? "text-foreground"
    : "text-white";

  const logoColor = isScrolled || !isHomePage
    ? "text-primary"
    : "text-white";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        headerBg
      )}
      role="banner"
    >
      {/* Top bar */}
      <div
            className={cn(
              "hidden md:flex items-center justify-end gap-6 px-8 py-2 text-xs transition-all duration-500",
              isScrolled || !isHomePage
                ? "bg-muted/50 text-muted-foreground"
                : "bg-foreground/10 text-primary-foreground/80"
            )}
          >
            <a
              href={`tel:${siteConfig?.phone || "tel:--"}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              title={siteConfig?.phone ? `Call us at ${siteConfig.phone}` : "Contact us"}
            >
              <Phone className="h-3 w-3" />
              {siteConfig?.phone || ""}
            </a>
        {/* Admin links removed — site is customer-facing only */}
      </div>

      {/* Main navigation */}
      <nav aria-label="Primary navigation" className="container-padding flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex flex-col" title="Go to home page">
          <span
            className={cn(
              "font-serif text-xl md:text-2xl font-medium tracking-wide transition-colors duration-500",
              logoColor
            )}
          >
            Mud & Meadows
          </span>
          <span
            className={cn(
              "text-[10px] tracking-[0.3em] uppercase transition-colors duration-500",
              textColor,
              "opacity-70"
            )}
          >
            The Earthbound Sanctuary
          </span>
        </Link>

        {/* Desktop Navigation - centered */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-8">
          {regularNavItems.map((item: any) => {
            // Render Programs as a dropdown — click to open, with delayed close to allow clicking
            if ((item.label || item.name).toLowerCase() === "programs") {
              return (
                <div
                  key={item.id || item.name}
                  className="relative"
                  onMouseEnter={() => { clearProgramsTimer(); setProgramsOpen(true); }}
                  onMouseLeave={() => scheduleClosePrograms(1000)}
                >
                  <button
                    onClick={() => { clearProgramsTimer(); setProgramsOpen(prev => !prev); }}
                    className={cn(
                      "text-sm tracking-wider uppercase transition-all duration-300 hover:opacity-80 px-2 cursor-pointer",
                      textColor,
                      (location.pathname.startsWith('/programs')) && "border-b-2 border-current pb-1"
                    )}
                    title={item.label || item.name}
                    aria-haspopup="true"
                    aria-expanded={programsOpen}
                  >
                    {item.label || item.name}
                  </button>
                  {programsOpen && (
                    <div
                      className="absolute left-0 top-full mt-2 bg-background border border-border rounded-md shadow-md z-50"
                      onMouseEnter={() => { clearProgramsTimer(); setProgramsOpen(true); }}
                      onMouseLeave={() => scheduleClosePrograms(1000)}
                    >
                      <Link to="/programs/wellness" className="block px-4 py-2 text-sm hover:bg-muted" title="Wellness Programs">Wellness Programs</Link>
                      <Link to="/programs/activities" className="block px-4 py-2 text-sm hover:bg-muted" title="Resort Activities">Resort Activities</Link>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id || item.name}
                to={item.href || item.url}
                target={item.target || "_self"}
                className={cn(
                  "text-sm tracking-wider uppercase transition-all duration-300 hover:opacity-80",
                  textColor,
                  "px-2",
                  (location.pathname === (item.href || item.url)) && "border-b-2 border-current pb-1"
                )}
                title={item.label || item.name}
                aria-label={item.label || item.name}
              >
                {item.label || item.name}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons (Book Now + Dynamic Buttons) */}
        <div className="hidden md:flex items-center gap-6">
          {buttonNavItems.map((item: any) => (
            <Link 
              key={item.id || item.label}
              to={item.url}
              target={item.target || "_self"}
              title={item.label}
              aria-label={item.label}
            >
              <Button
                variant={isScrolled || !isHomePage ? "luxury" : "gold"}
                size="lg"
                className="min-w-[120px]"
                aria-label={`Open ${item.label} page`}
              >
                {item.label}
              </Button>
            </Link>
          ))}
          <Link to="/booking" title="Go to booking page" aria-label="Booking">
            <Button
              variant={isScrolled || !isHomePage ? "luxury" : "gold"}
              size="lg"
              className="min-w-[120px]"
              aria-label="Book Now"
            >
              Book Now
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn("lg:hidden p-2 transition-colors", textColor)}
          title={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border transition-all duration-300 overflow-hidden",
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container-padding py-6 space-y-4">
          {regularNavItems.map((item: any) => {
            if ((item.label || item.name).toLowerCase() === 'programs') {
              return (
                <div key={item.id || item.name} className="space-y-1">
                  <div className="block py-3 text-lg font-serif tracking-wide">{item.label || item.name}</div>
                  <Link to="/programs/wellness" onClick={() => setIsMobileMenuOpen(false)} className="block pl-4 py-2 text-base">Wellness Programs</Link>
                  <Link to="/programs/activities" onClick={() => setIsMobileMenuOpen(false)} className="block pl-4 py-2 text-base">Resort Activities</Link>
                </div>
              );
            }

            return (
              <Link
                key={item.id || item.name}
                to={item.href || item.url}
                target={item.target || "_self"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block py-3 text-lg font-serif tracking-wide border-b border-border/50 transition-colors hover:text-primary",
                  (location.pathname === (item.href || item.url)) && "text-primary"
                )}
                title={item.label || item.name}
              >
                {item.label || item.name}
              </Link>
            );
          })}
          {buttonNavItems.map((item: any) => (
            <Link
              key={item.id || item.label}
              to={item.url}
              target={item.target || "_self"}
              onClick={() => setIsMobileMenuOpen(false)}
              title={item.label}
            >
              <Button variant="luxury" size="lg" className="w-full">
                {item.label}
              </Button>
            </Link>
          ))}
          <Link to="/booking" onClick={() => setIsMobileMenuOpen(false)} title="Go to booking page">
            <Button variant="luxury" size="lg" className="w-full mt-4">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
