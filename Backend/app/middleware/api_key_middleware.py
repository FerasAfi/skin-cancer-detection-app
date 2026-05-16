from fastapi import Request, HTTPException

from app.database.supa import supabase


async def verify_api_key(request: Request, call_next):

    api_key = request.headers.get("X-API-Key")

    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="API key missing."
        )

    result = (
        supabase
        .table("api_keys")
        .select("*")
        .eq("key", api_key)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key."
        )

    response = await call_next(request)

    return response