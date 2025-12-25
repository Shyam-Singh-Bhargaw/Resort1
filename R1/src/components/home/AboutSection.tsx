import { useSiteConfig } from "@/hooks/useApi";
import { Award, Leaf, Heart, Shield } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Ancient Wisdom",
    description: "Over 5,000 years of Ayurvedic healing traditions, practiced by master physicians."
  },
  {
    icon: Heart,
    title: "Holistic Approach",
    description: "Integrating mind, body, and spirit through personalized wellness journeys."
  },
  {
    icon: Award,
    title: "World-Class Excellence",
    description: "Recognized globally as a premier destination spa and wellness retreat."
  },
  {
    icon: Shield,
    title: "Sanctuary of Peace",
    description: "Nestled in pristine Himalayan nature, far from the chaos of everyday life."
  }
];

export function AboutSection() {
  const { data: siteConfig } = useSiteConfig();
  return (
    <section className="section-padding bg-sage/20">
      <div className="container-padding max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
              Our Philosophy
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
              A Haven for <br />
              <span className="italic">Transformation</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {siteConfig?.description || ""}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our sanctuary combines the ancient healing wisdom of Ayurveda with modern 
              luxury, creating an environment where profound transformation becomes possible. 
              Each guest embarks on a personalized journey designed to restore balance and 
              ignite the spark of vitality within.
            </p>

            {/* Awards */}
            <div className="border-t border-border pt-8">
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
                Recognized Excellence
              </p>
              <div className="space-y-2">
                {(siteConfig?.awards || []).map((award: string) => (
                  <div key={award} className="flex items-center gap-3 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span>{award}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-background p-6 rounded-lg shadow-soft hover:shadow-elegant transition-all duration-300"
              >
                <feature.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-serif text-lg font-medium mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
