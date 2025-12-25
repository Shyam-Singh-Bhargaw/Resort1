import { useState } from "react";
import { useBooking } from "@/context/BookingContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenuItems, useDining } from "@/hooks/useApi";
import spaImg from "@/assets/spa-treatment.jpg";
import yogaImg from "@/assets/yoga-wellness.jpg";
import ayurvedaImg from "@/assets/ayurveda-therapy.jpg";
import luxurySuiteImg from "@/assets/luxury-suite.jpg";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { makeResponsiveSrcSet } from "@/lib/imageUtils";

type MenuCategory = "all" | "starter" | "main" | "side" | "dessert" | "beverage";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  portion: string;
  price: number;
  imageUrl?: string;
  dietaryTags: string[];
  isVisible: boolean;
}

const categoryLabels: Record<MenuCategory, string> = {
  all: "All Items",
  starter: "🥗 Starters",
  main: "🍛 Main Course",
  side: "🍞 Sides & Rotis",
  dessert: "🍮 Desserts",
  beverage: "☕ Beverages",
};

// Placeholder images by category (local optimized assets)
const placeholderImages: Record<string, string[]> = {
  starter: [luxurySuiteImg, spaImg],
  main: [luxurySuiteImg, ayurvedaImg, spaImg],
  side: [luxurySuiteImg, ayurvedaImg],
  dessert: [luxurySuiteImg],
  beverage: [spaImg, yogaImg],
};

// Removed large sample menu items to avoid showing dummy data in frontend.

