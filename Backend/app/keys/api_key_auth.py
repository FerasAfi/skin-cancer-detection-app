from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import hashlib

from app.database.supa import supabase

bearer = HTTPBearer()

def verify_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(bearer)
):

    raw_key = credentials.credentials

    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

    result = (
        supabase
        .table("api_keys")
        .select("*")
        .eq("key_hash", key_hash)
        .eq("status", True)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid API key")

    return result.data[0]