from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase

router = APIRouter(prefix="/analytics", tags=["analytics"])

VALID_EVENTS = ("page_view", "product_view", "reseller_click")


class EventCreate(BaseModel):
    event_type: str
    product_id: Optional[str] = None


@router.post("/event")
def log_event(event: EventCreate, authorization: Optional[str] = Header(None)):
    if event.event_type not in VALID_EVENTS:
        raise HTTPException(status_code=400, detail="Invalid event type")

    user_id = None
    if authorization:
        try:
            token = authorization.replace("Bearer ", "")
            user_id = supabase.auth.get_user(token).user.id
        except Exception:
            user_id = None

    supabase.table("analytics_events").insert({
        "event_type": event.event_type,
        "product_id": event.product_id,
        "user_id": user_id,
    }).execute()
    return {"message": "Event logged"}