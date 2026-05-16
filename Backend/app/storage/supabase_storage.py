import uuid
import os
from app.database.supa import supabase



BUCKET = os.getenv("BUCKET")

def upload_image(file_bytes: bytes, user_id: str):

    file_name = f"{user_id}/{uuid.uuid4()}.jpg"

    supabase.storage.from_(BUCKET).upload(
        file_name,
        file_bytes,
        file_options={"content-type": "image/jpeg"}
    )

    public_url = supabase.storage.from_(BUCKET).get_public_url(file_name)

    return file_name, public_url