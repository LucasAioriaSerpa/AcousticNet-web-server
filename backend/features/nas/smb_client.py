# -*- coding: utf-8 -*-

from smb.SMBConnection import SMBConnection
import io

NAS_SERVER = "192.168.0.100"
NAS_PORT = 445

SHARES = {
    "fonogramas": "Beatles_fonogramas",
    "partituras": "Beatles-partituras",
    "composicoes": "Beatles-composicoes",
}

def _friendly_error(e):
    msg = str(e)
    upper = msg.upper()
    if "ACCESS_DENIED" in upper:
        return "Permissão negada — seu usuário não tem acesso de escrita nesta pasta"
    if "OBJECT_NAME_NOT_FOUND" in upper or "OBJECT_PATH_NOT_FOUND" in upper:
        return "Arquivo ou pasta não encontrado no NAS"
    if "DISK_FULL" in upper:
        return "Sem espaço disponível no NAS"
    if "SHARING_VIOLATION" in upper:
        return "Arquivo em uso por outro processo no NAS"
    first_line = msg.split("\n")[0]
    return first_line[:120]

def get_connection(username, password):
    conn = SMBConnection(
        username, password,
        "acousticnet-web", "nas",
        use_ntlm_v2=True, is_direct_tcp=True
    )
    try:
        connected = conn.connect(NAS_SERVER, NAS_PORT, timeout=10)
    except Exception:
        return None
    if not connected:
        return None
    return conn

def list_files(username, password, folder_key):
    share = SHARES.get(folder_key)
    if not share:
        return None
    conn = get_connection(username, password)
    if not conn:
        return None
    try:
        entries = conn.listPath(share, "/")
        files = []
        for e in entries:
            if e.filename in (".", ".."):
                continue
            files.append({
                "name": e.filename,
                "is_dir": e.isDirectory,
                "size": e.file_size
            })
        return files
    finally:
        conn.close()

def download_file(username, password, folder_key, filename):
    share = SHARES.get(folder_key)
    if not share: return None
    conn = get_connection(username, password)
    if not conn: return None
    try:
        file_obj = io.BytesIO()
        conn.retrieveFile(share, "/" + filename, file_obj)
        file_obj.seek(0)
        return file_obj
    except Exception: return None
    finally: conn.close()

def upload_file(username, password, folder_key, filename, file_stream):
    share = SHARES.get(folder_key)
    if not share: return False, "pasta inválida"
    conn = get_connection(username, password)
    if not conn: return False, "falha na conexão SMB"
    try:
        conn.storeFile(share, "/" + filename, file_stream)
        return True, None
    except Exception as e: return False, _friendly_error(e)
    finally: conn.close()

def delete_file(username, password, folder_key, filename):
    share = SHARES.get(folder_key)
    if not share: return False, "pasta inválida"
    conn = get_connection(username, password)
    if not conn: return False, "falha na conexão SMB"
    try:
        conn.deleteFiles(share, "/" + filename)
        return True, None
    except Exception as e: return False, _friendly_error(e)
    finally: conn.close()
