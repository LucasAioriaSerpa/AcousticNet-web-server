
m flask import Blueprint, Response, request, send_file
import json
from features.nas.smb_client import (
    get_connection, list_files, download_file, upload_file, SHARES
)

nas_bp = Blueprint('nas', __name__)

def _get_credentials():
    """Lê credenciais enviadas via headers customizados."""
    username = request.headers.get("X-NAS-User")
    password = request.headers.get("X-NAS-Pass")
    return username, password

@nas_bp.route("/api/nas/login", methods=["POST"])
def nas_login():
    body = request.get_data(as_text=True)
    data = json.loads(body)
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return Response(
            json.dumps({"error": "usuário e senha são obrigatórios"}),
            mimetype="application/json"
        ), 400

    conn = get_connection(username, password)
    if not conn:
        return Response(
            json.dumps({"error": "usuário ou senha inválidos"}),
            mimetype="application/json"
        ), 401
    conn.close()

    return Response(
        json.dumps({"status": "ok", "user": username}),
        mimetype="application/json"
    ), 200

@nas_bp.route("/api/nas/folders", methods=["GET"])
def nas_folders():
    return Response(
        json.dumps(list(SHARES.keys())),
        mimetype="application/json"
    ), 200

@nas_bp.route("/api/nas/files/<folder>", methods=["GET"])
def nas_list(folder):
    username, password = _get_credentials()
    if not username or not password:
        return Response(json.dumps({"error": "não autenticado"}), mimetype="application/json"), 401

    files = list_files(username, password, folder)
    if files is None:
        return Response(json.dumps({"error": "falha ao acessar a pasta"}), mimetype="application/json"), 400

    return Response(json.dumps(files), mimetype="application/json"), 200

@nas_bp.route("/api/nas/download/<folder>/<path:filename>", methods=["GET"])
def nas_download(folder, filename):
    username, password = _get_credentials()
    if not username or not password:
        return Response(json.dumps({"error": "não autenticado"}), mimetype="application/json"), 401

    file_obj = download_file(username, password, folder, filename)
    if file_obj is None:
        return Response(json.dumps({"error": "arquivo não encontrado"}), mimetype="application/json"), 404

    return send_file(
        file_obj,
        as_attachment=True,
        attachment_filename=filename,
        mimetype="application/octet-stream"
    )

@nas_bp.route("/api/nas/upload/<folder>", methods=["POST"])
def nas_upload(folder):
    username, password = _get_credentials()
    if not username or not password:
        return Response(json.dumps({"error": "não autenticado"}), mimetype="application/json"), 401

    if "file" not in request.files:
        return Response(json.dumps({"error": "nenhum arquivo enviado"}), mimetype="application/json"), 400

    f = request.files["file"]
    ok = upload_file(username, password, folder, f.filename, f.stream)
    if not ok:
        return Response(json.dumps({"error": "falha no upload"}), mimetype="application/json"), 500

    return Response(json.dumps({"status": "ok", "filename": f.filename}), mimetype="application/json"), 201

