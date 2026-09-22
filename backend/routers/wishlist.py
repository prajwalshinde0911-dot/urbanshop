from fastapi import APIRouter, Depends
from pydantic import BaseModel
from database import supabase
from auth_helper import get_current_user

router = APIRouter(prefix="/wishlist", tags=["wishlist"])

class WishlistAdd(BaseModel):
    product_id: str

@router.get("/")
def get_wishlist(user=Depends(get_current_user)):
    response = supabase.table("wishlist").select("*, products(*)").eq("user_id", user.id).execute()
    return response.data

@router.post("/")
def add_to_wishlist(item: WishlistAdd, user=Depends(get_current_user)):
    response = supabase.table("wishlist").insert({
        "user_id": user.id,
        "product_id": item.product_id
    }).execute()
    return response.data

@router.delete("/{product_id}")
def remove_from_wishlist(product_id: str, user=Depends(get_current_user)):
    response = supabase.table("wishlist").delete().eq("user_id", user.id).eq("product_id", product_id).execute()
    return {"message": "Removed from wishlist"}