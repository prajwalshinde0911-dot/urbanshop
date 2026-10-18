from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import supabase
from auth_helper import verify_admin
from activity import log_activity

router = APIRouter(prefix="/categories", tags=["categories"])


class CategoryCreate(BaseModel):
    name: str


@router.get("/")
def get_categories():
    response = supabase.table("categories").select("*").order("name").execute()
    return response.data


@router.post("/")
def create_category(category: CategoryCreate, admin=Depends(verify_admin)):
    try:
        response = supabase.table("categories").insert({"name": category.name}).execute()
    except Exception:
        raise HTTPException(status_code=400, detail="Category already exists")
    log_activity(admin.id, "created", "category", response.data[0]["id"], category.name)
    return response.data


@router.put("/{category_id}")
def update_category(category_id: str, category: CategoryCreate, admin=Depends(verify_admin)):
    response = supabase.table("categories").update({"name": category.name}).eq("id", category_id).execute()
    log_activity(admin.id, "updated", "category", category_id, category.name)
    return response.data


@router.delete("/{category_id}")
def delete_category(category_id: str, admin=Depends(verify_admin)):
    supabase.table("categories").delete().eq("id", category_id).execute()
    log_activity(admin.id, "deleted", "category", category_id)
    return {"message": "Category deleted"}