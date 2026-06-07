from flask import Flask, Response, request
import sqlite3
import json
import os

app = Flask(__name__)
DB_PATH = "/app/data/acousticnet.db"

def init_db():
    if not os.path.exists("/app/data"):
        os.makedirs("/app/data")
    connection = sqlite3.connect(DB_PATH)
    connection.execute("""
        CREATE TABLE IF NOT EXISTS mensagens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            texto TEXT NOT NULL
        )
    """)
    connection.execute("""
        CREATE TABLE IF NOT EXISTS decibels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value REAL NOT NULL,
            timestamp DATATIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor = connection.execute("SELECT COUNT(*) FROM mensagens")
    if cursor.fetchone()[0] == 0:
        connection.execute("INSERT INTO mensagens (texto) VALUES ('Hello World do SQLite!')")
    connection.commit()
    connection.close()

@app.errorhandler(404)
def page_not_found(erro):
    return "Page doesn't exist!\nErro {}".format(erro), 404    

@app.route("/api/")
def api():
    data = json.dumps({
        "message:": "hiiii this is API route..",
        "routes:": ["/api (this one)",
                    "/api/hello - test 'hello world'",
                    "/api/health - check the literal health of the system :v"]
    })
    return Response(data, mimetype='application/json'), 200

@app.route("/api/hello")
def hello():
    connection = sqlite3.connect(DB_PATH)
    cursor = connection.execute("SELECT texto FROM mensagens LIMIT 1")
    row = cursor.fetchone()
    connection.close()
    data = json.dumps({
        "frontend": "ok",
        "backend": "ok",
        "banco": row[0] if row else "vazio"
    })
    return Response(data, mimetype='application/json')

@app.route("/api/health")
def health():
    data = json.dumps({
        "status": "ok"
    })
    return Response(data, mimetype="application/json"), 200

@app.route("/api/decibels", methods=["POST"])
def recive_decibels():
    try:
        body = request.get_data(as_text=True)
        data = json.loads(body)
        value = data.get("value")
        if value is None:
            return Response(
                json.dumps({"error": "camp 'value' missing!"}),
                mimetype="application/json"
            ), 400
        connection = sqlite3.connect(DB_PATH)
        connection.execute("INSERT INTO decibels (value) VALUES (?)", (value,))
        connection.commit()
        connection.close()
        return Response(
            json.dumps({"status": "ok", "value": value}),
            mimetype="application/json"
        ), 201
    except Exception as E:
        return Response(
            json.dumps({"error": str(E)}),
            mimetype="application/json"
        ), 500

@app.route("/api/decibeis", methods=["GET"])
def list_decibels():
    connection = sqlite3.connect(DB_PATH)
    cursor = connection.execute(
        "SELECT value, timestamp FROM decibels ORDER BY timestamp DESC LIMIT 50"
    )
    rows = cursor.fetchall()
    connection.close()
    data = json.dumps([{"valor": r[0], "timestamp": r[1]} for r in rows])
    return Response(data, mimetype="application/json"), 200

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)
