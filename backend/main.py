import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import openai
import uvicorn
from typing import List, Optional
import traceback

# Load environment variables from .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in .env file")
openai.api_key = OPENAI_API_KEY

app = FastAPI(title="FizzBuzz API")

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
    date: str
    location: str
    time: str
    flyer_style: str

class PlanEventResponse(BaseModel):
    theme: str
    date: str
    time: str
    location: str
    food: Optional[List[str]] = None
    drinks: Optional[List[str]] = None
    activities: Optional[List[str]] = None
    entertainment: Optional[List[str]] = None
    flyer: str
    flyer_image_url: Optional[str] = None

@app.get("/")
def root():
    return {"message": "FizzBuzz API is running!"}

@app.post("/plan-event", response_model=PlanEventResponse)
def plan_event(req: PlanEventRequest):
    try:
        # Compose a prompt for OpenAI
        system_prompt = (
            "You are FizzBuzz, an expert event planner AI. The user will provide an event description, date, location, time, and flyer style. "
            "Generate a concise, actionable event plan as a JSON object with the following fields: "
            "theme, date, time, location, food (array), drinks (array), activities (array), entertainment (array), flyer (string). "
            "The flyer field should be a short, catchy invitation text that includes the date, time, and location. "
            "Respond ONLY with valid JSON. Do not include markdown, explanations, or any other text."
        )
        user_prompt = f"Event Description: {req.prompt}\nDate: {req.date}\nTime: {req.time}\nLocation: {req.location}\nFlyer Style: {req.flyer_style}"
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=600,
            temperature=0.7
        )
        import json
        content = response.choices[0].message.content
        print("GPT response:", content)
        plan = json.loads(content)

        # Generate flyer image using DALL·E
        flyer_image_prompt = (
            f"{plan.get('flyer', '')} in a {req.flyer_style} style, event theme: {plan.get('theme', '')}, at {plan.get('location', '')}, on {plan.get('date', '')} at {plan.get('time', '')}. "
            "Make the event text (date, time, and place) large, clear, and easily visible in the image."
        )
        image_response = openai.images.generate(
            model="dall-e-3",
            prompt=flyer_image_prompt,
            n=1,
            size="1024x1024"
        )
        image_url = image_response.data[0].url
        plan['flyer_image_url'] = image_url
        print("DALL·E image URL:", plan.get('flyer_image_url'))
        return plan
    except Exception as e:
        print("Error in /plan-event:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)
