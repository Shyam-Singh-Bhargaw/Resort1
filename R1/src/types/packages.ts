export interface PackageItem {
  id: string;
  title: string;
  price?: string;
  description?: string;
  imageUrl?: string;
  featured?: boolean;
}

export const samplePackages: PackageItem[] = [];

export const PACKAGES_STORAGE_KEY = "packages_v1";
