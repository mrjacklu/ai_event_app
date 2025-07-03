# EventGenie (Working Title)

EventGenie is an AI-powered event planning web application designed to help users quickly and easily create memorable events. The app leverages AI to generate personalized event plans, recommendations, and professional-looking flyers based on a simple natural language prompt.

## Goals
- Make event planning fast, stress-free, and accessible to everyone
- Provide AI-driven suggestions for food, activities, entertainment, and event details
- Allow users to customize and generate shareable event flyers

## Tech Stack
- **Frontend:** React, TypeScript, Material-UI (MUI)
- **Backend:** FastAPI (Python), OpenAI API
- **Other:** Docker (for deployment), .env for secrets management

## Key Features
- Minimalist, modern UI for entering event prompts
- AI-generated event plans and recommendations
- Customizable flyer preview with color, font, and layout controls
- (Planned) Download/share flyer as an image

## Getting Started
1. Clone the repo and install dependencies for both frontend and backend
2. Add your OpenAI API key to `backend/.env` (never commit this file)
3. Start the backend (`python3 main.py` in `/backend`)
4. Start the frontend (`npm start` in `/frontend`)
5. Access the app at [http://localhost:3000](http://localhost:3000) (or your chosen port)

## Security
- **Never commit your `.env` file or API keys to git.**
- Add `.env` to your `.gitignore` to keep secrets safe.

---

For more details or to contribute, see the project roadmap and code comments.
