
```powershell
Set-Location 'D:\Resort1_tmp'; $readme = @'
# Resort1 — Developer Quickstart & Runbook

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/) [![Node](https://img.shields.io/badge/Node-18%2B-green)](https://nodejs.org/) [![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-yellow)](https://fastapi.tiangolo.com/) [![React](https://img.shields.io/badge/React-18%2B-cyan)](https://react.dev/) [![License: MIT](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

This repository contains a sanitized export of two interconnected projects from a local workspace: a robust backend API and a modern frontend application. This README serves as a comprehensive runbook, guiding developers through setup, development, testing, and secure deployment. Follow these steps precisely to get up and running quickly.

## Projects Overview

- **`resort_backend`**  
  A FastAPI-based Python backend implementing the public RESTful API, database interactions (MongoDB), seeding scripts, and comprehensive unit tests. Handles authentication, data persistence, and business logic.

- **`R1`**  
  A React application built with Vite and TypeScript, featuring a responsive UI, admin dashboards, and integration with the backend API. Includes unit tests (Jest) and end-to-end (E2E) tests (Playwright).

## Core Principles

- **Security First**: Never commit secrets (e.g., API keys, database credentials). This repo intentionally omits sensitive files like `resort_backend/.env`. Always use environment variables or secure vaults.
- **Reproducibility**: All steps are scripted for consistency across environments (local, CI/CD).
- **Modularity**: Backend and frontend are independent but interoperable—develop them in parallel.

## Quickstart Overview

1. **Prepare Your Machine**: Install prerequisites.
2. **Configure Secrets**: Set up local `.env` files (never commit them).
3. **Install Dependencies**: For backend and frontend.
4. **Seed Data** (Optional): Populate the database for realistic testing.
5. **Run Locally**: Start both services.
6. **Test Everything**: Unit and E2E tests.
7. **Secure & Deploy**: Checklist for publishing.

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Python** | 3.10+ (3.11 recommended) | For backend; use `pyenv` or similar for version management. |
| **Node.js & Package Manager** | Node 18+; npm, pnpm, or yarn | For frontend; npm is used in examples. |
| **MongoDB** | 5.0+ | Local instance or MongoDB Atlas; provide a connection URL. |
| **Git** | 2.30+ | For cloning and managing the repo. |
| **PowerShell** (or Bash/Zsh) | Latest | Examples use PowerShell; adapt for your shell. |

Install via official sources:
- Python: [python.org](https://www.python.org/downloads/)
- Node: [nodejs.org](https://nodejs.org/en/download/)
- MongoDB: [mongodb.com](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/atlas)

## Backend Setup & Run (PowerShell)

Navigate to the backend directory and follow these steps:

1. **Create & Activate Virtual Environment**:
   ```powershell
   cd resort_backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. **Install Dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

3. **Configure Environment**:
   Copy the example file and edit with your values (e.g., `MONGODB_URL`, `DATABASE_NAME`, `API_KEY`):
   ```powershell
   Copy-Item .env.example .env
   notepad .env  # Or use your preferred editor
   ```
   - **Critical**: Add `.env` to `.gitignore` before committing.

4. **Seed Database** (Recommended for Development):
   ```powershell
   python mongo_seed.py
   ```
   - Alternatively, run individual scripts in `resort_backend/scripts/`.

5. **Start the Server**:
   ```powershell
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Verify**:
   - Open [http://localhost:8000/docs](http://localhost:8000/docs) for interactive OpenAPI docs.
   - Test endpoints (e.g., `/health`, `/users`).

## Frontend Setup & Run (PowerShell)

1. **Install Dependencies & Configure API**:
   ```powershell
   cd ../R1  # From backend dir, or cd R1 directly
   npm install
   ```
   Create `.env.local` (add to `.gitignore`):
   ```powershell
   notepad .env.local
   ```
   Add: `VITE_API_URL=http://localhost:8000`

