# app.py – William's server.
# The page sends what you typed here; this file asks Qwen; Qwen's answer goes back to the page.
import os
import re

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from pydantic import BaseModel

# ---- 1. Connect to the model ----------------------------------------------
API_KEY = os.environ.get("LLM_API_KEY", "")
BASE_URL = os.environ.get("LLM_BASE_URL", "https://api.groq.com/openai/v1")
MODEL = os.environ.get("LLM_MODEL", "qwen/qwen3.8-27b")

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

# Qwen can "think" before it answers. That is slow, so we switch it off.
if "groq" in BASE_URL:
    NO_THINKING = {"reasoning_effort": "none"}
elif "dashscope" in BASE_URL:
    NO_THINKING = {"enable_thinking": False}
else:
    NO_THINKING = {}

# ---- 2. Who William is ------------------------------------------------------
WILLIAM = """You are William, a friendly cartoon cat who helps two English-speaking friends learn Chinese (HSK 1).
Keep every answer short: at most 4 sentences.
Whenever you write Chinese, give the characters, the pinyin with tone marks and the English meaning,
like this: 你好 (nǐ hǎo) – hello.
Only talk about learning Chinese. Write plain text, no markdown."""

# ---- 3. The web app ---------------------------------------------------------
app = FastAPI()


class ChatRequest(BaseModel):
    messages: list[dict]  # the conversation so far: [{"role": "user", "content": "..."}, ...]


@app.post("/api/chat")
def chat(req: ChatRequest):
    # Keep only normal chat messages, and only the last 20 (faster and cheaper).
    history = [m for m in req.messages if m.get("role") in ("user", "assistant")][-20:]
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": WILLIAM}] + history,
            max_tokens=400,
            temperature=0.5,
            extra_body=NO_THINKING,
        )
        text = response.choices[0].message.content or ""
    except Exception as error:
        print("Model error:", error)
        return {"reply": "Miau... I can't reach my brain right now. Check LLM_API_KEY and try again."}
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.S).strip()
    return {"reply": text}


# ---- 4. Serve the page (index.html, style.css, chat.js) --------------------
app.mount("/", StaticFiles(directory="static", html=True), name="static")