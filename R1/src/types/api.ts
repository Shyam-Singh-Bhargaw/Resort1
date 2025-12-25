// API Response Types
export interface Accommodation {
  id?: string;
  name: string;
  description: string;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  images: string[];
  rating: number;
  created_at?: string;
}

export interface Package {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  includes: string[];
  images: string[];
  rating: number;
  created_at?: string;
}

export interface Experience {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration_hours: number;
  activities: string[];
  images: string[];
  rating: number;
  created_at?: string;
}

export interface Wellness {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  benefits: string[];
  images: string[];
  rating: number;
  created_at?: string;
}

export interface Booking {
  id?: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  accommodation_id: string;
  package_id?: string;
  experience_ids?: string[];
  wellness_ids?: string[];
  check_in: string;
  check_out: string;
  total_price: number;
  status?: string;
  created_at?: string;
}

export interface HomePageData {
  featured_accommodations?: Accommodation[];
  featured_packages?: Package[];
  featured_experiences?: Experience[];
  featured_wellness?: Wellness[];
}

export interface ResortStats {
  total_accommodations?: number;
  total_guests?: number;
  total_bookings?: number;
  average_rating?: number;
}

export interface ApiError {
  status?: number;
  detail?: string | Array<{ loc: string[]; msg: string; type: string }>;
  errors?: Record<string, string[]>;
}
