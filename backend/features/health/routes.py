
import json

from flask import Blueprint, Response

from database import get_connection

health_bp = Blueprint('health', __name__)

@health_bp.route("/api/")
def api():
    data = json.dumps({
        "message": "AcousticNet API",
        "version": "1.0.0",
        "routes": [
            "GET  /api/",
            "GET  /api/hello",
            "GET  /api/health",
            "GET  /api/decibels",
            "POST /api/decibels"
        ]
    })
    return Response(data, mimetype="application/json"), 200

@health_bp.route("/api/hello")
def hello():
    conn = get_connection()
    cursor = conn.execute("SELECT texto FROM mensagens LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    data = json.dumps({
        "frontend": "ok",
        "backend": "ok",
        "banco": row[0] if row else "vazio"
    })
    return Response(data, mimetype="application/json"), 200

@health_bp.route("/api/health")
def health():
    data = json.dumps({"status": "ok"})
    return Response(data, mimetype="application/json"), 200
