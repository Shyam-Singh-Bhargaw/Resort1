import { useState } from 'react';
import { ApiError } from '@/types/api';
import { apiClient } from '@/lib/api-client';

interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseMutationReturn<T> extends UseMutationState<T> {
  mutate: (args?: unknown) => Promise<T | null>;
  reset: () => void;
}

/**
 * Generic hook for mutations (POST, PUT, DELETE)
 */
export function useApiMutation<T>(
  mutationFn: (args?: unknown) => Promise<T>
): UseMutationReturn<T> {
  const [state, setState] = useState<UseMutationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = async (args?: unknown) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await mutationFn(args);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      // Build a structured ApiError from thrown error (ApiClient provides status/detail/errors)
      const apiError: ApiError = {};

      if (error instanceof Error) {
        const e: any = error;
        apiError.detail = e.detail ?? e.message ?? String(e);
        if (typeof e.status === 'number') apiError.status = e.status;
        if (e.errors) apiError.errors = e.errors;
      } else if (error && typeof error === 'object') {
        const e: any = error;
        apiError.detail = e.detail ?? JSON.stringify(e);
        if (e.errors) apiError.errors = e.errors;
        if (typeof e.status === 'number') apiError.status = e.status;
      } else {
        apiError.detail = 'An error occurred';
      }

      setState({
        data: null,
        loading: false,
        error: apiError,
      });

      return null;
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  return { ...state, mutate, reset };
}

/**
 * Hook to create an accommodation
 */
export function useCreateAccommodation() {
  return useApiMutation((data) => apiClient.createAccommodation(data as Record<string, unknown>));
}

/**
 * Hook to update an accommodation
 */
export function useUpdateAccommodation() {
  return useApiMutation((args) => {
    const { id, data } = args as { id: string; data: Record<string, unknown> };
    return apiClient.updateAccommodation(id, data);
  });
}

/**
 * Hook to delete an accommodation
 */
export function useDeleteAccommodation() {
  return useApiMutation((id) => apiClient.deleteAccommodation(id as string));
}

export function useRestoreAccommodation() {
  return useApiMutation((id) => apiClient.restoreAccommodation(id as string));
}

/**
 * Hook to create a package
 */
export function useCreatePackage() {
  return useApiMutation((data) => apiClient.createPackage(data as Record<string, unknown>));
}

/**
 * Hook to update a package
 */
export function useUpdatePackage() {
  return useApiMutation((args) => {
    const { id, data } = args as { id: string; data: Record<string, unknown> };
    return apiClient.updatePackage(id, data);
  });
}

/**
 * Hook to delete a package
 */
export function useDeletePackage() {
  return useApiMutation((id) => apiClient.deletePackage(id as string));
}

export function useRestorePackage() {
  return useApiMutation((id) => apiClient.restorePackage(id as string));
}

/**
 * Hook to create an experience
 */
export function useCreateExperience() {
  return useApiMutation((data) => apiClient.createExperience(data as Record<string, unknown>));
}

/**
 * Hook to update an experience
 */
export function useUpdateExperience() {
  return useApiMutation((args) => {
    const { id, data } = args as { id: string; data: Record<string, unknown> };
    return apiClient.updateExperience(id, data);
  });
}

/**
 * Hook to delete an experience
 */
export function useDeleteExperience() {
  return useApiMutation((id) => apiClient.deleteExperience(id as string));
}

export function useRestoreExperience() {
  return useApiMutation((id) => apiClient.restoreExperience(id as string));
}

/**
 * Hook to create a wellness service
 */
export function useCreateWellness() {
  return useApiMutation((data) => apiClient.createWellness(data as Record<string, unknown>));
}

/**
 * Hook to update a wellness service
 */
export function useUpdateWellness() {
  return useApiMutation((args) => {
    const { id, data } = args as { id: string; data: Record<string, unknown> };
    return apiClient.updateWellness(id, data);
  });
}

/**
 * Hook to delete a wellness service
 */
export function useDeleteWellness() {
  return useApiMutation((id) => apiClient.deleteWellness(id as string));
}

export function useRestoreWellness() {
  return useApiMutation((id) => apiClient.restoreWellness(id as string));
}

/**
 * Hook to create a booking
 */
export function useCreateBooking() {
  return useApiMutation((data) => apiClient.createBooking(data as Record<string, unknown>));
}

/**
 * Hook to create booking via /api/bookings (new cottages booking endpoint)
 */
export function useCreateApiBooking() {
  return useApiMutation((data) => apiClient.createApiBooking(data as Record<string, unknown>));
}

/**
 * Hook to upload images/files using FormData
 */
export function useUploadImage() {
  return useApiMutation((formData) => apiClient.uploadImage(formData as FormData));
}

/**
 * Hook to create a guest/profile record
 */
export function useCreateGuestProfile() {
  return useApiMutation((data) => apiClient.createGuestProfile(data as Record<string, unknown>));
}

/**
 * Hook to send booking confirmation email
 */
export function useSendBookingConfirmation() {
  return useApiMutation((args) => {
    const { bookingId, data } = args as { bookingId: string; data: Record<string, unknown> };
    return apiClient.sendBookingConfirmation(bookingId, data);
  });
}

/**
 * Hook to create a transaction record (payments)
 */
export function useCreateTransaction() {
  return useApiMutation((data) => apiClient.createTransaction(data as Record<string, unknown>));
}

/**
 * Hook to update a booking
 */
export function useUpdateBooking() {
  return useApiMutation((args) => {
    const { id, data } = args as { id: string; data: Record<string, unknown> };
    return apiClient.updateBooking(id, data);
  });
}

/**
 * Hook to delete a booking
 */
export function useDeleteBooking() {
  return useApiMutation((id) => apiClient.deleteBooking(id as string));
}

/**
 * Hook to restore a booking (if backend supports soft deletes)
 */
export function useRestoreBooking() {
  return useApiMutation((id) => apiClient.restoreBooking(id as string));
}

/**
 * Hook to create navigation item
 */
export function useCreateNavigationItem() {
  return useApiMutation((data) => apiClient.createNavigationItem(data));
}

/**
 * Hook to update navigation item
 */
export function useUpdateNavigationItem() {
  return useApiMutation((args) => {
    const { id, data } = args as { id: string; data: Record<string, unknown> };
    return apiClient.updateNavigationItem(id, data);
  });
}

/**
 * Hook to delete navigation item
 */
export function useDeleteNavigationItem() {
  return useApiMutation((id) => apiClient.deleteNavigationItem(id as string));
}

export function useRestoreNavigationItem() {
  return useApiMutation((id) => apiClient.restoreNavigationItem(id as string));
}

/**
 * Hook to reorder navigation items
 */
export function useReorderNavigation() {
  return useApiMutation((items) => apiClient.reorderNavigation(items as any[]));
}

/**
 * Hook to create menu item
 */
export function useCreateMenuItem() {
  return useApiMutation((data) => apiClient.createMenuItem(data as Record<string, unknown>));
}

/**
 * Hook to update menu item
 */
export function useUpdateMenuItem() {
  return useApiMutation((args) => {
    const { id, data } = args as { id: string; data: Record<string, unknown> };
    return apiClient.updateMenuItem(id, data);
  });
}

/**
 * Hook to delete menu item
 */
export function useDeleteMenuItem() {
  return useApiMutation((id) => apiClient.deleteMenuItem(id as string));
}

/**
 * Hook to restore menu item
 */
export function useRestoreMenuItem() {
  return useApiMutation((id) => apiClient.restoreMenuItem(id as string));
}
