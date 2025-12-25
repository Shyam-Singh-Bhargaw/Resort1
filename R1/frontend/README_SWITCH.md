Switch frontend to use live backend

For local development (Vite), create `.env.development` in the frontend project root (already created in repo root):

VITE_API_URL=http://localhost:8000

Then start the frontend dev server:

# from project root d:\R1
npm install
npm run dev

This makes the frontend API client send requests to `http://localhost:8000/api/...` so pages like `/programs/wellness` and `/programs/activities` load live DB data.
