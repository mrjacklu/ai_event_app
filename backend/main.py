import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import openai
import uvicorn

# Load environment variables from .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in .env file")
openai.api_key = OPENAI_API_KEY

app = FastAPI(title="EventGenie API")

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PlanEventRequest(BaseModel):
    prompt: str

class PlanEventResponse(BaseModel):
    recommendations: str

@app.get("/")
def root():
    return {"message": "EventGenie API is running!"}

@app.post("/plan-event", response_model=PlanEventResponse)
def plan_event(req: PlanEventRequest):
    try:
        # Compose a prompt for OpenAI
        system_prompt = (
            "You are EventGenie, an expert event planner AI. Given a user's event description, "
            "generate a concise, actionable event plan including recommendations for food, activities, entertainment, and a flyer headline. "
            "Format the output as markdown with clear sections, and include a # Flyer section for the invitation text."
        )
        user_prompt = req.prompt
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=600,
            temperature=0.7
        )
        content = response.choices[0].message.content
        return {"recommendations": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)
