from fastapi import APIRouter, Depends, HTTPException
from database import supabase
from auth_helper import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

def verify_admin(user=Depends(get_current_user)):
    profile = supabase.table("profiles").select("role").eq("id", user.id).execute()
    if not profile.data or profile.data[0]["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.get("/analytics-summary")
def analytics_summary(user=Depends(verify_admin)):
    events = supabase.table("analytics_events").select("*").execute()
    total_events = len(events.data)
    page_views = len([e for e in events.data if e["event_type"] == "page_view"])
    product_views = len([e for e in events.data if e["event_type"] == "product_view"])
    reseller_clicks = len([e for e in events.data if e["event_type"] == "reseller_click"])
    return {
        "total_events": total_events,
        "page_views": page_views,
        "product_views": product_views,
        "reseller_clicks": reseller_clicks
    }

@router.get("/users")
def get_all_users(user=Depends(verify_admin)):
    response = supabase.table("profiles").select("*").execute()
    return response.data