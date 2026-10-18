from fastapi import Header, HTTPException, Depends
from database import supabase


def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        user_response = supabase.auth.get_user(token)
        return user_response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def verify_admin(user=Depends(get_current_user)):
    profile = supabase.table("profiles").select("role").eq("id", user.id).execute()
    if not profile.data or profile.data[0]["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user