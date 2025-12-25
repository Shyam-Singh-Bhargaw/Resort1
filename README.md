# Resort1

This repository contains two projects copied from local workspace and sanitized for public sharing:

- `resort_backend` — FastAPI backend providing the Resort API.
- `R1` — Frontend application (React / Vite / TypeScript).

Important: this copy was sanitized before pushing. The file `resort_backend/.env` was removed because it contained real credentials. Use `resort_backend/.env.example` as a template and DO NOT commit real secrets.

Quick start — backend

1. Create a Python virtual environment and activate it.
2. Install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r resort_backend\requirements.txt
```

3. Create `.env` from `.env.example` and set `MONGODB_URL` and other vars.
4. Run the app:

```powershell
cd resort_backend
uvicorn main:app --reload
```

Quick start — frontend

```powershell
cd R1
npm install
npm run dev
```

Security notes

- `resort_backend/.env` was removed from the public copy. If you used those credentials elsewhere, rotate them now.
- Add any local-only files to `.gitignore` and do not commit secrets. Consider using GitHub Secrets for CI and environment variables for deployments.

If you want, I can:
- Remove the temporary folder `D:\Resort1_tmp` from your machine, or
- Add a short contribution/usage guide and CI ignores before removing the staging folder.
