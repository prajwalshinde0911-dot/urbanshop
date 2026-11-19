from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from database import supabase
from auth_helper import verify_admin
from activity import log_activity

router = APIRouter(prefix="/banners", tags=["banners"])


class BannerIn(BaseModel):
    title: str
    image_url: str
    link: Optional[str] = None
    is_active: Optional[bool] = True


@router.get("/")
def get_active_banners():
    return (
        supabase.table("banners")
        .select("*")
        .eq("is_active", True)
        .order("created_at", desc=True)
        .execute()
        .data
    )


@router.get("/all")
def get_all_banners(admin=Depends(verify_admin)):
    return (
        supabase.table("banners")
        .select("*")
        .order("created_at", desc=True)
        .execute()
        .data
    )


@router.post("/")
def create_banner(banner: BannerIn, admin=Depends(verify_admin)):
    response = supabase.table("banners").insert(banner.model_dump()).execute()
    row = response.data[0]
    log_activity(admin.id, "created", "banner", row["id"], row["title"])
    return response.data


@router.put("/{banner_id}")
def update_banner(banner_id: str, banner: BannerIn, admin=Depends(verify_admin)):
    response = (
        supabase.table("banners")
        .update(banner.model_dump())
        .eq("id", banner_id)
        .execute()
    )
    log_activity(admin.id, "updated", "banner", banner_id, banner.title)
    return response.data


@router.delete("/{banner_id}")
def delete_banner(banner_id: str, admin=Depends(verify_admin)):
    existing = supabase.table("banners").select("title").eq("id", banner_id).execute()
    title = existing.data[0]["title"] if existing.data else None
    supabase.table("banners").delete().eq("id", banner_id).execute()
    log_activity(admin.id, "deleted", "banner", banner_id, title)
    return {"message": "Banner deleted"}