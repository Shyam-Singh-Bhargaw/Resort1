/**
 * Menu & Dining Data Types
 * Represents satvik cuisine offerings at Mud & Meadows
 */

export type MenuCategory = 'starter' | 'main' | 'side' | 'dessert' | 'beverage';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  portion: string; // e.g., "per plate", "per bowl", "per glass"
  price: number;
  imageUrl?: string;
  dietaryTags: string[]; // e.g., ["gluten-free", "nut-free", "vegan"]
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItemInput {
  name: string;
  description: string;
  category: MenuCategory;
  portion: string;
  price: number;
  imageUrl?: string;
  dietaryTags: string[];
  isVisible: boolean;
}

export interface MenuDiningPage {
  id: string;
  title: string;
  subtitle: string;
  heroImageUrl?: string;
  description: string;
}
