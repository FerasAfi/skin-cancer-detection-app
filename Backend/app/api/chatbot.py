import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

URL = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={API_KEY}"


def generate_message(text, history=None):
    try:
        contents = []

        if history:
            contents.extend(history[-10:])

        contents.append({
            "role": "user",
            "parts": [{"text": text}]
        })

        payload = {
            "contents": contents
        }

        response = requests.post(URL, json=payload)

        data = response.json()

        return {
            "success": True,
            "answer": data["candidates"][0]["content"]["parts"][0]["text"]
        }

    except Exception as e:
        return {
            "success": False,
            "answer": None,
            "error": str(e)
        }