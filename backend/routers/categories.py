from fastapi import APIRouter
from pydantic import BaseModel
from database import supabase

router = APIRouter(prefix="/categories", tags=["categories"])

class CategoryCreate(BaseModel):
    name: str

@router.get("/")
def get_categories():
    response = supabase.table("categories").select("*").execute()
    return response.data

@router.post("/")
def create_category(category: CategoryCreate):
    response = supabase.table("categories").insert({"name": category.name}).execute()
    return response.data