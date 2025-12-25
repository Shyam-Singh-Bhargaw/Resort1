# Backend API Requirements - Accommodation Management

## Overview

The frontend is fully configured to integrate with a backend API for managing accommodations (rooms, villas, pavilions, etc.). This document specifies the exact endpoints, request/response formats, and error handling required.

---

## Base URL

```
http://your-backend-domain.com/api
```

All endpoints should be prefixed with `/api` (e.g., `/api/accommodations/`)

---

## Accommodation Endpoints

### 1. GET /accommodations/
**Purpose:** Fetch all accommodations

**Method:** GET

**Parameters:** None (optional pagination: `?page=1&limit=10`)

**Response:** 
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Deluxe Mountain View Villa",
    "description": "A spacious villa with panoramic Himalayan views, featuring a private balcony and modern amenities.",
    "price_per_night": 450,
    "capacity": 4,
    "amenities": [
      "King Bed",
      "Private Balcony",
      "Rain Shower",
      "Mini Bar"
    ],
    "images": [
      "https://your-domain.com/uploads/villa-1.jpg",
      "https://your-domain.com/uploads/villa-2.jpg"
    ],
    "rating": 4.8,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Premium Wellness Suite",
    "description": "Luxury suite with integrated wellness amenities including spa access and yoga studio.",
    "price_per_night": 350,
    "capacity": 2,
    "amenities": [
      "Meditation Corner",
      "Herbal Bath",
      "Spa Access",
      "Yoga Studio"
    ],
    "images": [
      "https://your-domain.com/uploads/suite-1.jpg"
    ],
    "rating": 4.9,
    "created_at": "2024-01-16T14:20:00Z",
    "updated_at": "2024-01-16T14:20:00Z"
  }
]
```

**Error Responses:**
```json
// 500 Server Error
{
  "detail": "Database connection failed"
}
```

---

### 2. GET /accommodations/{id}
**Purpose:** Fetch a single accommodation by ID

**Method:** GET

**Parameters:**
- `id` (path): Accommodation ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Deluxe Mountain View Villa",
  "description": "A spacious villa with panoramic Himalayan views...",
  "price_per_night": 450,
  "capacity": 4,
  "amenities": ["King Bed", "Private Balcony", "Rain Shower"],
  "images": ["https://your-domain.com/uploads/villa-1.jpg"],
  "rating": 4.8,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
```json
// 404 Not Found
{
  "detail": "Accommodation not found"
}
```

---

### 3. POST /accommodations/
**Purpose:** Create a new accommodation

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Deluxe Mountain View Villa",
  "description": "A spacious villa with panoramic Himalayan views...",
  "price_per_night": 450,
  "capacity": 4,
  "amenities": [
    "King Bed",
    "Private Balcony",
    "Rain Shower",
    "24/7 Butler Service"
  ],
  "images": [
    "https://your-domain.com/uploads/villa-1.jpg"
  ],
  "rating": 4.8
}
```

**Response:** (201 Created)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Deluxe Mountain View Villa",
  "description": "A spacious villa with panoramic Himalayan views...",
  "price_per_night": 450,
  "capacity": 4,
  "amenities": ["King Bed", "Private Balcony", "Rain Shower", "24/7 Butler Service"],
  "images": ["https://your-domain.com/uploads/villa-1.jpg"],
  "rating": 4.8,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Validation Rules:**
- `name`: Required, 3-100 characters
- `description`: Required, 20-1000 characters
- `price_per_night`: Required, must be > 0
- `capacity`: Required, integer 1-20
- `amenities`: Optional, array of strings
- `images`: Optional, array of URLs
- `rating`: Optional, float 1-5 (default 4.5)

**Error Responses:**
```json
// 400 Bad Request
{
  "detail": "Invalid price_per_night. Must be greater than 0"
}

// 422 Unprocessable Entity
{
  "detail": "Name is required and must be 3-100 characters"
}
```

---

### 4. PUT /accommodations/{id}
**Purpose:** Update an existing accommodation

**Method:** PUT

**Parameters:**
- `id` (path): Accommodation ID

**Headers:**
```
Content-Type: application/json
```

**Request Body:** (all fields optional, send only what needs updating)
```json
{
  "name": "Updated Villa Name",
  "description": "Updated description...",
  "price_per_night": 500,
  "capacity": 5,
  "amenities": ["Updated", "Amenities"],
  "images": ["https://your-domain.com/uploads/new-image.jpg"],
  "rating": 4.9
}
```

**Response:** (200 OK)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Villa Name",
  "description": "Updated description...",
  "price_per_night": 500,
  "capacity": 5,
  "amenities": ["Updated", "Amenities"],
  "images": ["https://your-domain.com/uploads/new-image.jpg"],
  "rating": 4.9,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:45:00Z"
}
```

**Error Responses:**
```json
// 404 Not Found
{
  "detail": "Accommodation not found"
}

// 400 Bad Request
{
  "detail": "Invalid data provided"
}
```

---

### 5. DELETE /accommodations/{id}
**Purpose:** Delete an accommodation

**Method:** DELETE

**Parameters:**
- `id` (path): Accommodation ID

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Accommodation deleted successfully"
}
```

