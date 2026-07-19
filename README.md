# AI Study Buddy

Flask + Groq powered study assistant with chat, quiz generation, and AI note summarization.

## Setup
1. `python -m venv venv && source venv/bin/activate`
2. `pip install -r backend/requirements.txt`
3. Copy `.env` and set `GROQ_API_KEY` (get one at https://console.groq.com)
4. `python run.py`
5. Open http://localhost:5000

## Endpoints
- `POST /api/chat/` — chat with the tutor
- `POST /api/quiz/generate` — generate MCQ quiz
- `POST /api/notes/` — save & summarize notes
- `GET  /api/notes/` — list notes
# Study-Buddy
