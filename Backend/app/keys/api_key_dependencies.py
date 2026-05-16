# =========================================
# app/auth/api_key_dependencies.py
# =========================================

from fastapi import Header, HTTPException, Depends

from app.database.supa import supabase
from app.auth.api_key_security import hash_api_key


async def verify_api_key(
    authorization: str = Header(None)
):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="API key required."
        )

    try:
        scheme, raw_key = authorization.split(" ")

        if scheme.lower() != "bearer":
            raise Exception()

    except:
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header."
        )

    hashed_key = hash_api_key(raw_key)

    result = (
        supabase
        .table("api_keys")
        .select("*")
        .eq("key_hash", hashed_key)
        .eq("status", True)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key."
        )

    api_key = result.data[0]

    return api_key