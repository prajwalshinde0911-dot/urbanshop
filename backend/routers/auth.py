from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import supabase, new_client
from auth_helper import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotRequest(BaseModel):
    email: str
    redirect_to: Optional[str] = None


class ResetRequest(BaseModel):
    access_token: str
    new_password: str


def get_profile(user_id: str):
    rows = supabase.table("profiles").select("*").eq("id", user_id).execute().data
    return rows[0] if rows else {"full_name": None, "role": "user"}


@router.post("/signup")
def signup(data: SignupRequest):
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    try:
        supabase.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {"full_name": data.full_name},
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    print(f"[EMAIL STUB] Welcome email would be sent to {data.email}")
    return {"message": "Signup successful"}


@router.post("/login")
def login(data: LoginRequest):
    try:
        response = new_client().auth.sign_in_with_password({
            "email": data.email,
            "password": data.password,
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    profile = get_profile(response.user.id)
    return {
        "access_token": response.session.access_token,
        "user": {
            "id": response.user.id,
            "email": response.user.email,
            "full_name": profile.get("full_name"),
            "role": profile.get("role", "user"),
        },
    }


@router.get("/me")
def me(user=Depends(get_current_user)):
    profile = get_profile(user.id)
    return {
        "id": user.id,
        "email": user.email,
        "full_name": profile.get("full_name"),
        "role": profile.get("role", "user"),
    }


@router.post("/forgot-password")
def forgot_password(data: ForgotRequest):
    try:
        options = {"redirect_to": data.redirect_to} if data.redirect_to else {}
        new_client().auth.reset_password_for_email(data.email, options)
    except Exception as e:
        print("Forgot password error:", e)
    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
def reset_password(data: ResetRequest):
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    try:
        user = supabase.auth.get_user(data.access_token).user
        supabase.auth.admin.update_user_by_id(user.id, {"password": data.new_password})
    except Exception:
        raise HTTPException(status_code=400, detail="Reset link is invalid or expired")
    return {"message": "Password updated"}