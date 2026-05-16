from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    HTTPException
)

import time

from app.auth.dependencies import get_current_user
from app.keys.api_key_dependencies import verify_api_key

from app.auth.api_key_security import (
    generate_api_key,
    hash_api_key
)

from app.keys.api_key_service import (
    log_api_usage,
    count_month_usage
)

from app.database.supa import supabase

from app.ml.preprocess import preprocess_image
from app.ml.predictor import predict

from app.storage.supabase_storage import upload_image

from pydantic import BaseModel


router = APIRouter(
    prefix="/developer",
    tags=["Developer"]
)


# =========================================
# CONFIG
# =========================================

MONTHLY_LIMIT = 1000


# =========================================
# SCHEMAS
# =========================================

class CreateKeyRequest(BaseModel):
    name: str


# =========================================
# CREATE API KEY
# =========================================

@router.post("/keys")
async def create_api_key(
    req: CreateKeyRequest,
    user=Depends(get_current_user)
):

    raw_key = generate_api_key()

    hashed_key = hash_api_key(raw_key)


    result = (
        supabase
        .table("api_keys")
        .insert({
            "user_id": user["id"],
            "name": req.name,
            "key_hash": hashed_key,
            "status": True
        })
        .execute()
    )

    api_key = result.data[0]

    return {
        "message": "API key created successfully.",
        "api_key": raw_key,
        "key_id": api_key["id"]
    }


# =========================================
# GET USER API KEYS
# =========================================

@router.get("/keys")
async def get_api_keys(
    user=Depends(get_current_user)
):

    result = (
        supabase
        .table("api_keys")
        .select("id, name, status, created_at")
        .eq("user_id", user["id"])
        .execute()
    )

    return result.data


# =========================================
# REVOKE API KEY
# =========================================

@router.delete("/keys/{key_id}")
async def revoke_api_key(
    key_id: str,
    user=Depends(get_current_user)
):

    result = (
        supabase
        .table("api_keys")
        .select("*")
        .eq("id", key_id)
        .eq("user_id", user["id"])
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="API key not found."
        )

    (
        supabase
        .table("api_keys")
        .update({
            "status": False
        })
        .eq("id", key_id)
        .execute()
    )

    return {
        "message": "API key revoked successfully."
    }


# =========================================
# DEVELOPER MODEL ENDPOINT
# =========================================

@router.post("/predict")
async def developer_predict(
    file: UploadFile = File(...),
    api_key=Depends(verify_api_key)
):

    # =========================
    # CHECK USAGE LIMIT
    # =========================

    usage_count = count_month_usage(api_key["id"])

    if usage_count >= MONTHLY_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Monthly API limit exceeded."
        )

    # =========================
    # START TIMER
    # =========================

    start = time.time()

    # =========================
    # READ IMAGE
    # =========================

    image_bytes = await file.read()

    # =========================
    # UPLOAD IMAGE
    # =========================

    file_name, public_url = upload_image(
        file_bytes=image_bytes,
        user_id=api_key["user_id"]
    )

    # =========================
    # PREPROCESS IMAGE
    # =========================

    image_tensor = preprocess_image(image_bytes)

    # =========================
    # RUN MODEL
    # =========================

    prediction = predict(image_tensor)

    # =========================
    # LATENCY
    # =========================

    latency_ms = int(
        (time.time() - start) * 1000
    )

    # =========================
    # SAVE REQUEST
    # =========================

    request_result = (
        supabase
        .table("inference_requests")
        .insert({
            "user_id": api_key["user_id"],

            "input_payload": {
                "image_url": public_url,
                "file_name": file_name,
                "api_key_id": api_key["id"]
            }
        })
        .execute()
    )

    request_id = request_result.data[0]["id"]

    # =========================
    # SAVE RESPONSE
    # =========================

    (
        supabase
        .table("inference_responses")
        .insert({
            "request_id": request_id,

            "output": prediction,

            "tokens_used": 0,

            "latency_ms": latency_ms
        })
        .execute()
    )

    # =========================
    # LOG USAGE
    # =========================

    log_api_usage(
        api_key_id=api_key["id"],
        endpoint="/developer/predict",
        status_code=200,
        tokens_used=0
    )

    # =========================
    # RETURN RESPONSE
    # =========================

    return {
        "success": True,

        "prediction": prediction,

        "latency_ms": latency_ms,

        "usage": {
            "current_requests": usage_count + 1,
            "monthly_limit": MONTHLY_LIMIT
        }
    }