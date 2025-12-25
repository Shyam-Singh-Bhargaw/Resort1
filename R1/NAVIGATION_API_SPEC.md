# Backend Navigation API Specification

## Overview

The frontend is fully configured to integrate with a backend API for dynamic navigation management. This document specifies the exact endpoints, request/response formats, and error handling required.

---

## Base URL

```
http://your-backend-domain.com/api
```

All endpoints should be prefixed with `/api` (e.g., `/api/navigation/`)

---

## Navigation Endpoints

### 1. GET /navigation/
**Purpose:** Fetch all navigation items (in order)

**Method:** GET

**Parameters:** None (optional pagination: `?page=1&limit=50`)

**Response:** (200 OK)
```json
[
  {
    "id": "nav-home",
    "label": "Home",
    "url": "/",
    "type": "link",
    "order": 1,
    "is_visible": true,
    "target": "_self",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "nav-accommodations",
    "label": "Accommodations",
    "url": "/rooms",
    "type": "link",
    "order": 2,
    "is_visible": true,
    "target": "_self",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "nav-wellness",
    "label": "Wellness",
    "url": "/wellness",
    "type": "link",
    "order": 3,
    "is_visible": true,
    "target": "_self",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "nav-experiences",
    "label": "Experiences",
    "url": "/experiences",
    "type": "link",
    "order": 4,
    "is_visible": true,
    "target": "_self",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "nav-dining",
    "label": "Menu & Dining",
    "url": "/dining",
    "type": "link",
    "order": 5,
    "is_visible": true,
    "target": "_self",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "nav-contact",
    "label": "Contact",
    "url": "/contact",
    "type": "link",
    "order": 6,
    "is_visible": true,
    "target": "_self",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
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

### 2. POST /navigation/
**Purpose:** Create a new navigation item

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "label": "Gallery",
  "url": "/gallery",
  "type": "button",
  "order": 7,
  "is_visible": true,
  "target": "_self"
}
```

**Response:** (201 Created)
```json
{
  "id": "nav-gallery",
  "label": "Gallery",
  "url": "/gallery",
  "type": "button",
  "order": 7,
  "is_visible": true,
  "target": "_self",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Validation Rules:**
- `label`: Required, 1-100 characters, no special chars
- `url`: Required, valid URL (internal `/path` or external `https://...`)
- `type`: Required, must be "link" or "button"
- `order`: Optional, integer (auto-increment if not provided)
- `is_visible`: Optional, boolean (default: true)
- `target`: Optional, "_self" or "_blank" (default: "_self")

**Error Responses:**
```json
// 400 Bad Request
{
  "detail": "Label is required and must be 1-100 characters"
}

// 422 Unprocessable Entity
{
  "detail": "Invalid URL format"
}
```

---

### 3. PUT /navigation/{id}
**Purpose:** Update an existing navigation item

**Method:** PUT

**Parameters:**
- `id` (path): Navigation item ID

**Headers:**
```
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "label": "Updated Label",
  "url": "/updated-url",
  "type": "link",
  "order": 5,
  "is_visible": true,
  "target": "_blank"
}
```

**Response:** (200 OK)
```json
{
  "id": "nav-gallery",
  "label": "Updated Label",
  "url": "/updated-url",
  "type": "link",
  "order": 5,
  "is_visible": true,
  "target": "_blank",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

**Error Responses:**
```json
// 404 Not Found
{
  "detail": "Navigation item not found"
}

// 400 Bad Request
{
  "detail": "Invalid data provided"
}
```

---

### 4. DELETE /navigation/{id}
**Purpose:** Delete a navigation item

**Method:** DELETE

**Parameters:**
- `id` (path): Navigation item ID

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Navigation item deleted successfully"
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
  "detail": "Navigation item not found"
}

// 409 Conflict
{
  "detail": "Cannot delete protected navigation item (e.g., 'Home')"
}
```

---

