from flask import Blueprint, request, jsonify
from ..services.notes_service import summarize_notes
from ..utils.helper import get_db

notes_bp = Blueprint("notes", __name__)

@notes_bp.post("/")
def create_note():
    data = request.get_json(force=True)
    title = (data.get("title") or "Untitled").strip()
    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"error": "content is required"}), 400

    summary = None
    if data.get("summarize"):
        try:
            summary = summarize_notes(content)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    db = get_db()
    cur = db.execute(
        "INSERT INTO notes(title, content, summary) VALUES(?,?,?)",
        (title, content, summary),
    )
    db.commit()
    note_id = cur.lastrowid
    db.close()
    return jsonify({"id": note_id, "title": title, "content": content, "summary": summary})

@notes_bp.get("/")
def list_notes():
    db = get_db()
    rows = db.execute("SELECT * FROM notes ORDER BY id DESC").fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

@notes_bp.delete("/<int:note_id>")
def delete_note(note_id):
    db = get_db()
    db.execute("DELETE FROM notes WHERE id=?", (note_id,))
    db.commit()
    db.close()
    return jsonify({"ok": True})
