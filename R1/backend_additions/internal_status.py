"""Internal DB status router for the canonical backend.

Drop this file into your backend repo under `routes/` (e.g. `routes/internal_status.py`) and include it in `main.py`:

    from routes import internal_status
    app.include_router(internal_status.router)

Requires env var `INTERNAL_API_KEY` (optional). The endpoint is:
GET /internal/db-status
Header: X-Internal-Key: <key>

This implementation attempts to support both motor (async) and pymongo (sync) MongoDB clients.
"""
from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel
import os
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
            # sync pymongo call -> run in threadpool to avoid blocking
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, lambda: client.admin.command("ping"))
    except Exception:
        raise HTTPException(status_code=503, detail={"error":"db_unavailable"})

    return {"status":"ok","db_connected":True,"database":db_name}
