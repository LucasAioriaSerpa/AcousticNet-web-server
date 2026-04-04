from flask import Flask, jsonify
import sqlite3
import os

app = Flask(__name__)
DB_PATH = "/app/data/acousticnet.db"

def init_db():
    os.makedirs("/app/data", exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.execute("""
        CREATE TABLE IF NOT EXISTS mensagens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            texto TEXT NOT NULL
        )
    """)
    cursor = connection.execute("SELECT COUNT(*) FROM mensagens")
    if cursor.fetchone()[0] == 0:
        connection.execute("INSERT INTO mensagens (texto) VALUES ('Hello World do SQLite!')")
    connection.commit()
    connection.close()

@app.route("/api/hello")
def hello():
    connection = sqlite3.connect(DB_PATH)
    cursor = connection.execute("SELECT texto FROM mensagens LIMIT 1")
    row = cursor.fetchone()
    connection.close()
    return jsonify({
        "frontend": "ok",
        "backend": "ok",
        "banco": row[0] if row else "vazio"
    })

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)
