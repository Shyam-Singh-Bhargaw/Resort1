// API Client Configuration
// Use Vite's import.meta.env in browser builds instead of Node's process.env
// Default to backend root (no `/api` prefix) for local dev. Use VITE_API_URL or NEXT_PUBLIC_API_URL to override.
// Prefer explicit VITE_API_URL / NEXT_PUBLIC_API_URL if provided.
// Otherwise, when running locally on localhost, default to http://localhost:8000 so frontend
// dev server at localhost:3000 can reach backend at :8000 without a proxy configured.
const _env = (import.meta as any).env || {};
// Prefer explicit env variables in production/CI. For local browser dev, provide
// a sensible default so developers can run frontend at :3000 and backend at :8000
// without additional setup. This avoids a hard runtime crash in the browser while
// preserving a hard error for non-browser/server environments.
const API_BASE_URL = _env.VITE_API_URL || _env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? 'http://localhost:8000' : '');

// Optional API key for development; frontends should use local env and not commit this.
const API_KEY = _env.VITE_API_KEY || _env.NEXT_PUBLIC_API_KEY || '';

if (!API_BASE_URL) {
  // Non-browser/server environments must supply the API base explicitly.
  throw new Error('Missing API base: set VITE_API_URL or NEXT_PUBLIC_API_URL in server/CI environments.');
} else if (API_BASE_URL === 'http://localhost:8000') {
  // Helpful developer warning when using the fallback in browser dev.
  if (typeof console !== 'undefined' && console.warn) {
    console.warn('[api-client] No VITE_API_URL/NEXT_PUBLIC_API_URL set; using default http://localhost:8000. Set VITE_API_URL to override.');
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Normalize endpoint to avoid duplicate `/api` when baseUrl already contains `/api`
    let endpointPath = endpoint;
    if (this.baseUrl && this.baseUrl.endsWith('/api') && endpointPath.startsWith('/api')) {
      endpointPath = endpointPath.replace(/^\/api/, '');
    }
    // Ensure endpoint path starts with '/'
    if (!endpointPath.startsWith('/')) endpointPath = '/' + endpointPath;
    // Join and collapse duplicate slashes but preserve protocol (http://)
    const url = `${this.baseUrl}${endpointPath}`.replace(/([^:\/])\/\/+/g, '$1/');

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'X-API-KEY': API_KEY } : {}),
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch (err) {
        // ignore parse errors
      }

      const message = (errorBody && (errorBody.detail || errorBody.message)) || `HTTP ${response.status}`;
      const err: any = new Error(message);
      err.status = response.status;
      err.detail = errorBody?.detail ?? errorBody ?? message;
      if (errorBody && typeof errorBody === 'object') {
        if (errorBody.errors) err.errors = errorBody.errors;
        if (errorBody.field_errors) err.errors = errorBody.field_errors;
        if (Array.isArray(errorBody.detail) && errorBody.detail.length > 0) err.detail = errorBody.detail;
      }

      throw err;
    }

    return response.json();
  }

  // Home endpoints
  async getHomePage() {
    return this.request('/home/');
  }

  async getStats() {
    return this.request('/home/stats');
  }

  // Accommodations
  async getAllAccommodations() {
    return this.request('/accommodations/');
  }

  async getAccommodation(id: string) {
    return this.request(`/accommodations/${id}`);
  }

  async createAccommodation(data: any) {
    return this.request('/accommodations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccommodation(id: string, data: any) {
    return this.request(`/accommodations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAccommodation(id: string) {
    return this.request(`/accommodations/${id}`, {
      method: 'DELETE',
    });
  }

  async restoreAccommodation(id: string) {
    return this.request(`/accommodations/${id}/restore`, {
      method: 'POST',
    });
  }

  // Cottages (alias for accommodations, backend exposes /api/cottages per new spec)
  async getAllCottages(params: {
    page?: number;
    limit?: number;
    tags?: string[] | string;
    minCapacity?: number;
    maxPrice?: number;
    availableStart?: string;
    availableEnd?: string;
    sort?: string;
  } = {}) {
    const qs: string[] = [];
    if (params.page) qs.push(`page=${params.page}`);
    if (params.limit) qs.push(`limit=${params.limit}`);
    if (params.tags) qs.push(`tags=${encodeURIComponent(Array.isArray(params.tags) ? params.tags.join(',') : params.tags)}`);
    if (params.minCapacity) qs.push(`minCapacity=${params.minCapacity}`);
    if (params.maxPrice) qs.push(`maxPrice=${params.maxPrice}`);
    if (params.availableStart) qs.push(`availableStart=${encodeURIComponent(params.availableStart)}`);
    if (params.availableEnd) qs.push(`availableEnd=${encodeURIComponent(params.availableEnd)}`);
    if (params.sort) qs.push(`sort=${encodeURIComponent(params.sort)}`);
    const query = qs.length ? `?${qs.join('&')}` : '';
      const res: any = await this.request(`/api/cottages${query}`);
    // Compatibility: backend may return { page, limit, total, items: [...] }
    if (res && typeof res === 'object' && Array.isArray(res.items)) {
      return res.items.map((c: any) => ({
        ...c,
        rooms: Array.isArray(c.rooms) ? c.rooms.map((r: any) => ({
          id: r.id || r._id || String(r._id || ''),
          name: r.name || r.title || '',
          capacity: r.capacity ?? r.sleeps ?? 0,
          price_per_night: r.price_per_night ?? r.pricePerNight ?? r.price ?? 0,
          available: typeof r.available !== 'undefined' ? r.available : true,
          // keep other fields as-is
          ...r,
        })) : [],
      }));
    }
    return res;
  }

  async getCottage(id: string) {
    const res: any = await this.request(`/api/cottages/${id}`);
    if (res && typeof res === 'object') {
      return {
        ...res,
        rooms: Array.isArray(res.rooms) ? res.rooms.map((r: any) => ({
          id: r.id || r._id || String(r._id || ''),
          name: r.name || r.title || '',
          capacity: r.capacity ?? r.sleeps ?? 0,
          price_per_night: r.price_per_night ?? r.pricePerNight ?? r.price ?? 0,
          available: typeof r.available !== 'undefined' ? r.available : true,
          ...r,
        })) : [],
      };
    }
    return res;
  }

  async getRoomByName(name: string) {
    return this.request(`/api/rooms/name/${encodeURIComponent(name)}`);
  }

  // Extra bed endpoints
  async getAllExtraBeds() {
    return this.request('/extra-beds/');
  }

  async getExtraBedsForAccommodation(accommodationId: string) {
    return this.request(`/extra-beds/for-accommodation/${accommodationId}`);
  }

  async requestExtraBed(data: any) {
    return this.request('/extra-beds/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Booking endpoint per new spec
  async createApiBooking(data: any) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Packages
  async getAllPackages() {
    // Prefer compatibility API under /api when available
    try {
      return await this.request('/api/packages');
    } catch (err) {
      return this.request('/packages/');
    }
  }

  async getPackage(id: string) {
    return this.request(`/packages/${id}`);
  }

  async createPackage(data: any) {
    return this.request('/packages/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePackage(id: string, data: any) {
    return this.request(`/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePackage(id: string) {
    return this.request(`/packages/${id}`, {
      method: 'DELETE',
    });
  }

  async restorePackage(id: string) {
    return this.request(`/packages/${id}/restore`, {
      method: 'POST',
    });
  }

  // Experiences
  async getAllExperiences() {
    return this.request('/experiences/');
  }

  async getExperience(id: string) {
    return this.request(`/experiences/${id}`);
  }

  async createExperience(data: any) {
    return this.request('/experiences/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExperience(id: string, data: any) {
    return this.request(`/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExperience(id: string) {
    return this.request(`/experiences/${id}`, {
      method: 'DELETE',
    });
  }

  async restoreExperience(id: string) {
    return this.request(`/experiences/${id}/restore`, {
      method: 'POST',
    });
  }

  // Wellness
  async getAllWellness() {
    return this.request('/wellness/');
  }

  async getWellness(id: string) {
    return this.request(`/wellness/${id}`);
  }

  async createWellness(data: any) {
    return this.request('/wellness/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWellness(id: string, data: any) {
    return this.request(`/wellness/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWellness(id: string) {
    return this.request(`/wellness/${id}`, {
      method: 'DELETE',
    });
  }

  async restoreWellness(id: string) {
    return this.request(`/wellness/${id}/restore`, {
      method: 'POST',
    });
  }

  // Bookings
  async getAllBookings() {
    return this.request('/bookings/');
  }

  async getBooking(id: string) {
    return this.request(`/bookings/${id}`);
  }

  async createBooking(data: any) {
    const headers: Record<string,string> = {};
    // if a token is stored, include Authorization header
    try {
      const token = localStorage.getItem('auth_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {}
    return this.request('/bookings/', {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    });
  }

  async updateBooking(id: string, data: any) {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBooking(id: string) {
    return this.request(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  // Attempt to restore a soft-deleted booking if backend supports it
  async restoreBooking(id: string) {
    return this.request(`/bookings/${id}/restore`, {
      method: 'POST',
    });
  }

  async getGuestBookings(email: string) {
    return this.request(`/bookings/guest/${email}`);
  }

  // Guests / Profiles
  async createGuestProfile(data: any) {
    return this.request('/guests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Send booking confirmation email (backend should expose this endpoint)
  async sendBookingConfirmation(bookingId: string, data: any) {
    return this.request(`/bookings/${bookingId}/send-confirmation`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payments / Transactions
  async createTransaction(data: any) {
    return this.request('/transactions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Upload image / files - use FormData and do not set JSON headers
  async uploadImage(formData: FormData) {
    const url = `${this.baseUrl}/uploads/`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch (err) {
        // ignore parse errors
      }
      const message = (errorBody && (errorBody.detail || errorBody.message)) || `HTTP ${response.status}`;
      const err: any = new Error(message);
      err.status = response.status;
      err.detail = errorBody?.detail ?? errorBody ?? message;
      if (errorBody && typeof errorBody === 'object') {
        if (errorBody.errors) err.errors = errorBody.errors;
        if (Array.isArray(errorBody.detail) && errorBody.detail.length > 0) err.detail = errorBody.detail;
      }
      throw err;
    }

    return response.json();
  }

  // Navigation Management
  async getNavigation() {
    return this.request('/navigation/');
  }

  async createNavigationItem(data: any) {
    return this.request('/navigation/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNavigationItem(id: string, data: any) {
    return this.request(`/navigation/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNavigationItem(id: string) {
    return this.request(`/navigation/${id}`, {
      method: 'DELETE',
    });
  }

  async restoreNavigationItem(id: string) {
    return this.request(`/navigation/${id}/restore`, {
      method: 'POST',
    });
  }

  async reorderNavigation(items: any[]) {
    return this.request('/navigation/reorder', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  // Menu Items
  async getAllMenuItems() {
    return this.request('/menu-items/');
  }

  // Dining (compatibility endpoint reading `menu` collection)
  async getDining() {
    return this.request('/api/dining');
  }

  async getMenuItem(id: string) {
    return this.request(`/menu-items/${id}`);
  }

  async getMenuItemsByCategory(category: string) {
    return this.request(`/menu-items/?category=${encodeURIComponent(category)}`);
  }

  async createMenuItem(data: any) {
    return this.request('/menu-items/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(id: string, data: any) {
    return this.request(`/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenuItem(id: string) {
    return this.request(`/menu-items/${id}`, {
      method: 'DELETE',
    });
  }

  async restoreMenuItem(id: string) {
    return this.request(`/menu-items/${id}/restore`, {
      method: 'POST',
    });
  }

  // Programs (frontend requests backend at /api/programs/... per spec)
  async getProgramsWellness() {
    // Prefer the compatibility query endpoint that does not require API key in many dev setups
    // Fallback order:
    // 1. /api/programs/?tag=wellness
    // 2. /api/programs/wellness
    // 3. /programs/?tag=wellness
    try {
      const res: any = await this.request('/api/programs/?tag=wellness');
      if (res && typeof res === 'object' && Array.isArray(res.value)) return res.value;
      if (Array.isArray(res)) return res;
      return res;
    } catch (err) {
      try {
        const primary: any = await this.request('/api/programs/wellness');
        if (primary && typeof primary === 'object' && Array.isArray(primary.value)) return primary.value;
        if (Array.isArray(primary)) return primary;
        return primary;
      } catch (err2) {
        const res: any = await this.request('/programs/?tag=wellness');
        if (res && typeof res === 'object' && Array.isArray(res.value)) return res.value;
        return res;
      }
    }
  }

  async getProgramsActivities() {
    // Prefer the explicit compatibility endpoint if present.
    try {
      const res = await this.request('/api/programs/activities');
      return res;
    } catch (err) {
      try {
        // Fallback to the tag-based endpoint which some backends expose.
        return await this.request('/api/programs/?tag=activities');
      } catch (err2) {
        return this.request('/programs/?tag=activities');
      }
    }
  }

  // Site / Contact configuration
  async getSiteConfig() {
    return this.request('/api/site');
  }

  // Gallery (public + admin CRUD)
  async getGallery(params: { category?: string; visibleOnly?: boolean } = {}) {
    const { category, visibleOnly } = params;
    const qs: string[] = [];
    if (category) qs.push(`category=${encodeURIComponent(category)}`);
    if (visibleOnly) qs.push(`visible=true`);
    const query = qs.length ? `?${qs.join('&')}` : '';
    return this.request(`/gallery/${query}`);
  }

  async createGalleryItem(data: any) {
    return this.request('/gallery/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGalleryItem(id: string, data: any) {
    return this.request(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGalleryItem(id: string) {
    return this.request(`/gallery/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
