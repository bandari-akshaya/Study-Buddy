from flask import Blueprint, request, jsonify
from ..services.groq_service import chat_completion
from ..utils.helper import get_db

chat_bp = Blueprint("chat", __name__)

SYSTEM_PROMPT = "You are AI Study Buddy: a friendly, concise tutor. Explain step-by-step with examples."

@chat_bp.post("/")
def chat():
    data = request.get_json(force=True)
    user_msg = (data.get("message") or "").strip()
    if not user_msg:
        return jsonify({"error": "message is required"}), 400

    history = data.get("history", [])
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": m["role"], "content": m["content"]} for m in history]
    messages.append({"role": "user", "content": user_msg})

    try:
        reply = chat_completion(messages)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    db = get_db()
    db.execute("INSERT INTO chats(role, message) VALUES(?,?)", ("user", user_msg))
    db.execute("INSERT INTO chats(role, message) VALUES(?,?)", ("assistant", reply))
    db.commit()
    db.close()

    return jsonify({"reply": reply})

@chat_bp.get("/history")
def history():
    db = get_db()
    rows = db.execute("SELECT role, message, created_at FROM chats ORDER BY id ASC").fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])
