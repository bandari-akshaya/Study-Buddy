from groq import Groq
from flask import current_app

_client = None

def get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=current_app.config["GROQ_API_KEY"])
    return _client

def chat_completion(messages, temperature=0.7, max_tokens=1024):
    client = get_client()
    resp = client.chat.completions.create(
        model=current_app.config["GROQ_MODEL"],
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content
