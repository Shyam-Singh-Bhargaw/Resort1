
type Category = "all" | "wellness" | "nutrition" | "movement" | "sleep" | "sound" | "consultation" | "private";

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All Experiences" },
  { value: "wellness", label: "Wellbeing Consultations" },
  { value: "nutrition", label: "Nutrition & Mindset" },
  { value: "movement", label: "Movement & Yoga" },
  { value: "sleep", label: "Sleep & Meditation" },
  { value: "sound", label: "Sound Healing" },
  { value: "private", label: "Private Sessions" },
];

interface Experience {
  id: string;
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  price: number;
  duration: string;
  featured: boolean;
  activities: string[];
  rating: number;
  images: string[];
}

const ExperiencesPage = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "duration">("price-asc");

  const { data: experienceServices, loading: experiencesLoading, error: experiencesError, refetch: refetchExperiences } = useExperiences();

  // Placeholder images by category (using local assets)
  const placeholderImages: Record<string, string[]> = {
    wellness: [spaImg, ayurvedaImg, yogaImg],
    nutrition: [luxurySuiteImg, spaImg, yogaImg],
    movement: [yogaImg, luxurySuiteImg, ayurvedaImg],
    sleep: [spaImg, yogaImg, luxurySuiteImg],
    sound: [ayurvedaImg, spaImg, yogaImg],
    consultation: [luxurySuiteImg, ayurvedaImg, spaImg],
    private: [yogaImg, spaImg, luxurySuiteImg],
  };

  const mapExperience = (e: any): Experience => {
    const category = (e.category || e.type || "wellness").toLowerCase();
    const categoryImages = placeholderImages[category] || placeholderImages.wellness;
    
    // If no images, assign placeholder images (rotate through category images)
    const images = e.images && Array.isArray(e.images) && e.images.length > 0 
      ? e.images 
      : categoryImages;

    return {
      id: e.id ? String(e.id) : String(e.name || "").toLowerCase().replace(/\s+/g, "-"),
      name: e.name || "",
      category: category,
      description: e.description || "",
      shortDescription: (e.description || "").slice(0, 140),
      price: e.price ?? 0,
      duration: `${e.duration_hours ? `${e.duration_hours} hours` : e.duration_minutes ? `${e.duration_minutes} min` : "Duration varies"}`,
      featured: e.rating ? e.rating >= 4.5 : false,
      activities: e.activities || [],
      rating: e.rating || 0,
      images: images,
    };
  };

  const sourceExperiences: Experience[] =
    experienceServices && Array.isArray(experienceServices)
      ? experienceServices.map(mapExperience)
      : [];

  const filteredExperiences = sourceExperiences
    .filter((exp) => activeCategory === "all" || String((exp as any).category).toLowerCase() === activeCategory)
    .sort((a, b) => {
      const aPrice = a.price || 0;
      const bPrice = b.price || 0;
      if (sortBy === "price-asc") return aPrice - bPrice;
      if (sortBy === "price-desc") return bPrice - aPrice;
      return 0;
    });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-sage/20">
        <div className="container-padding max-w-7xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Curated Paths to Transformation
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-medium mb-6">
            Experiences
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Embark on transformative journeys designed to awaken your senses, deepen your practice, 
            and reconnect with your truest self. Each experience is thoughtfully curated to honor 
            the intersection of ancient wisdom and contemporary wellness.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border sticky top-20 bg-background/95 backdrop-blur-md z-40">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-full transition-all duration-300",
                    activeCategory === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  )}
                  title={`Filter experiences by ${cat.label.toLowerCase()}`}
                  aria-pressed={activeCategory === cat.value}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-muted px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Sort experiences by price or duration"
                title="Sort experiences"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="section-padding bg-background">
        <div className="container-padding max-w-7xl mx-auto">
          {experiencesLoading ? (
            <div className="text-center py-16">Loading experiences…</div>
          ) : experiencesError ? (
            <div className="text-center py-16 text-destructive">
              <p>Failed to load experiences.</p>
              <div className="mt-4">
                <Button aria-label="Retry loading experiences" onClick={() => refetchExperiences()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredExperiences.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          )}

          {filteredExperiences.length === 0 && !experiencesLoading && !experiencesError && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No experiences found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Link
      to={`/experiences/${experience.id}`}
      className="group relative overflow-hidden rounded-lg bg-card shadow-soft hover:shadow-elegant transition-all duration-500"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {experience.images && experience.images.length > 0 ? (
          <OptimizedImage
            src={experience.images[0]}
            srcSet={`${experience.images[0]} 800w`}
            loading="lazy"
            decoding="async"
            alt={experience.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            fallbackQuery={`${experience.category},wellness`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image available
          </div>
        )}
        {experience.featured && (
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 text-xs tracking-wider uppercase rounded">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2">
          {experience.category}
        </p>
        <h3 className="font-serif text-2xl font-medium mb-2 group-hover:text-primary transition-colors">
          {experience.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {experience.shortDescription}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {experience.duration}
          </span>
          {experience.rating > 0 && (
            <span className="flex items-center gap-1">
              ★ {experience.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="font-serif text-2xl text-primary">
              ${experience.price}
            </span>
            <span className="text-muted-foreground text-sm"> / session</span>
          </div>
          <Button variant="outline" size="sm">
            Explore
          </Button>
        </div>
      </div>
    </Link>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Old Experiences page removed — redirecting to new Programs > Activities listing.
export default function ExperiencesRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/programs/activities', { replace: true });
  }, [navigate]);
  return null;
}
