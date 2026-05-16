from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime

from app.auth.dependencies import get_current_user
from app.database.supa import supabase
from app.api.chatbot import generate_message

router = APIRouter(prefix="/chat", tags=["Chat"])


# =========================
# SCHEMA
# =========================

class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


# =========================
# GET OR CREATE CONVERSATION
# =========================

def get_or_create_conversation(user_id: str, conversation_id: str | None):

    if conversation_id:
        return conversation_id

    result = supabase.table("conversations").insert({
        "user_id": user_id,
        "title": "New Chat"
    }).execute()

    return result.data[0]["id"]


# =========================
# CHAT ENDPOINT
# =========================

@router.post("")
async def chat(req: ChatRequest, user=Depends(get_current_user)):

    user_id = user["id"]

    conversation_id = get_or_create_conversation(user_id, req.conversation_id)


    supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "user_id": user_id,
        "role": "user",
        "content": req.message
    }).execute()

    history = supabase.table("messages") \
        .select("role, content") \
        .eq("conversation_id", conversation_id) \
        .order("created_at") \
        .limit(10) \
        .execute()

    context = [
        f"{m['role']}: {m['content']}"
        for m in history.data
    ]


    answer = generate_message(req.message, context)["answer"]


    supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "user_id": user_id,
        "role": "assistant",
        "content": answer
    }).execute()


    return {
        "conversation_id": conversation_id,
        "answer": answer
    }