import os
import sqlite3
from flask import Flask, send_from_directory
from flask_cors import CORS
from .config import Config
from .routes.chat import chat_bp
from .routes.quiz import quiz_bp
from .routes.notes import notes_bp


def init_db(db_path: str):
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.executescript("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            summary TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            questions_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()

def create_app():
    frontend_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "frontend")
    )

    print("Frontend directory:", frontend_dir)
    print("Index exists:", os.path.exists(os.path.join(frontend_dir, "index.html")))

    app = Flask(__name__, static_folder=frontend_dir, static_url_path="")

    app.config.from_object(Config)
    CORS(app)

    init_db(app.config["DATABASE_PATH"])

    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(quiz_bp, url_prefix="/api/quiz")
    app.register_blueprint(notes_bp, url_prefix="/api/notes")

    @app.route("/")
    def index():
        return send_from_directory(frontend_dir, "index.html")

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app
