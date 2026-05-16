import numpy as np
from fastapi import APIRouter, UploadFile, File, Depends

from app.auth.dependencies import get_current_user
from app.ml.preprocess import preprocess_image
from app.ml.predictor import predict
from app.storage.supabase_storage import upload_image
from app.database.supa import supabase


router = APIRouter(prefix="/ml", tags=["ML"])


@router.post("/predict")
async def predict_route(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):

    # =========================
    # 1. READ IMAGE
    # =========================
    image_bytes = await file.read()

    # =========================
    # 2. UPLOAD TO STORAGE
    # =========================
    file_name, public_url = upload_image(image_bytes, user["id"])

    # =========================
    # 3. CREATE IMAGE JOB
    # =========================
    job = supabase.table("image_jobs").insert({
        "user_id": user["id"],
        "image_url": public_url,
        "status": "processing"
    }).execute()

    job_id = job.data[0]["id"]

    # =========================
    # 4. PREPROCESS + PREDICT
    # =========================
    tensor = preprocess_image(image_bytes)
    result = predict(tensor)

    # =========================
    # 5. STORE INFERENCE REQUEST
    # =========================
    req = supabase.table("inference_requests").insert({
        "user_id": user["id"],
        "input_payload": {
            "image_url": public_url,
            "file_name": file_name
        }
    }).execute()

    request_id = req.data[0]["id"]

    # =========================
    # 6. STORE INFERENCE RESPONSE
    # =========================
    supabase.table("inference_responses").insert({
        "request_id": request_id,
        "output": {
            "label": result["label"],
            "class_id": result["class_id"],
            "confidence": result["confidence"]
        },
        "tokens_used": None,
        "latency_ms": None
    }).execute()

    # =========================
    # 7. UPDATE JOB STATUS
    # =========================
    supabase.table("image_jobs").update({
        "status": "completed"
    }).eq("id", job_id).execute()

    # =========================
    # 8. RETURN RESULT
    # =========================
    return {
        "job_id": job_id,
        "image_url": public_url,
        "prediction": result
    }