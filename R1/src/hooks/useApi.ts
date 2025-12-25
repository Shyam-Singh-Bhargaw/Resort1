import { useState, useEffect } from 'react';
import { ApiError } from '@/types/api';
import { apiClient } from '@/lib/api-client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
}

/**
 * Generic hook for fetching data from API
 */
export function useApi<T>(
  fetchFn: () => Promise<T>,
  fallbackData?: T | null,
  dependencies: any[] = []
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: fallbackData || null,
    loading: true,
    error: null,
  });

  const refetch = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
    } catch (error: any) {
      console.warn('API Error:', error.message);
      // Use fallback data if available
      setState({
        data: fallbackData || null,
        loading: false,
        error: fallbackData ? null : { detail: error.message },
      });
    }
  };

  useEffect(() => {
    refetch();
  }, dependencies);

  return { ...state, refetch };
}

/**
 * Hook to fetch all accommodations
 */
export function useAccommodations() {
  return useApi(() => apiClient.getAllAccommodations());
}

/**
 * Hook to fetch all cottages (backend: /api/cottages)
 */
export function useCottages() {
  return useApi(() => apiClient.getAllCottages());
}

/**
 * Hook to fetch a single cottage by id
 */
export function useCottage(id?: string) {
  return useApi(() => (id ? apiClient.getCottage(id) : Promise.resolve(null)), null, [id]);
}

/**
 * Hook to fetch a single accommodation
 */
export function useAccommodation(id?: string) {
  return useApi(
    () => (id ? apiClient.getAccommodation(id) : Promise.resolve(null)),
    null,
    [id]
  );
}

/**
 * Hook to fetch all packages
 */
export function usePackages() {
  return useApi(() => apiClient.getAllPackages());
}

/**
 * Hook to fetch a single package
 */
export function usePackage(id?: string) {
  return useApi(
    () => (id ? apiClient.getPackage(id) : Promise.resolve(null)),
    null,
    [id]
  );
}

/**
 * Hook to fetch all experiences
 */
export function useExperiences() {
  return useApi(() => apiClient.getAllExperiences());
}

/**
 * Hook to fetch a single experience
 */
export function useExperience(id?: string) {
  return useApi(
    () => (id ? apiClient.getExperience(id) : Promise.resolve(null)),
    null,
    [id]
  );
}

/**
 * Hook to fetch all wellness services
 */
export function useWellness() {
  return useApi(() => apiClient.getAllWellness());
}

/**
 * Hook to fetch a single wellness service
 */
export function useSingleWellness(id?: string) {
  return useApi(
    () => (id ? apiClient.getWellness(id) : Promise.resolve(null)),
    null,
    [id]
  );
}

/**
 * Hook to fetch home page data
 */
export function useHomePageData() {
  return useApi(() => apiClient.getHomePage(), null, []);
}

/**
 * Hook to fetch resort statistics
 */
export function useStats() {
  return useApi(() => apiClient.getStats(), null, []);
}

/**
 * Hook to fetch all bookings
 */
export function useBookings() {
  return useApi(() => apiClient.getAllBookings());
}

/**
 * Hook to fetch a single booking
 */
export function useBooking(id?: string) {
  return useApi(
    () => (id ? apiClient.getBooking(id) : Promise.resolve(null)),
    null,
    [id]
  );
}

/**
 * Hook to fetch guest bookings
 */
export function useGuestBookings(email?: string) {
  return useApi(
    () => (email ? apiClient.getGuestBookings(email) : Promise.resolve(null)),
    null,
    [email]
  );
}

/**
 * Hook to fetch navigation menu
 */
export function useNavigation() {
  return useApi(() => apiClient.getNavigation());
}

/**
 * Hook to fetch all menu items
 */
export function useMenuItems() {
  return useApi(() => apiClient.getAllMenuItems());
}

/**
 * Hook to fetch dining menu from compatibility endpoint (/api/dining -> db['menu'])
 */
export function useDining() {
  return useApi(() => apiClient.getDining());
}

/**
 * Hook to fetch a single menu item
 */
export function useMenuItem(id?: string) {
  return useApi(
    () => (id ? apiClient.getMenuItem(id) : Promise.resolve(null)),
    null,
    [id]
  );
}

/**
 * Hook to fetch menu items by category
 */
export function useMenuItemsByCategory(category?: string) {
  return useApi(
    () => (category ? apiClient.getMenuItemsByCategory(category) : apiClient.getAllMenuItems()),
    [],
    [category]
  );
}

/**
 * Hook to fetch Programs -> Wellness
 */
export function useProgramsWellness() {
  return useApi(() => apiClient.getProgramsWellness());
}

/**
 * Hook to fetch Programs -> Activities
 */
export function useProgramsActivities() {
  return useApi(() => apiClient.getProgramsActivities());
}

/**
 * Hook to fetch gallery items from backend
 */
export function useGallery() {
  return useApi(() => apiClient.getGallery({ visibleOnly: true }), [] as any[]);
}

/**
 * Hook to fetch extra-beds for a specific accommodation
 */
export function useExtraBedsForAccommodation(accommodationId?: string) {
  return useApi(
    () => (accommodationId ? apiClient.getExtraBedsForAccommodation(accommodationId) : Promise.resolve([])),
    [],
    [accommodationId]
  );
}

/**
 * Hook to fetch all extra bed types
 */
export function useAllExtraBeds() {
  return useApi(() => apiClient.getAllExtraBeds(), [] as any[], []);
}

/**
 * Hook to fetch site-wide config (contact info, business hours, social links)
 */
export function useSiteConfig() {
  return useApi(() => apiClient.getSiteConfig());
}
