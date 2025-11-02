import os
import json
from pathlib import Path
from typing import List

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

APP_NAME = "ACE Orbit API"
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
FACTS_PATH = DATA_DIR / "college_facts.md"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_API_URL = os.getenv(
    "GEMINI_API_URL",
    "",
)

if not FACTS_PATH.exists():
    FACTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    FACTS_PATH.write_text(
        "# ACEM Facts\n\nPlease add college facts here.\n",
        encoding="utf-8",
    )

# Read facts file once at startup; allow hot-reload in dev via function

def load_facts() -> str:
    try:
        return FACTS_PATH.read_text(encoding="utf-8").strip()
    except Exception:
        return ""


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)


class ChatResponse(BaseModel):
    reply: str
    source: str = "gemini"


app = FastAPI(title=APP_NAME)

# CORS
raw_origins = os.getenv("CORS_ORIGINS", "*")
origins: List[str] = [o.strip() for o in raw_origins.split(",") if o.strip()] or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "app": APP_NAME}


def build_prompt(question: str) -> str:
    facts = load_facts()
    return (
        "You are 'ACE Orbit', a friendly, precise FAQ assistant for Aditya College of Engineering, Madanapalle (ACEM).\n"
        "Answer ONLY using the facts below. If unsure, say you don't have that information and suggest contacting the college.\n\n"
        f"Facts:\n{facts}\n\n"
        f"Q: {question}\nA:"
    )


def call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY or not GEMINI_API_URL:
        raise RuntimeError("Gemini API configuration missing. Set GEMINI_API_KEY and GEMINI_API_URL.")

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
    }
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        resp = requests.post(GEMINI_API_URL, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        # Expected: candidates[0].content.parts[0].text
        reply = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text")
        )
        if not reply:
            raise ValueError("Empty reply from Gemini")
        return reply.strip()
    except requests.HTTPError as e:
        raise RuntimeError(f"Gemini HTTP error: {e.response.status_code} {e.response.text}")
    except Exception as e:
        raise RuntimeError(f"Gemini error: {e}")


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    prompt = build_prompt(req.message)
    try:
        answer = call_gemini(prompt)
        return ChatResponse(reply=answer)
    except Exception as e:
        # Map internal errors to 502 for upstream failures
        raise HTTPException(status_code=502, detail=str(e))
@app.get("/")
def root():
    return {"status": "ok", "app": APP_NAME}



# For local dev: `python backend/main.py`
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
