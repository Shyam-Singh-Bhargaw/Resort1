# Dynamic Homepage & API Integration Guide

## Overview
Your project is now fully configured to use dynamic data from the FastAPI backend for:
- **Homepage** - Featured accommodations, packages, experiences, wellness services
- **All Pages** - Rooms, Wellness, Packages, Experiences pages use API data with fallback to local data

## How It Works

### Homepage (Dynamic)
The homepage now fetches data from the FastAPI backend:
- **`/api/home/`** - Returns featured items (3 each of: accommodations, packages, experiences, wellness)
- **`/api/home/stats`** - Returns resort statistics (total bookings, accommodations, average rating)

### Individual Pages (Dynamic)
- **Rooms Page** - Fetches from `/api/accommodations/`
- **Wellness Page** - Fetches from `/api/wellness/`
- **Experiences Page** - Fetches from `/api/experiences/`
- **Packages Page** - Fetches from `/api/packages/`

### Components Updated
All section components now accept optional API data:
- `RoomsSection` - Accepts `accommodations` prop from API
- `ExperiencesSection` - Accepts `experiences` prop from API
- `SeasonalOfferSection` - Accepts `packages` prop from API
- `TestimonialsSection` - Accepts `wellness` prop from API

## How Data Flows

1. **Fetch** - Components use React hooks to fetch data from API
2. **Display** - Use API data if available, fallback to local static data
3. **Error Handling** - If API fails, components gracefully use fallback data

## API Response Format

### `/api/home/`
```json
{
  "featured_accommodations": [
    {
      "id": "ObjectId",
      "name": "Room Name",
      "description": "...",
      "price_per_night": 450,
      "capacity": 2,
      "amenities": ["WiFi", "AC"],
      "images": ["url"],
      "rating": 4.8
    }
  ],
  "featured_packages": [...],
  "featured_experiences": [...],
  "featured_wellness": [...]
}
```

### Other Collection Endpoints
All collections follow this structure:
```json
[
  {
    "id": "ObjectId",
    "name": "Item Name",
    "description": "...",
    "price": 100,
    "images": ["url"],
    "rating": 4.5,
    // other fields based on type
  }
]
```

## Testing the Integration

1. **Start FastAPI Backend**
   ```bash
   cd D:\R1\backend
   python -m uvicorn api:app --reload --port 8000
   ```

2. **Seed Database**
   ```bash
   python mongo_seed.py
   ```

3. **Run Frontend**
   ```bash
   npm run dev
   ```

4. **Test in Browser**
   - http://localhost:3000 - Homepage with dynamic data
   - http://localhost:3000/rooms - Rooms from API
   - http://localhost:3000/wellness - Wellness from API

## Troubleshooting

**If homepage shows no data:**
1. Check backend is running: http://localhost:8000/health
2. Check MongoDB is connected: Try `python mongo_seed.py`
3. Check browser console for errors (F12)
4. Check API returns data: http://localhost:8000/api/home/

**If fallback data shows:**
- API is likely not running or connection failed
- Check `.env.local` has correct API_URL: `http://localhost:8000/api`
- Check CORS is enabled in FastAPI (already configured)

## File Changes Summary

### Frontend Files Modified
- `src/pages/Index.tsx` - Added API hooks
- `src/components/home/RoomsSection.tsx` - Added props for API data
- `src/components/home/ExperiencesSection.tsx` - Added props for API data
- `src/components/home/SeasonalOfferSection.tsx` - Added props for API data
- `src/components/home/TestimonialsSection.tsx` - Added props for API data

### Backend Files
- `backend/api.py` - Complete FastAPI implementation
- `backend/mongo_seed.py` - MongoDB seed data script

## Next Steps

1. **Customize Data** - Modify `backend/mongo_seed.py` to add your own data
2. **Add More Endpoints** - Extend `backend/api.py` with additional endpoints
3. **Add Authentication** - Implement JWT tokens for booking endpoints
4. **Add Search/Filters** - Query parameters for filtering accommodations, experiences, etc.

## Environment Variables

Frontend (`.env.local`):
```env
VITE_API_URL=http://localhost:8000    # set to backend base URL (no trailing "/api" unless backend serves under that prefix)
NEXT_PUBLIC_API_URL=http://localhost:8000
REACT_APP_API_URL=http://localhost:8000
```

Backend (`.env`):
```env
# IMPORTANT: Do NOT commit real credentials into the frontend repo.
# Store actual MongoDB connection strings only in the backend repository's `.env`.
# Use a placeholder here for documentation purposes.
MONGODB_URL=mongodb+srv://<username>:<password>@adivasi-dev.0kt3ba1.mongodb.net/
DATABASE_NAME=resort_booking
ENVIRONMENT=development
```
