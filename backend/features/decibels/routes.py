
import json

from flask import Blueprint, Response, request

from features.decibels.repository import insert_decibel, list_decibels, latest_decibel

decibels_bp = Blueprint('decibels', __name__)

@decibels_bp.route("/api/decibels", methods=["POST"])
def receive_decibels():
    try:
        body = request.get_data(as_text=True)
        dados = json.loads(body)
        value = dados.get("value")
        if value is None:
            return Response(
                json.dumps({"error": "field 'value' missing"}),
                mimetype="application/json"
            ), 400
        insert_decibel(float(value))
        return Response(
            json.dumps({"status": "ok", "value": value}),
            mimetype="application/json"
        ), 201
    except Exception as e:
        return Response(
            json.dumps({"error": str(e)}),
            mimetype="application/json"
        ), 500

@decibels_bp.route("/api/decibels", methods=["GET"])
def get_decibels():
    try:
        limit = int(request.args.get("limit", 50))
        rows = list_decibels(limit)
        data = json.dumps([{"value": r[0], "timestamp": r[1]} for r in rows])
        return Response(data, mimetype="application/json"), 200
    except Exception as e:
        return Response(
            json.dumps({"error": str(e)}),
            mimetype="application/json"
        ), 500

@decibels_bp.route("/api/decibels/latest", methods=["GET"])
def get_latest():
    row = latest_decibel()
    if not row:
        return Response(
            json.dumps({"value": None, "timestamp": None}),
            mimetype="application/json"
        ), 200
    data = json.dumps({"value": row[0], "timestamp": row[1]})
    return Response(data, mimetype="application/json"), 200