const DiningPage = () => {
  // Enable image debug overlay when URL contains ?debugImages=1
  const debugImages = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debugImages") === "1";
  const [activeCategory, setActiveCategory] = useState<MenuCategory>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name">("price-asc");

  // Prefer backend `menu` collection via `/api/dining` when available
  const { data: diningItems, loading: diningLoading, error: diningError, refetch: diningRefetch } = useDining();
  const { data: menuItemsFallback, loading: menuLoading, error: menuError, refetch: menuRefetch } = useMenuItems();
  const menuItems = (diningItems && Array.isArray(diningItems) && diningItems.length > 0) ? diningItems : menuItemsFallback;
  const loading = diningLoading || menuLoading;
  const error = diningError || menuError;
  const refetch = async () => { await Promise.all([diningRefetch(), menuRefetch()]); };
  
  // Rely on backend/menu items only; do not fall back to in-repo sample data
  const finalMenuItems = (menuItems && Array.isArray(menuItems) && menuItems.length > 0) ? menuItems : [];

  // Backend may return grouped documents like { category, slug, items: [...] } or flat menu items.
  // Normalize by flattening any grouped docs into individual item entries.
  const flattenMenuDocs = (arr: any[]) => {
    const out: any[] = [];
    if (!Array.isArray(arr)) return out;
    for (const doc of arr) {
      if (!doc) continue;
      if (Array.isArray(doc.items) && doc.items.length > 0) {
        const parentCat = (doc.slug || doc.category || "").toString();
        for (const it of doc.items) {
          out.push({ ...(it || {}), category: it.category || parentCat || doc.category });
        }
      } else {
        out.push(doc);
      }
    }
    return out;
  };

  const normalizedMenuArray = flattenMenuDocs(finalMenuItems);

  const mapMenuItem = (item: any): MenuItem => {
    // Normalize category names to the frontend expected values
    let rawCat = (item.category || item.slug || "starter").toString().toLowerCase();
    rawCat = rawCat.replace(/\s+/g, "-");
    let category: string = rawCat;
    if (category.endsWith("s")) category = category.replace(/s$/, "");
    if (category === "main-course" || category === "main_course") category = "main";
    if (category.includes("side") || category.includes("roti")) category = "side";
    if (category.includes("dessert")) category = "dessert";
    if (category.includes("beverage")) category = "beverage";
    if (category === "starters") category = "starter";

    const categoryImages = placeholderImages[category] || placeholderImages.starter;

    const imageUrl = item.imageUrl || item.image || (item.media && item.media.length ? item.media[0] : undefined) || categoryImages[Math.floor(Math.random() * categoryImages.length)];

    return {
      id: item.id ? String(item.id) : String(item.name || item.title || "").toLowerCase().replace(/\s+/g, "-"),
      name: item.name || item.title || "",
      description: item.description || "",
      category: (category as MenuCategory),
      portion: item.portion || "per serving",
      price: item.price ?? item.amount ?? 0,
      imageUrl,
      dietaryTags: item.dietaryTags || item.tags || [],
      isVisible: item.isVisible !== false,
    };
  };

  const sourceItems = normalizedMenuArray && Array.isArray(normalizedMenuArray)
    ? normalizedMenuArray.map(mapMenuItem)
    : [];

  const filteredItems = sourceItems
    .filter((item) => item.isVisible)
    .filter((item) => activeCategory === "all" || item.category === activeCategory)
    .filter((item) => 
      searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  // Group by category for display
  const itemsByCategory = (filteredItems as MenuItem[]).reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-warm via-sage/10 to-background">
        <div className="container-padding max-w-7xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Nourishment & Wellness
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-medium mb-6">
            Menu & Dining
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Where nourishment meets purity. Discover our curated satvik cuisine, 
            thoughtfully prepared to honor your wellness journey.
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-20 bg-background/95 backdrop-blur-md border-b border-border z-40 py-6">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-muted rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Search menu items"
              />
            </div>

            {/* Category Filter & Sort */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {(["all", "starter", "main", "side", "dessert", "beverage"] as MenuCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-4 py-2 text-sm rounded-full transition-all duration-300",
                      activeCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                    aria-pressed={activeCategory === cat}
                  >
                    {categoryLabels[cat]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-muted px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Sort menu items"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="section-padding bg-background">
        <div className="container-padding max-w-7xl mx-auto">
          {loading && finalMenuItems.length === 0 ? (
            <div className="text-center py-16">Loading menu items…</div>
          ) : error && menuItems === null ? (
            <div className="text-center py-16">
              <p className="text-amber-600 mb-4">Backend not connected. No menu items available.</p>
              <div className="mt-4">
                <Button onClick={() => refetch()}>Retry Backend Connection</Button>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No items found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {(["starter", "main", "side", "dessert", "beverage"] as MenuCategory[]).map((category) => {
                const items = itemsByCategory[category];
                if (!items || items.length === 0) return null;

                return (
                  <div key={category}>
                    <h2 className="font-serif text-2xl font-medium mb-6 text-foreground border-l-4 border-primary pl-4">
                      {categoryLabels[category]}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((item) => (
                        <MenuItemCard key={item.id} item={item} debug={debugImages} />
                      ))}
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
};

function MenuItemCard({ item, debug }: { item: MenuItem; debug?: boolean }) {
  const { addItem, payItem } = useBooking();
  return (
    <div className="group relative overflow-hidden rounded-lg bg-card border border-border shadow-soft hover:shadow-elegant transition-all duration-500">
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <OptimizedImage
          src={item.imageUrl}
          alt={item.name}
          srcSet={item.imageUrl ? makeResponsiveSrcSet(String(item.imageUrl)) : undefined}
          sizes="(max-width: 768px) 100vw, 33vw"
          width={800}
          height={600}
          className="transition-transform duration-700 group-hover:scale-105"
          // pass debug flag from page (enable with ?debugImages=1)
          debug={debug}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-1">
            {item.category}
          </p>
          <h3 className="font-serif text-xl font-medium group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {item.portion}
          </p>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {item.description}
        </p>

        {/* Dietary Tags */}
        {item.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="font-serif text-2xl text-primary">
            ₹{item.price}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                addItem({ id: item.id, name: item.name, price: item.price, portion: item.portion }, 1, false);
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity text-sm font-medium"
              onMouseDown={(e) => e.stopPropagation()}
            >
              Add to Booking
            </button>
            <button
              onClick={() => {
                addItem({ id: item.id, name: item.name, price: item.price, portion: item.portion }, 1, true);
                // also call payItem to simulate a confirmed payment (ensures paid flag set)
                setTimeout(() => payItem(item.id).catch(() => {}), 300);
              }}
              className="px-3 py-2 border rounded text-sm bg-transparent hover:bg-muted transition"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiningPage;
