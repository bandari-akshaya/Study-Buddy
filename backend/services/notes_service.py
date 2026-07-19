from .groq_service import chat_completion

def summarize_notes(content: str) -> str:
    messages = [
        {"role": "system", "content": "Summarize study notes into clear bullet points and key takeaways."},
        {"role": "user", "content": content},
    ]
    return chat_completion(messages, temperature=0.3, max_tokens=800)
