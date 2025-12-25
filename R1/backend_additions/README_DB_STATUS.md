Integration notes for backend team: add protected /internal/db-status endpoint

Place this snippet into your FastAPI app (for example, in a routes file and include it in the app router). It requires an env var `INTERNAL_API_KEY`.

File: add to backend repo (d:\resort_backend) e.g. `routes/internal_status.py`

--- Python snippet ---
from fastapi import APIRouter, Header, HTTPException, Request
import os
from pydantic import BaseModel
import asyncio

router = APIRouter(prefix="/internal", tags=["internal"])

class DBStatus(BaseModel):
    status: str
    db_connected: bool
    database: str | None = None

INTERNAL_KEY = os.environ.get("INTERNAL_API_KEY")

@router.get("/db-status", response_model=DBStatus)
async def db_status(request: Request, x_internal_key: str | None = Header(None)):
    # API key protection (optional)
    if INTERNAL_KEY and x_internal_key != INTERNAL_KEY:
        raise HTTPException(status_code=403, detail="forbidden")

    db_name = os.environ.get("DATABASE_NAME")
    client = getattr(request.app.state, "db_client", None)
    if client is None:
        raise HTTPException(status_code=503, detail={"error":"db_unavailable","message":"db client missing"})

    # Try pinging the MongoDB server. Support both async motor client and sync pymongo client.
    try:
        cmd_result = client.admin.command("ping")
        if asyncio.iscoroutine(cmd_result):
            await cmd_result
        else:
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, lambda: client.admin.command("ping"))
    except Exception:
        raise HTTPException(status_code=503, detail={"error":"db_unavailable"})

    return {"status":"ok","db_connected":True,"database":db_name}

--- End snippet ---

Deployment notes:
- Add `INTERNAL_API_KEY` to your `.env` or environment on the server.
- Place the file at `routes/internal_status.py` and import in `main.py`:

        from routes import internal_status
        app.include_router(internal_status.router)

- Protect the endpoint in production by using a strong `INTERNAL_API_KEY` and restricting origins at network level if possible.

How frontend/CI should call it:
- Use header `X-Internal-Key: <value>`
- Example curl (PowerShell safe):

    $k = "secret-key"
    curl.exe -H "X-Internal-Key: $k" "http://localhost:8000/internal/db-status" --silent | jq

If you'd like, I can adapt the snippet further to your exact DB client configuration.
