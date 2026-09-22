from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from database import supabase

router = APIRouter(prefix="/analytics", tags=["analytics"])

class EventCreate(BaseModel):
    event_type: str  # "page_view", "product_view", or "reseller_click"
    product_id: Optional[str] = None
    user_id: Optional[str] = None

@router.post("/event")
def log_event(event: EventCreate):
    response = supabase.table("analytics_events").insert(event.model_dump()).execute()
    return {"message": "Event logged"}