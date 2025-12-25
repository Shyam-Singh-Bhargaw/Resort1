# API Configuration Guide

## Environment Setup

The Next.js project is configured to communicate with the FastAPI backend. Environment variables are set in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
REACT_APP_API_URL=http://localhost:8000/api
```

Change these URLs according to your deployment environment.

## API Client

The `ApiClient` class in `src/lib/api-client.ts` handles all HTTP requests to the FastAPI backend.

### Usage Example

```typescript
import { apiClient } from '@/lib/api-client';

// Get all accommodations
const accommodations = await apiClient.getAllAccommodations();

// Get a specific accommodation
const accommodation = await apiClient.getAccommodation('accommodation_id');

// Create a new accommodation
await apiClient.createAccommodation({
  name: 'Luxury Suite',
  description: 'A beautiful luxury suite',
  price_per_night: 500,
  capacity: 2,
  amenities: ['WiFi', 'Air Conditioning'],
  images: ['image_url'],
  rating: 4.5
});

// Update an accommodation
await apiClient.updateAccommodation('accommodation_id', {
  name: 'Updated Suite',
  // ... other fields
});

// Delete an accommodation
await apiClient.deleteAccommodation('accommodation_id');
```

## React Hooks

### Query Hooks (for fetching data)

All query hooks use the `useApi` pattern and return:
- `data`: The fetched data (null initially)
- `loading`: Boolean indicating if data is being fetched
- `error`: Error object if something went wrong
- `refetch`: Function to manually refetch the data

#### Available Query Hooks

**Accommodations:**
```typescript
import { useAccommodations, useAccommodation } from '@/hooks/useApi';

const { data, loading, error, refetch } = useAccommodations();
const { data: single, loading, error } = useAccommodation('accommodation_id');
```

**Packages:**
```typescript
import { usePackages, usePackage } from '@/hooks/useApi';

const { data, loading, error } = usePackages();
const { data: single, loading, error } = usePackage('package_id');
```

**Experiences:**
```typescript
import { useExperiences, useExperience } from '@/hooks/useApi';

const { data, loading, error } = useExperiences();
const { data: single, loading, error } = useExperience('experience_id');
```

**Wellness:**
```typescript
import { useWellness, useSingleWellness } from '@/hooks/useApi';

const { data, loading, error } = useWellness();
const { data: single, loading, error } = useSingleWellness('wellness_id');
```

**Bookings:**
```typescript
import { useBookings, useBooking, useGuestBookings } from '@/hooks/useApi';

const { data, loading, error } = useBookings();
const { data: single, loading, error } = useBooking('booking_id');
const { data: guestBookings, loading, error } = useGuestBookings('guest@email.com');
```

**Home Page:**
```typescript
import { useHomePageData, useStats } from '@/hooks/useApi';

const { data, loading, error } = useHomePageData();
const { data: stats, loading, error } = useStats();
```

### Mutation Hooks (for creating/updating/deleting data)

All mutation hooks return:
- `data`: The response data after mutation
- `loading`: Boolean indicating if mutation is in progress
- `error`: Error object if something went wrong
- `mutate`: Function to execute the mutation
- `reset`: Function to reset the state

#### Available Mutation Hooks

```typescript
import {
  useCreateAccommodation,
  useUpdateAccommodation,
  useDeleteAccommodation,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
  useCreateWellness,
  useUpdateWellness,
  useDeleteWellness,
  useCreateBooking,
  useUpdateBooking,
  useDeleteBooking,
} from '@/hooks/useApiMutation';

// Example: Create accommodation
const { mutate: createAccom, loading, error } = useCreateAccommodation();

await createAccom({
  name: 'New Accommodation',
  description: 'Description',
  price_per_night: 300,
  capacity: 2,
  amenities: ['WiFi'],
  images: ['url'],
  rating: 4.0
});

// Example: Update accommodation
const { mutate: updateAccom } = useUpdateAccommodation();

await updateAccom({
  id: 'accommodation_id',
  data: { name: 'Updated Name' }
});

// Example: Delete accommodation
const { mutate: deleteAccom } = useDeleteAccommodation();

await deleteAccom('accommodation_id');
```

## TypeScript Types

All types are defined in `src/types/api.ts`:

```typescript
import {
  Accommodation,
  Package,
  Experience,
  Wellness,
  Booking,
  HomePageData,
  ResortStats,
  ApiError
} from '@/types/api';
```

## Error Handling

```typescript
const { data, error, loading } = useAccommodations();

if (error) {
  console.error('Error:', error.detail);
}
```

## Example Component

```typescript
import { useAccommodations, usePackages } from '@/hooks/useApi';

export function AccommodationsList() {
  const { data: accommodations, loading, error, refetch } = useAccommodations();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.detail}</div>;

  return (
    <div>
      {accommodations?.map((accom) => (
        <div key={accom.id}>
          <h3>{accom.name}</h3>
          <p>{accom.description}</p>
          <p>Price: ${accom.price_per_night}/night</p>
        </div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## API Endpoints Summary

| Method | Endpoint | Hook |
|--------|----------|------|
| GET | `/home/` | `useHomePageData()` |
| GET | `/home/stats` | `useStats()` |
| GET | `/accommodations/` | `useAccommodations()` |
| GET | `/accommodations/{id}` | `useAccommodation(id)` |
| POST | `/accommodations/` | `useCreateAccommodation()` |
| PUT | `/accommodations/{id}` | `useUpdateAccommodation()` |
| DELETE | `/accommodations/{id}` | `useDeleteAccommodation()` |
| GET | `/packages/` | `usePackages()` |
| GET | `/packages/{id}` | `usePackage(id)` |
| POST | `/packages/` | `useCreatePackage()` |
| PUT | `/packages/{id}` | `useUpdatePackage()` |
| DELETE | `/packages/{id}` | `useDeletePackage()` |
| GET | `/experiences/` | `useExperiences()` |
| GET | `/experiences/{id}` | `useExperience(id)` |
| POST | `/experiences/` | `useCreateExperience()` |
| PUT | `/experiences/{id}` | `useUpdateExperience()` |
| DELETE | `/experiences/{id}` | `useDeleteExperience()` |
| GET | `/wellness/` | `useWellness()` |
| GET | `/wellness/{id}` | `useSingleWellness(id)` |
| POST | `/wellness/` | `useCreateWellness()` |
| PUT | `/wellness/{id}` | `useUpdateWellness()` |
| DELETE | `/wellness/{id}` | `useDeleteWellness()` |
| GET | `/bookings/` | `useBookings()` |
| GET | `/bookings/{id}` | `useBooking(id)` |
| POST | `/bookings/` | `useCreateBooking()` |
| PUT | `/bookings/{id}` | `useUpdateBooking()` |
| DELETE | `/bookings/{id}` | `useDeleteBooking()` |
| GET | `/bookings/guest/{email}` | `useGuestBookings(email)` |

## CORS Configuration

Make sure your FastAPI backend is configured with CORS to allow requests from your Next.js frontend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
