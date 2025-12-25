import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import yogaImage from "@/assets/yoga-wellness.jpg";
import spaImage from "@/assets/spa-treatment.jpg";
import ayurvedaImage from "@/assets/ayurveda-therapy.jpg";
import OptimizedImage from "@/components/ui/OptimizedImage";

const experiences = [
  {
    title: "Yoga & Meditation",
    description: "Transform your practice with sunrise sessions overlooking the Himalayas, guided by master practitioners.",
    image: yogaImage,
    link: "/programs/wellness?category=yoga"
  },
  {
    title: "Ayurvedic Healing",
    description: "Experience authentic Panchakarma and personalized treatments from our team of Ayurvedic physicians.",
    image: ayurvedaImage,
    link: "/programs/wellness?category=ayurveda"
  },
  {
    title: "Spa & Therapies",
    description: "Indulge in holistic treatments combining ancient healing arts with contemporary wellness practices.",
    image: spaImage,
    link: "/programs/wellness?category=spa"
  }
];

export function ExperiencesSection() {
  return (
    <section className="section-padding bg-cream">
      <div className="container-padding max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Transformative Journeys
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
            Curated Wellness Experiences
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Immerse yourself in holistic healing traditions passed down through generations, 
            set against the majestic backdrop of the Himalayas.
          </p>
        </div>

        {/* Experience Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {experiences.map((exp, index) => (
            <Link
              key={exp.title}
              to={exp.link}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <OptimizedImage
                src={exp.image}
                alt={exp.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                fallbackQuery="wellness,spa,yoga"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-primary-foreground">
                <h3 className="font-serif text-2xl font-medium mb-3 group-hover:translate-x-2 transition-transform duration-300">
                  {exp.title}
                </h3>
                <p className="text-sm opacity-90 leading-relaxed mb-4">
                  {exp.description}
                </p>
                <span className="text-xs tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/programs/wellness">
            <Button variant="outline" size="lg">
              View All Programs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