**Alternative Response:** (204 No Content)
```
(empty body, just status code)
```

**Error Responses:**
```json
// 404 Not Found
{
  "detail": "Accommodation not found"
}

// 409 Conflict
{
  "detail": "Cannot delete accommodation with active bookings"
}
```

---

### 6. POST /uploads/
**Purpose:** Upload accommodation images

**Method:** POST

**Headers:**
```
Content-Type: multipart/form-data
```

**Request Body:**
```
Form Data:
- file: (binary file data)
- accommodation_id: (optional) UUID of accommodation
```

**Response:** (200 OK)
```json
{
  "url": "https://your-domain.com/uploads/accommodation-abc123-def456.jpg",
  "filename": "accommodation-abc123-def456.jpg",
  "size": 245678,
  "mime_type": "image/jpeg"
}
```

**File Validation:**
- Accepted types: JPEG, PNG, WebP, GIF
- Max file size: 10MB
- Recommended dimensions: 1200x800px or larger

**Error Responses:**
```json
// 400 Bad Request
{
  "detail": "File too large. Maximum size is 10MB"
}

// 415 Unsupported Media Type
{
  "detail": "Only image files are accepted"
}
```

---

## Request/Response Patterns

### Pagination (optional)
Some endpoints may support pagination:
```
GET /accommodations/?page=2&limit=10

Response:
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### Error Format (standard)
```json
{
  "detail": "Human-readable error message",
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Status Codes Required
- `200` - OK (successful GET, PUT, DELETE, or POST with no content)
- `201` - Created (successful POST)
- `204` - No Content (successful DELETE with no body)
- `400` - Bad Request (validation error)
- `404` - Not Found (resource doesn't exist)
- `422` - Unprocessable Entity (semantic errors)
- `500` - Internal Server Error

---

## Data Types Reference

### Accommodation Object
```typescript
{
  id: string (UUID);          // Required in response
  name: string;               // Required, 3-100 chars
  description: string;        // Required, 20-1000 chars
  price_per_night: number;    // Required, > 0
  capacity: number;           // Required, integer 1-20
  amenities: string[];        // Optional, array of strings
  images: string[];           // Optional, array of URLs
  rating: number;             // Optional, 1-5 (default 4.5)
  created_at?: string;        // ISO 8601 timestamp
  updated_at?: string;        // ISO 8601 timestamp
}
```

---

## CORS Configuration

The backend must allow CORS requests from:
- `http://localhost:3000` (development)
- `https://your-frontend-domain.com` (production)

**Required CORS Headers:**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## Authentication (Optional)

If authentication is required, the frontend will include:
```
Authorization: Bearer {token}
```

Add this header to all requests if needed.

---

## Frontend Integration Points

| Component | Uses | Endpoint |
|-----------|------|----------|
| ManageAccommodations | Create, Read, Update, Delete | POST, GET, PUT, DELETE /accommodations/ |
| ManageAccommodations | Image Upload | POST /uploads/ |
| RoomsPage | Fetch all | GET /accommodations/ |
| RoomDetailPage | Fetch single | GET /accommodations/{id} |
| BookingPage | Fetch all (for dropdown) | GET /accommodations/ |

---

## Testing the API

### Create Accommodation
```bash
curl -X POST http://localhost:8000/api/accommodations/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Room",
    "description": "Test description for room",
    "price_per_night": 250,
    "capacity": 2,
    "amenities": ["King Bed", "WiFi"],
    "rating": 4.5
  }'
```

### Get All Accommodations
```bash
curl http://localhost:8000/api/accommodations/
```

### Update Accommodation
```bash
curl -X PUT http://localhost:8000/api/accommodations/{id} \
  -H "Content-Type: application/json" \
  -d '{"price_per_night": 350}'
```

### Delete Accommodation
```bash
curl -X DELETE http://localhost:8000/api/accommodations/{id}
```

### Upload Image
```bash
curl -X POST http://localhost:8000/api/uploads/ \
  -F "file=@/path/to/image.jpg"
```

---

## Notes for Backend Team

1. **UUID vs String IDs**: Frontend accepts any string ID format (can use numeric IDs or UUIDs)
2. **Image URLs**: Should be absolute URLs (include full domain)
3. **Timestamps**: Use ISO 8601 format (e.g., "2024-01-15T10:30:00Z")
4. **Amenities Array**: Frontend converts comma-separated strings from form to array before sending
5. **Capacity Validation**: Should be integer, frontend suggests max 20 but backend can allow higher
6. **Rating Range**: 1-5 scale recommended, frontend uses for "Featured" if >= 4.5
7. **Error Messages**: Should be clear and actionable for end users

---

## Related Endpoints (May Already Exist)

These endpoints are used by other features in the application:

- `GET /experiences/` - Wellness programs
- `GET /wellness/` - Wellness services
- `GET /bookings/` - Booking list
- `POST /bookings/` - Create booking
- `POST /guest-profiles/` - Create guest profile

See other API documentation for these endpoints.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Implementation  
**Build:** ✅ Production Ready
