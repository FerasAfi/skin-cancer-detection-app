from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.auth.security import decode_token
from app.database.supa import supabase

bearer_scheme = HTTPBearer()


# =========================
# GET CURRENT USER
# =========================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):

    token = credentials.credentials
    payload = decode_token(token)

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=401,
            detail="Invalid access token."
        )

    user_id = payload.get("sub")

    result = (
        supabase
        .from_("users")
        .select("""
            id,
            username,
            email,
            full_name,
            user_roles (
                roles (
                    name
                )
            )
        """)
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    user = result.data

    role = (
        user.get("user_roles", [{}])[0]
        .get("roles", {})
        .get("name", "user")
    )

    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": role
    }


# =========================
# REQUIRE ADMIN
# =========================

def require_admin(
    user=Depends(get_current_user)
):

    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )

    return user