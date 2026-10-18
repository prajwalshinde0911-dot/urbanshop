from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from collections import Counter
from database import supabase
from auth_helper import verify_admin
from activity import log_activity

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics-summary")
def analytics_summary(admin=Depends(verify_admin)):
    events = supabase.table("analytics_events").select("*").execute().data
    products = supabase.table("products").select("id,title,category_id,location").execute().data
    categories = supabase.table("categories").select("id,name").execute().data
    profiles = supabase.table("profiles").select("created_at").execute().data

    product_map = {p["id"]: p for p in products}
    category_map = {c["id"]: c["name"] for c in categories}

    def count(event_type):
        return len([e for e in events if e["event_type"] == event_type])

    views_by_day = Counter()
    product_views = Counter()
    product_clicks = Counter()
    category_interest = Counter()
    location_interest = Counter()

    for e in events:
        if e["event_type"] in ("page_view", "product_view"):
            views_by_day[e["created_at"][:10]] += 1
        pid = e.get("product_id")
        if not pid or pid not in product_map:
            continue
        if e["event_type"] == "product_view":
            product_views[pid] += 1
        elif e["event_type"] == "reseller_click":
            product_clicks[pid] += 1
        p = product_map[pid]
        if p.get("category_id") in category_map:
            category_interest[category_map[p["category_id"]]] += 1
        if p.get("location"):
            location_interest[p["location"]] += 1

    signups_by_day = Counter(p["created_at"][:10] for p in profiles if p.get("created_at"))

    return {
        "total_events": len(events),
        "page_views": count("page_view"),
        "product_views": count("product_view"),
        "reseller_clicks": count("reseller_click"),
        "total_users": len(profiles),
        "views_over_time": [{"date": d, "count": c} for d, c in sorted(views_by_day.items())],
        "signups_over_time": [{"date": d, "count": c} for d, c in sorted(signups_by_day.items())],
        "most_viewed_products": [
            {"title": product_map[pid]["title"], "views": c}
            for pid, c in product_views.most_common(5)
        ],
        "clicks_per_product": sorted(
            [{"title": p["title"], "clicks": product_clicks.get(p["id"], 0)} for p in products],
            key=lambda x: x["clicks"],
            reverse=True,
        ),
        "top_categories": [{"name": n, "count": c} for n, c in category_interest.most_common(5)],
        "top_locations": [{"name": n, "count": c} for n, c in location_interest.most_common(5)],
    }


@router.get("/products")
def all_products(admin=Depends(verify_admin)):
    return supabase.table("products").select("*").order("created_at", desc=True).execute().data


@router.get("/users")
def get_all_users(admin=Depends(verify_admin)):
    return supabase.table("profiles").select("*").order("created_at", desc=True).execute().data


class RoleUpdate(BaseModel):
    role: str


@router.put("/users/{user_id}/role")
def update_role(user_id: str, body: RoleUpdate, admin=Depends(verify_admin)):
    if body.role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    if user_id == admin.id and body.role != "admin":
        raise HTTPException(status_code=400, detail="You cannot remove your own admin role")
    if body.role == "admin":
        admins = supabase.table("profiles").select("id").eq("role", "admin").execute().data
        if len(admins) >= 3 and user_id not in [a["id"] for a in admins]:
            raise HTTPException(status_code=400, detail="Maximum of 3 admin accounts allowed")
    response = supabase.table("profiles").update({"role": body.role}).eq("id", user_id).execute()
    log_activity(admin.id, "changed role", "user", user_id, body.role)
    return response.data


@router.get("/activity-log")
def activity_log(admin=Depends(verify_admin)):
    rows = supabase.table("activity_log").select("*").order("created_at", desc=True).limit(100).execute().data
    profiles = supabase.table("profiles").select("id,full_name").execute().data
    names = {p["id"]: p["full_name"] for p in profiles}
    for r in rows:
        r["admin_name"] = names.get(r["admin_id"]) or "Admin"
    return rows