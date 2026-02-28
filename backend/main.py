from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
import os
import json
import tempfile
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-2.5-flash"


# --- Schemas ---

class TranscriptEntry(BaseModel):
    speaker: str
    text: str

class SummarizeRequest(BaseModel):
    question: str
    transcript: list[TranscriptEntry]

class SummarizeResponse(BaseModel):
    speakerA: str
    speakerB: str
    overall: str

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str

class ConversationContext(BaseModel):
    id: str
    question: str
    transcript: list[TranscriptEntry]
    summaries: dict | None = None

class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []
    context: list[ConversationContext] = []

class ChatResponse(BaseModel):
    reply: str


# --- Endpoints ---

@app.post("/api/transcribe")
async def transcribe(audio: UploadFile = File(...), question: str = Form(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        audio_file = client.files.upload(
            file=tmp_path,
            config=types.UploadFileConfig(mime_type="audio/webm"),
        )

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[
                audio_file,
                f"""This audio is a conversation between two people discussing the following question:
Question: {question}

Transcribe the audio and identify the speakers.
Rules:
- Create a new entry each time the speaker changes.
- Label speakers as "A" and "B" only.
- Return only a valid JSON array in the format below, with no additional text:
[
  {{"speaker": "A", "text": "what speaker A said"}},
  {{"speaker": "B", "text": "what speaker B said"}}
]""",
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=list[TranscriptEntry],
            ),
        )
        transcript = json.loads(response.text)
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.post("/api/summarize", response_model=SummarizeResponse)
async def summarize(req: SummarizeRequest):
    transcript_text = "\n".join(
        f"Speaker {entry.speaker}: {entry.text}" for entry in req.transcript
    )

    prompt = f"""Question: {req.question}

Conversation transcript:
{transcript_text}

Analyze the conversation above and return three summaries:
- speakerA: A summary of Speaker A's key opinions and emotions (2-3 sentences).
- speakerB: A summary of Speaker B's key opinions and emotions (2-3 sentences).
- overall: An overall summary of the conversation, including points of agreement and difference (3-4 sentences)."""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SummarizeResponse,
            ),
        )
        result = json.loads(response.text)
        return SummarizeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    context_text = ""
    if req.context:
        entries = []
        for conv in req.context:
            transcript_text = "\n".join(
                f"  Speaker {e.speaker}: {e.text}" for e in conv.transcript
            )
            entries.append(f"[Question: {conv.question}]\n{transcript_text}")
        context_text = "\n\n".join(entries)

    system_instruction = """You are a warm and empathetic AI assistant who knows the full conversation history of a couple.
Help them recall and reflect on their memories by referencing specific details from their past conversations.
Focus on being a thoughtful companion rather than a therapist or analyst.
If the user requests a specific persona, adopt that role."""

    if context_text:
        system_instruction += f"\n\nHere are the couple's past conversation records:\n\n{context_text}"

    history = []
    for msg in req.conversation_history:
        role = "model" if msg.role == "assistant" else "user"
        history.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))

    try:
        chat_session = client.chats.create(
            model=MODEL_NAME,
            history=history,
            config=types.GenerateContentConfig(system_instruction=system_instruction),
        )
        response = chat_session.send_message(req.message)
        return ChatResponse(reply=response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
