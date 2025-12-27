from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from contextlib import asynccontextmanager
import logging
from dotenv import load_dotenv
import os
from datetime import datetime

# Ensure .env is loaded before importing route modules so route-level
# module-scope env reads (e.g. INTERNAL_API_KEY) pick up values.
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
import database
from database import connect_db, close_db, get_db
from routes import accommodations, packages, experiences, wellness, bookings, home, menu_items, gallery, api_compat, internal_status, navigation, api_site
from routes import events, extra_beds, programs
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
import json
import os
from dotenv import load_dotenv

# Load .env into the process environment so runtime env vars (e.g. API_KEY) are available
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    # attach db handle to app.state for routes to access
    try:
        # Attach live references from the database module so they reflect
        # values set by connect_db() at runtime.
        app.state.db = database.get_db()
        app.state.db_client = getattr(database, "client", None)
        # Log DB attachment and attempt a quick ping to surface connectivity issues early
        logger = logging.getLogger("resort_backend")
        logger.info("App startup: DB attached to app.state (db set: %s, client set: %s)", app.state.db is not None, app.state.db_client is not None)
        try:
            client = getattr(app.state, "db_client", None)
            if client is not None:
                # support async motor client ping
                cmd = client.admin.command("ping")
                if hasattr(cmd, "__await__"):
                    await cmd
                else:
                    # sync pymongo client
                    client.admin.command("ping")
                logger.info("App startup: DB ping successful")
                # Cleanup stale locks left from previous runs (best-effort)
                try:
                    db_handle = getattr(app.state, "db", None)
                    if db_handle is not None:
                        # Remove expired locks where expire_at < now
                        await db_handle.locks.delete_many({"expire_at": {"$lt": datetime.utcnow()}})
                        logger.info("Cleaned up stale locks on startup")
                except Exception:
                    logger.exception("Failed to cleanup stale locks on startup")
        except Exception:
            logger.exception("App startup: DB ping failed")
        # Fallback: if database not attached, try to create a client directly (helps local dev when connect_db didn't set globals)
        if getattr(app.state, "db", None) is None or getattr(app.state, "db_client", None) is None:
            try:
                import motor.motor_asyncio
                from os import getenv
                MONGODB_URL = getenv("MONGODB_URL")
                from database import DATABASE_NAME
                if MONGODB_URL:
                    logger.info("Attempting fallback DB client creation using MONGODB_URL from environment")
                    fb_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
                    try:
                        cmd = fb_client.admin.command("ping")
                        if hasattr(cmd, "__await__"):
                            await cmd
                        else:
                            fb_client.admin.command("ping")
                        app.state.db_client = fb_client
                        app.state.db = fb_client[DATABASE_NAME]
                        logger.info("Fallback DB client created and ping successful")
                    except Exception:
                        logger.exception("Fallback DB ping failed")
            except Exception:
                logger.exception("Fallback DB client creation failed")
    except Exception:
        logging.getLogger("resort_backend").exception("Error attaching DB to app.state")
    yield
    # Shutdown
    await close_db()

app = FastAPI(
    title="Resort Backend API",
    description="FastAPI backend for resort booking system",
    version="1.0.0",
    lifespan=lifespan
)

# Configure rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Allow all origins in development for convenience
        "*",
    ],
    # Do not allow credentials when using wildcard origin
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(home.router)
app.include_router(accommodations.router)
app.include_router(packages.router)
app.include_router(experiences.router)
app.include_router(wellness.router)
app.include_router(bookings.router)
app.include_router(api_compat.router)
app.include_router(api_site.router)
app.include_router(menu_items.router)
app.include_router(gallery.router)
app.include_router(navigation.router)
# Also include navigation router under /api for backwards compatibility with some clients
app.include_router(navigation.router, prefix="/api")
# Include gallery under /api for compatibility with clients expecting /api/gallery
app.include_router(gallery.router, prefix="/api")
app.include_router(internal_status.router)
app.include_router(events.router)
app.include_router(extra_beds.router)
# Expose extra beds under /api for frontend compatibility
app.include_router(extra_beds.router, prefix="/api")
app.include_router(programs.router)
# Authentication routes
from routes import auth
app.include_router(auth.router)
from routes import guests
app.include_router(guests.router)
# Mount navigation router under /api for frontend compatibility (some clients expect /api/navigation)
app.include_router(navigation.router, prefix="/api")

# Serve uploaded files from /uploads
uploads_path = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Resort Backend API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/site/site-config.js")
async def site_config_js_root():
    # Provide a tiny JS snippet used by the frontend dev toolbar
    config = {"apiBase": "/api", "siteName": "Resort"}
    body = "window.__SITE_CONFIG__ = " + json.dumps(config) + ";"
    return Response(content=body, media_type="application/javascript")


# Compatibility route: some frontends request the site-config under /api
@app.get("/api/site/site-config.js")
async def site_config_js_api():
    config = {"apiBase": "/api", "siteName": "Resort"}
    body = "window.__SITE_CONFIG__ = " + json.dumps(config) + ";"
    return Response(content=body, media_type="application/javascript")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/debug/routes")
async def debug_routes():
    # Return list of registered routes (path + methods) for debugging
    out = []
    for r in app.routes:
        methods = []
        try:
            methods = list(getattr(r, "methods", []) or [])
        except Exception:
            pass
        out.append({"path": getattr(r, "path", str(r)), "methods": methods})
    return out

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
