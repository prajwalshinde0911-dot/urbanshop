from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List
from database import supabase

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

    ascending = sort_order == "asc"
    query = query.order(sort_by, desc=not ascending)

    response = query.execute()
    return response.data

@router.get("/{product_id}")
def get_product(product_id: str):
    response = supabase.table("products").select("*").eq("id", product_id).execute()
    return response.data

@router.post("/")
def create_product(product: ProductCreate):
    response = supabase.table("products").insert(product.model_dump()).execute()
    return response.data

@router.put("/{product_id}")
def update_product(product_id: str, product: ProductCreate):
    response = supabase.table("products").update(product.model_dump()).eq("id", product_id).execute()
    return response.data

@router.delete("/{product_id}")
def delete_product(product_id: str):
    response = supabase.table("products").delete().eq("id", product_id).execute()
    return {"message": "Product deleted"}