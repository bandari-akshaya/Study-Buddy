import json
import re
from .groq_service import chat_completion

QUIZ_SYSTEM = (
    "You are an expert tutor. Generate a multiple-choice quiz strictly as JSON "
    "with this shape: {\"questions\": [{\"question\": str, \"options\": [str, str, str, str], "
    "\"answer_index\": int, \"explanation\": str}]}. No prose outside JSON."
)

def generate_quiz(topic: str, num_questions: int = 5):
    user = f"Create {num_questions} multiple-choice questions about: {topic}"
    raw = chat_completion(
        [{"role": "system", "content": QUIZ_SYSTEM},
         {"role": "user", "content": user}],
        temperature=0.5,
        max_tokens=1500,
    )
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError("Model did not return JSON")
    return json.loads(match.group(0))
