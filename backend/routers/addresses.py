from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from database import supabase
from auth_helper import get_current_user

router = APIRouter(prefix="/addresses", tags=["addresses"])

class AddressCreate(BaseModel):
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    is_default: Optional[bool] = False

@router.get("/")
def get_addresses(user=Depends(get_current_user)):
    response = supabase.table("addresses").select("*").eq("user_id", user.id).execute()
    return response.data

@router.post("/")
def create_address(address: AddressCreate, user=Depends(get_current_user)):
    data = address.model_dump()
    data["user_id"] = user.id
    response = supabase.table("addresses").insert(data).execute()
    return response.data

@router.put("/{address_id}")
def update_address(address_id: str, address: AddressCreate, user=Depends(get_current_user)):
    response = supabase.table("addresses").update(address.model_dump()).eq("id", address_id).eq("user_id", user.id).execute()
    return response.data

@router.delete("/{address_id}")
def delete_address(address_id: str, user=Depends(get_current_user)):
    response = supabase.table("addresses").delete().eq("id", address_id).eq("user_id", user.id).execute()
    return {"message": "Address deleted"}