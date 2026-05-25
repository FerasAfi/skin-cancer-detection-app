from fastapi import FastAPI
from app.auth.routes import router as auth_router
from app.api.chat_routes import router as chat_router
from app.ml.predict_routes import router as predict_router
from app.keys.api_key_routes import router as developer_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()
ORIGIN = os.getenv("ORIGIN")

app = FastAPI(
    title="Skin Cancer Backend",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        ORIGIN
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(predict_router)
app.include_router(developer_router)

@app.get("/")
async def root():
    return {
        "message": "API running."
    }