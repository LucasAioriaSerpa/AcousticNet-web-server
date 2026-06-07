
import sqlite3
import os

DB_PATH = "/app/data/acousticnet.db"

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    if not os.path.exists("/app/data"):
        os.makedirs("/app/data")
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS mensagens (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            texto     TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS decibels (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            value     REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor = conn.execute("SELECT COUNT(*) FROM mensagens")
    if cursor.fetchone()[0] == 0:
        conn.execute("INSERT INTO mensagens (texto) VALUES ('Hello World do SQLite!')")
    conn.commit()
    conn.close()
