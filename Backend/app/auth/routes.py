from fastapi import APIRouter, HTTPException, Depends
from app.models.auth_models import RegisterRequest, LoginRequest

from app.database.supa import supabase
from app.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token
)

from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])



# =========================
# REGISTER
# =========================

@router.post("/register", status_code=201)
async def register(req: RegisterRequest):


    existing_user = (
        supabase
        .table("users")
        .select("id")
        .eq("username", req.username)
        .execute()
    )

    if existing_user.data:
        raise HTTPException(
            status_code=409,
            detail="Username already exists."
        )


    # CREATE USER
    new_user = (
        supabase
        .table("users")
        .insert({
            "username": req.username,
            "email": req.email,
            "full_name": req.full_name,
            "password_hash": hash_password(req.password)
        })
        .execute()
    )

    user = new_user.data[0]


    # GET USER ROLE ID
    role_result = (
        supabase
        .table("roles")
        .select("id")
        .eq("name", "user")
        .single()
        .execute()
    )

    role_id = role_result.data["id"]


    # LINK USER ↔ ROLE
    supabase.table("user_roles").insert({
        "user_id": user["id"],
        "role_id": role_id
    }).execute()

    return {
        "message": "User created successfully.",
        "user_id": user["id"]
    }


# =========================
# LOGIN
# =========================

@router.post("/login")
async def login(req: LoginRequest):


    result = (
        supabase
        .table("users")
        .select("*")
        .eq("username", req.username)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials."
        )

    user = result.data

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials."
        )


    # GET ROLE
    role_result = (
        supabase
        .table("user_roles")
        .select("roles(name)")
        .eq("user_id", user["id"])
        .execute()
    )

    # default fallback
    role = "user"

    if role_result.data and len(role_result.data) > 0:
        role = role_result.data[0]["roles"]["name"]

    access_token = create_access_token(
        user_id=user["id"],
        role=role
    )

    refresh_token = create_refresh_token(
        user_id=user["id"]
    )


    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": role
        }
    }

# =========================
# CURRENT USER
# =========================

@router.get("/me")
async def me(user = Depends(get_current_user)):

    return user