import json
from flask import Blueprint, request, jsonify
from ..services.quiz_service import generate_quiz
from ..utils.helper import get_db

quiz_bp = Blueprint("quiz", __name__)

@quiz_bp.post("/generate")
def generate():
    data = request.get_json(force=True)
    topic = (data.get("topic") or "").strip()
    n = int(data.get("num_questions", 5))
    if not topic:
        return jsonify({"error": "topic is required"}), 400
    try:
        quiz = generate_quiz(topic, n)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    db = get_db()
    db.execute("INSERT INTO quizzes(topic, questions_json) VALUES(?,?)",
               (topic, json.dumps(quiz)))
    db.commit()
    db.close()
    return jsonify(quiz)
