from fastapi import APIRouter, Query, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database import supabase
from auth_helper import verify_admin
from activity import log_activity

router = APIRouter(prefix="/products", tags=["products"])


class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    category_id: Optional[str] = None
    location: Optional[str] = None
    images: Optional[List[str]] = []
    reseller_link: str
    is_active: Optional[bool] = True


def clean(data: dict) -> dict:
    if not data.get("category_id"):
        data["category_id"] = None
    return data


@router.get("/")
def get_products(
    category_id: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    location: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc"),
):
    query = supabase.table("products").select("*").eq("is_active", True)

    if category_id:
        query = query.eq("category_id", category_id)
    if min_price is not None:
        query = query.gte("price", min_price)
    if max_price is not None:
        query = query.lte("price", max_price)
    if location:
        query = query.ilike("location", f"%{location}%")
    if search:
        query = query.ilike("title", f"%{search}%")

    query = query.order(sort_by, desc=(sort_order != "asc"))
    return query.execute().data


@router.get("/{product_id}")
def get_product(product_id: str):
    response = supabase.table("products").select("*").eq("id", product_id).eq("is_active", True).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return response.data[0]


@router.post("/")
def create_product(product: ProductCreate, admin=Depends(verify_admin)):
    data = clean(product.model_dump())
    data["created_by"] = admin.id
    response = supabase.table("products").insert(data).execute()
    row = response.data[0]
    log_activity(admin.id, "created", "product", row["id"], row["title"])
    return response.data


@router.put("/{product_id}")
def update_product(product_id: str, product: ProductCreate, admin=Depends(verify_admin)):
    data = clean(product.model_dump())
    response = supabase.table("products").update(data).eq("id", product_id).execute()
    log_activity(admin.id, "updated", "product", product_id, product.title)
    return response.data


@router.delete("/{product_id}")
def delete_product(product_id: str, admin=Depends(verify_admin)):
    existing = supabase.table("products").select("title").eq("id", product_id).execute()
    title = existing.data[0]["title"] if existing.data else None
    supabase.table("products").delete().eq("id", product_id).execute()
    log_activity(admin.id, "deleted", "product", product_id, title)
    return {"message": "Product deleted"}