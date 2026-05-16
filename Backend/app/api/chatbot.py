from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
SYSTEM_PROMPT = os.getenv("SYSTEM_PROMPT")

client = genai.Client(api_key=API_KEY)


def generate_message(text: str, history: list = None):


    try:
        contents = []

        contents.append(SYSTEM_PROMPT)


        if history:
            history = history[-10:]
            contents.extend(history)

        contents.append(text)

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=contents
        )

        return {
            "answer": response.text
        }

    except Exception as e:
        return {
            "error": str(e)
        }