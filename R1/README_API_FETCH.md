# Frontend → Backend data policy

This repository's frontend must fetch all runtime data from the backend API (no local dummy JSON).

Key points

- Set `VITE_API_URL` (or `NEXT_PUBLIC_API_URL`) to your backend base URL before running the frontend.
  - Example (local dev):
    ```bash
    export VITE_API_URL=http://localhost:8000
    npm run dev
    ```
  - On Windows PowerShell:
    ```powershell
    $env:VITE_API_URL = 'http://localhost:8000'
    npm run dev
    ```
- The frontend's API client (`src/lib/api-client.ts`) prefers `VITE_API_URL` / `NEXT_PUBLIC_API_URL`.
  If those are not set it falls back to `/api` to support proxy setups. When running on non-localhost
  hosts the client prints a prominent console warning to avoid accidentally using mock data.

Removing local mocks

- Ensure there are no `mocks/db.json` or other sample JSON files being served by your dev server.
  In this workspace we've removed the `resort_backend/frontend/mocks` files to avoid accidental consumption
  of dummy data.

How to verify

1. Start backend and confirm it serves `/api/cottages`.
2. Start frontend with `VITE_API_URL` set and open the app. In browser devtools, confirm network calls go to `http://localhost:8000/api/...`.
3. If the frontend console prints a warning about `VITE_API_URL` not set, set the environment variable and restart.

If you want me to make the frontend fail fast (throw an error) when no explicit API URL is configured, I can change the client to do that; tell me whether you prefer a hard-fail or the current warning behavior.
