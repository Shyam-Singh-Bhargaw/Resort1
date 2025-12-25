from fastapi import APIRouter, HTTPException, Request
from models import Booking
from bson import ObjectId
from datetime import datetime
from utils import get_db_or_503, serialize_doc
from routes.events import publish_event

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("/")
async def get_all_bookings(request: Request):
    """Get all bookings"""
    db = get_db_or_503(request)
    bookings = await db["bookings"].find().to_list(None)
    return [serialize_doc(b) for b in bookings]


@router.get("/{booking_id}")
async def get_booking(request: Request, booking_id: str):
    """Get a specific booking by ID"""
    db = get_db_or_503(request)
    try:
        booking = await db["bookings"].find_one({"_id": ObjectId(booking_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking id")
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return serialize_doc(booking)


@router.post("/")
async def create_booking(request: Request, booking: Booking):
    """Create a new booking"""
    db = get_db_or_503(request)
    booking_dict = booking.dict()
    booking_dict["created_at"] = datetime.utcnow()
    result = await db["bookings"].insert_one(booking_dict)
    created = await db["bookings"].find_one({"_id": result.inserted_id})
    out = serialize_doc(created)
    # Notify subscribers that a booking was created
    try:
        publish_event({"event": "bookings.created", "booking_id": out.get("id"), "guest_email": out.get("guest_email")})
    except Exception:
        pass
    return out


@router.put("/{booking_id}")
async def update_booking(request: Request, booking_id: str, booking: Booking):
    """Update a booking"""
    db = get_db_or_503(request)
    try:
        result = await db["bookings"].update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": booking.dict()}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking id")
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    updated = await db["bookings"].find_one({"_id": ObjectId(booking_id)})
    return serialize_doc(updated)


@router.delete("/{booking_id}")
async def delete_booking(request: Request, booking_id: str):
    """Delete a booking"""
    db = get_db_or_503(request)
    try:
        result = await db["bookings"].delete_one({"_id": ObjectId(booking_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking id")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted successfully"}


@router.get("/guest/{guest_email}")
async def get_guest_bookings(request: Request, guest_email: str):
    """Get all bookings for a specific guest"""
    db = get_db_or_503(request)
    bookings = await db["bookings"].find({"guest_email": guest_email}).to_list(None)
    return [serialize_doc(b) for b in bookings]
