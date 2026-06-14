// ============================================================
//? NAS — Login, browser de arquivos, upload e download
// ============================================================

let nasCurrentFolder = "fonogramas";

export function initNAS() {
  const loginForm = document.getElementById("nas_login_form");
  const uploadForm = document.getElementById("nas_upload_form");
  const logoutBtn = document.getElementById("nas_logout_btn");
  const tabs = document.querySelectorAll(".folder__tab");
  if (!loginForm) return;
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("nas_username").value.trim();
    const password = document.getElementById("nas_password").value;
    nasLogin(username, password);
  });
  if (logoutBtn) {
    logoutBtn.addEventListener("click", nasLogout);
  }
  if (uploadForm) {
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fileInput = document.getElementById("nas_upload_input");
      if (!fileInput || fileInput.files.length === 0) return;
      nasUpload(nasCurrentFolder, fileInput.files[0]);
      fileInput.value = "";
    });
  }
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      nasLoadFiles(tab.dataset.folder);
    });
  });
  nasUpdateUI();
}

// ------------------------------------------------------------
//* Credenciais (sessionStorage — só dura enquanto a aba estiver aberta)
// ------------------------------------------------------------
function nasGetCreds() {
  return {
    user: sessionStorage.getItem("nas_user"),
    pass: sessionStorage.getItem("nas_pass"),
  };
}
function nasIsLoggedIn() {
  const { user, pass } = nasGetCreds();
  return !!(user && pass);
}

// ------------------------------------------------------------
//* UI
// ------------------------------------------------------------
function nasUpdateUI() {
  const loginPanel = document.getElementById("nas_login_panel");
  const browser = document.getElementById("nas_browser");
  const badge = document.getElementById("nas_user_badge");
  if (nasIsLoggedIn()) {
    loginPanel.classList.add("hidden");
    browser.classList.remove("hidden");
    if (badge) badge.textContent = sessionStorage.getItem("nas_user");
    nasLoadFiles(nasCurrentFolder);
  } else {
    loginPanel.classList.remove("hidden");
    browser.classList.add("hidden");
    if (badge) badge.textContent = "não autenticado";
  }
}

// ------------------------------------------------------------
//* Login / Logout
// ------------------------------------------------------------
async function nasLogin(username, password) {
  const errorEl = document.getElementById("nas_login_error");
  errorEl.textContent = "";
  errorEl.classList.remove("success");
  try {
    const res = await fetch("/api/nas/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      errorEl.textContent = data.error || "Falha no login";
      return;
    }
    sessionStorage.setItem("nas_user", username);
    sessionStorage.setItem("nas_pass", password);
    nasUpdateUI();
  } catch (err) {
    errorEl.textContent = "Erro de conexão com o servidor";
    console.error("NAS login error:", err);
  }
}

function nasLogout() {
  sessionStorage.removeItem("nas_user");
  sessionStorage.removeItem("nas_pass");
  nasUpdateUI();
}

// ------------------------------------------------------------
//* Listagem de arquivos
// ------------------------------------------------------------
async function nasLoadFiles(folder) {
  nasCurrentFolder = folder;
  const list = document.getElementById("nas_file_list");
  list.innerHTML = '<li class="file__empty">Carregando...</li>';
  const { user, pass } = nasGetCreds();
  try {
    const res = await fetch(`/api/nas/files/${folder}`, {
      headers: { "X-NAS-User": user, "X-NAS-Pass": pass },
    });
    const data = await res.json();
    if (!res.ok) {
      list.innerHTML = `<li class="file__empty">${data.error || "Erro ao listar arquivos"}</li>`;
      return;
    }
    const visible = data.filter((f) => !f.is_dir);
    if (visible.length === 0) {
      list.innerHTML =
        '<li class="file__empty">Nenhum arquivo nesta pasta</li>';
      return;
    }
    list.innerHTML = "";
    visible.forEach((file) => {
      const li = document.createElement("li");
      li.className = "file__row";
      li.innerHTML = `
        <span class="file__name">${file.name}</span>
        <span class="file__size">${(file.size / 1024).toFixed(1)} KB</span>
        <a class="file__download" data-filename="${file.name}">▾ Baixar</a>
      `;
      list.appendChild(li);
    });
    list.querySelectorAll(".file__download").forEach((btn) => {
      btn.addEventListener("click", () =>
        nasDownload(folder, btn.dataset.filename),
      );
    });
  } catch (err) {
    list.innerHTML = '<li class="file__empty">Erro de conexão</li>';
    console.error("NAS list error:", err);
  }
}

// ------------------------------------------------------------
//* Download
// ------------------------------------------------------------
async function nasDownload(folder, filename) {
  const { user, pass } = nasGetCreds();
  try {
    const res = await fetch(
      `/api/nas/download/${folder}/${encodeURIComponent(filename)}`,
      { headers: { "X-NAS-User": user, "X-NAS-Pass": pass } },
    );
    if (!res.ok) {
      alert("Erro ao baixar arquivo");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("Erro de conexão ao baixar");
    console.error("NAS download error:", err);
  }
}

// ------------------------------------------------------------
//* Upload
// ------------------------------------------------------------
async function nasUpload(folder, file) {
  const statusEl = document.getElementById("nas_upload_status");
  statusEl.textContent = "Enviando...";
  statusEl.classList.remove("success");
  const { user, pass } = nasGetCreds();
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch(`/api/nas/upload/${folder}`, {
      method: "POST",
      headers: { "X-NAS-User": user, "X-NAS-Pass": pass },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      statusEl.textContent = data.error || "Erro no upload";
      return;
    }
    statusEl.textContent = `"${data.filename}" enviado com sucesso!`;
    statusEl.classList.add("success");
    nasLoadFiles(folder);
  } catch (err) {
    statusEl.textContent = "Erro de conexão no upload";
    console.error("NAS upload error:", err);
  }
}