### 5. POST /navigation/reorder
**Purpose:** Reorder navigation items (for drag & drop)

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    { "id": "nav-home", "order": 1 },
    { "id": "nav-accommodations", "order": 2 },
    { "id": "nav-experiences", "order": 3 },
    { "id": "nav-wellness", "order": 4 },
    { "id": "nav-dining", "order": 5 },
    { "id": "nav-contact", "order": 6 }
  ]
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Navigation items reordered successfully",
  "items": [
    { "id": "nav-home", "order": 1 },
    { "id": "nav-accommodations", "order": 2 },
    { "id": "nav-experiences", "order": 3 },
    { "id": "nav-wellness", "order": 4 },
    { "id": "nav-dining", "order": 5 },
    { "id": "nav-contact", "order": 6 }
  ]
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "detail": "Missing or invalid items array"
}

// 409 Conflict
{
  "detail": "Some navigation items not found"
}
```

---

## Data Model

### Navigation Item Object
```typescript
{
  id: string;              // Unique identifier (uuid or custom)
  label: string;           // Display text (1-100 chars)
  url: string;             // Destination URL (/path or https://...)
  type: "link" | "button"; // Display type
  order: number;           // Sort order (1, 2, 3, ...)
  is_visible: boolean;     // Show/hide toggle
  target: "_self" | "_blank"; // Link target
  created_at?: string;     // ISO 8601 timestamp
  updated_at?: string;     // ISO 8601 timestamp
}
```

---

## Database Schema (Recommended)

```sql
CREATE TABLE navigation (
  id VARCHAR(36) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  type ENUM('link', 'button') NOT NULL,
  order INT NOT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  target VARCHAR(20) DEFAULT '_self',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_label (label),
  INDEX idx_order (order),
  INDEX idx_visible (is_visible)
);

-- Default navigation items
INSERT INTO navigation (id, label, url, type, order, is_visible, target) VALUES
('nav-home', 'Home', '/', 'link', 1, TRUE, '_self'),
('nav-accommodations', 'Accommodations', '/rooms', 'link', 2, TRUE, '_self'),
('nav-wellness', 'Wellness', '/wellness', 'link', 3, TRUE, '_self'),
('nav-experiences', 'Experiences', '/experiences', 'link', 4, TRUE, '_self'),
('nav-dining', 'Menu & Dining', '/dining', 'link', 5, TRUE, '_self'),
('nav-contact', 'Contact', '/contact', 'link', 6, TRUE, '_self');
```

---

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | GET successful, PUT successful, DELETE successful |
| 201 | Created | POST successful |
| 204 | No Content | DELETE successful (alternative) |
| 400 | Bad Request | Invalid input, missing fields |
| 404 | Not Found | Navigation item doesn't exist |
| 409 | Conflict | Cannot delete protected item, duplicate label |
| 422 | Unprocessable Entity | Validation error (semantic issue) |
| 500 | Server Error | Database error, server crash |

---

## Request/Response Patterns

### Pagination (Optional)
```
GET /navigation/?page=2&limit=20

Response:
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Error Format (Standard)
```json
{
  "detail": "Human-readable error message",
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Authentication (If Required)

If authentication is required, frontend will include:

```
Authorization: Bearer {admin_token}
```

**Add this header to all requests** if using token-based auth.

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

## Testing the API

### Create Navigation Item
```bash
curl -X POST http://localhost:8000/api/navigation/ \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Gallery",
    "url": "/gallery",
    "type": "button",
    "order": 7,
    "is_visible": true,
    "target": "_self"
  }'
```

### Get All Navigation Items
```bash
curl http://localhost:8000/api/navigation/
```

### Update Navigation Item
```bash
curl -X PUT http://localhost:8000/api/navigation/nav-gallery \
  -H "Content-Type: application/json" \
  -d '{"label": "Updated Gallery"}'
```

### Delete Navigation Item
```bash
curl -X DELETE http://localhost:8000/api/navigation/nav-gallery
```

### Reorder Items
```bash
curl -X POST http://localhost:8000/api/navigation/reorder \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "nav-home", "order": 1},
      {"id": "nav-gallery", "order": 2},
      {"id": "nav-contact", "order": 3}
    ]
  }'