2. **Start Development Server**:
   ```powershell
   npm run dev
   ```
   - App runs at [http://localhost:5173](http://localhost:5173) (Vite default).

3. **Build for Production**:
   ```powershell
   npm run build
   npm run preview  # Serves the built app locally
   ```

## Testing Locally

Run tests in isolation or as part of your workflow (e.g., pre-commit hooks).

### Backend (Pytest)
```powershell
cd resort_backend
.\.venv\Scripts\Activate.ps1
pytest -q -v  # Quiet mode with verbose output
```
- Coverage: `pytest --cov` (if configured).

### Frontend (Jest & Playwright)
```powershell
cd R1
npm test  # Unit tests (Jest)
npm run test:e2e  # E2E tests (Playwright)
```
- Run specific tests: `npm test -- --testNamePattern="MyTest"`.
- Headless mode for CI: Default in E2E.

| Test Type | Command | Coverage |
|-----------|---------|----------|
| Backend Units | `pytest` | 80%+ target |
| Frontend Units | `npm test` | Jest reports |
| E2E | `npm run test:e2e` | Browser automation |

## Security & Publishing Checklist

Before pushing changes, merging PRs, or deploying:

- [ ] Confirm no `.env` files are committed (`git status` and secret scanners).
- [ ] Rotate any exposed credentials (e.g., via MongoDB Atlas dashboard).
- [ ] Enable secret scanning:
  - GitHub: Advanced Security or integrate [truffleHog](https://github.com/trufflesecurity/trufflehog) / [Gitleaks](https://github.com/gitleaks/gitleaks).
- [ ] Store secrets securely:
  - Local: Environment variables.
  - CI/CD: GitHub Secrets, Azure Key Vault, or AWS Secrets Manager.
- [ ] Protect data access:
  - MongoDB: IP allowlisting, strong auth, encryption at rest.
  - API: Rate limiting, JWT validation (built into FastAPI).

### If Secrets Were Accidentally Committed
1. **Immediate Action**: Revoke/rotate credentials.
2. **Clean History**: Use `git filter-repo` or BFG Repo-Cleaner:
   ```bash
   git filter-repo --path .env --invert-paths
   git push --force --all
   ```
3. **Notify**: Alert stakeholders and monitor for breaches.

## Recommended Enhancements

- **CONTRIBUTING.md**: Define branching strategy (e.g., Git Flow), PR templates, and code style (ESLint, Black).
- **CI/CD**: GitHub Actions workflow for tests, linting, and secret scans on PRs.
- **Containerization**: Add `Dockerfile` for backend and `docker-compose.yml` for full-stack local dev.
- **Monitoring**: Integrate Sentry for errors, Prometheus for metrics.

## Project Structure

```
Resort1/
├── resort_backend/
│   ├── main.py              # FastAPI entrypoint
│   ├── routes/              # API endpoints
│   ├── scripts/             # Seeding & migrations
│   ├── tests/               # Pytest suite
│   ├── requirements.txt
│   └── .env.example
├── R1/
│   ├── src/
│   │   └── lib/             # API helpers & client
│   ├── tests/               # Jest & Playwright
│   ├── vite.config.ts
│   └── package.json
├── README.md
└── .gitignore
```

## Troubleshooting

- **Backend Fails to Start**: Check MongoDB connection; verify `.env` vars.
- **CORS Issues**: Frontend can''t reach backend? Ensure `VITE_API_URL` matches server host/port.
- **Tests Fail**: Activate venv; install missing deps (`pip install -e .` if editable).
- **Port Conflicts**: Change `--port` in uvicorn or Vite config.

## Contributing

Fork the repo, create a feature branch (`git checkout -b feature/my-change`), commit changes, and open a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for details (coming soon).

## License

MIT License. See [LICENSE](LICENSE) for details.

## Support

- Issues: [Open a GitHub Issue](https://github.com/yourusername/Resort1/issues).
- Questions: Ping the maintainer or join the discussion.

---


Built with ❤️ for seamless development. Happy coding! 🚀
'@; Set-Content -Path README.md -Value $readme -Encoding UTF8; git add README.md; git commit -m "Update README: enhanced professional runbook"; git push origin main
```
