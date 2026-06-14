
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, Response

from database import init_db
from features.health.routes import health_bp
from features.decibels.routes import decibels_bp

app = Flask(__name__)

app.register_blueprint(health_bp)
app.register_blueprint(decibels_bp)

@app.errorhandler(404)
def not_found(e):
    return Response(
        json.dumps({"error": ["route not found", e], "status": 404}),
        mimetype="application/json"
    ), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return Response(
        json.dumps({"error": ["method not allowed", e], "status": 405}),
        mimetype="application/json"
    ), 405

if __name__ == '__main__':
    init_db()
    app.run(host="0.0.0.0", port=5000, threaded=True)