```

---

## Frontend Integration Points

| Component | File | Uses | Endpoint |
|-----------|------|------|----------|
| Header (Navigation) | src/components/layout/Header.tsx | useNavigation() | GET /navigation/ |
| Admin Dashboard | src/pages/AdminPage.tsx | ManageNavigation | All CRUD endpoints |
| ManageNavigation | src/components/admin/ManageNavigation.tsx | All hooks | All CRUD + reorder |

---

## Caching Strategy

### Frontend Caching
- Navigation fetched **once per page load**
- Results cached in React state
- Hard refresh (Ctrl+F5) forces re-fetch

### Backend Caching (Recommended)
- Cache for **30 seconds** (TTL 30s)
- Invalidate on CREATE, PUT, DELETE
- Use Redis or similar for optimal performance

### Cache Headers
```
Cache-Control: public, max-age=30, s-maxage=30
ETag: "{hash-of-items}"
```

---

## Default Navigation Items

Your system should initialize with these default navigation items:

```json
[
  {
    "id": "nav-home",
    "label": "Home",
    "url": "/",
    "type": "link",
    "order": 1,
    "is_visible": true,
    "target": "_self"
  },
  {
    "id": "nav-accommodations",
    "label": "Accommodations",
    "url": "/rooms",
    "type": "link",
    "order": 2,
    "is_visible": true,
    "target": "_self"
  },
  {
    "id": "nav-wellness",
    "label": "Wellness",
    "url": "/wellness",
    "type": "link",
    "order": 3,
    "is_visible": true,
    "target": "_self"
  },
  {
    "id": "nav-experiences",
    "label": "Experiences",
    "url": "/experiences",
    "type": "link",
    "order": 4,
    "is_visible": true,
    "target": "_self"
  },
  {
    "id": "nav-dining",
    "label": "Menu & Dining",
    "url": "/dining",
    "type": "link",
    "order": 5,
    "is_visible": true,
    "target": "_self"
  },
  {
    "id": "nav-contact",
    "label": "Contact",
    "url": "/contact",
    "type": "link",
    "order": 6,
    "is_visible": true,
    "target": "_self"
  }
]
```

---

## Validation Rules

### Label
- ✅ Required
- ✅ 1-100 characters
- ✅ Alphanumeric, spaces, hyphens, ampersands allowed
- ❌ No special characters (except hyphen, ampersand)
- ❌ Not empty or whitespace-only

### URL
- ✅ Required
- ✅ Internal: `/path-name` or `/#anchor`
- ✅ External: `https://example.com/path`
- ✅ Relative: `../page`
- ❌ Must be valid URL format

### Type
- ✅ Must be "link" or "button"
- ❌ Cannot be other values

### Order
- ✅ Positive integer (0 or greater)
- ✅ Can have duplicates (backend can normalize)
- ✅ Auto-increment if not provided

### Visibility
- ✅ Boolean (true/false)
- ✅ Default: true if not provided

### Target
- ✅ "_self" (same window) or "_blank" (new window)
- ✅ Default: "_self" if not provided

---

## Notes for Backend Team

1. **Default Items**: Create the 6 default navigation items on first-time setup
2. **Order Field**: Frontend assumes sorted by order (ascending)
3. **ID Format**: Can use UUID, slug, or custom IDs
4. **Timestamps**: Include created_at/updated_at for audit trail
5. **Soft Delete**: Consider soft-delete (is_deleted flag) instead of hard delete
6. **Fallback**: Frontend has fallback navigation if API fails
7. **Performance**: Return items sorted by order field from database
8. **Protected Items**: Consider protecting "Home" from deletion

---

## Related Endpoints

These endpoints should also exist:

- `GET /accommodations/` - Room/accommodation listing
- `GET /experiences/` - Wellness experiences
- `GET /wellness/` - Wellness programs
- `POST /bookings/` - Create booking

See other documentation for these endpoints.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Implementation  
**Build:** ✅ 1702 modules, Production Ready
