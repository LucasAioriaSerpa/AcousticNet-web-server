
from database import get_connection

def insert_decibel(value):
    conn = get_connection()
    conn.execute("INSERT INTO decibels (value) VALUES (?)", (value,))
    conn.commit()
    conn.close()

def list_decibels(limit=50):
    conn = get_connection()
    cursor = conn.execute(
        "SELECT value, timestamp FROM decibels ORDER BY timestamp ASC LIMIT ?",
        (limit,)
    )
    rows = cursor.fetchall()
    conn.close()
    return rows

def latest_decibel():
    conn = get_connection()
    cursor = conn.execute(
        "SELECT value, timestamp FROM decibels ORDER BY timestamp DESC LIMIT 1"
    )
    row = cursor.fetchone()
    conn.close()
    return row
