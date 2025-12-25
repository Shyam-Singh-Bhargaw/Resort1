export type GalleryCategory = "rooms" | "spa" | "dining" | "experiences" | "nature";

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
  category?: GalleryCategory;
  isVisible?: boolean;
  createdAt?: string;
}

export const sampleCategories: GalleryCategory[] = [];
