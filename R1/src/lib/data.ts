// Mock data for the luxury wellness resort

export interface Room {
  id: string;
  name: string;
  category: "deluxe" | "suite" | "villa" | "pavilion";
  description: string;
  shortDescription: string;
  basePrice: number;
  maxGuests: number;
  size: number;
  view: string;
  amenities: string[];
  images: string[];
  featured: boolean;
}


export interface Testimonial {
  id: string;
  name: string;
  location: string;
  content: string;
  rating: number;
  image?: string;
}

export interface SeasonalOffer {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  image: string;
  applicableTo: "rooms" | "programs" | "all";
}

export const rooms: Room[] = [];

// Wellness program mock data removed — programs now served from backend via /api/programs/* endpoints

export const testimonials: Testimonial[] = [
  // Testimonials are now served by backend via /api/home or /api/testimonials
];

export const seasonalOffers: SeasonalOffer[] = [
  // Offers are now served from backend via /api/offers or home API
];

export const resortInfo = {
  name: "",
  tagline: "",
  description: "",
  location: "",
  phone: "",
  email: "",
  awards: []
};
