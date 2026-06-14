document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".menu__item, .bottom-nav__item");
  const pages = document.querySelectorAll(".page");
  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetPageId = item.getAttribute("data-page");
      menuItems.forEach((m) => m.classList.remove("active"));
      pages.forEach((p) => p.classList.remove("active"));
      document
        .querySelectorAll(`[data-page="${targetPageId}"]`)
        .forEach((btn) => {
          btn.classList.add("active");
        });
      const targetPage = document.getElementById(`page-${targetPageId}`);
      if (targetPage) {
        targetPage.classList.add("active");
      }
    });
  });
});

// ================================================================================
//?    routes & Graph logic
// ================================================================================

const routes = {
  api: "/api/",
  hello: "/api/hello",
  health: "/api/health",
  decibels: "/api/decibels",
};

async function fetchData(pathAPI) {
  try {
    const response = await fetch(pathAPI);
    if (!response.ok) {
      throw new Error(`HTTP error!\n Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Fetch error:`, error);
    return null;
  }
}

// async function fetchHelloWorld() {
//   try {
//     const data = await fetchData(routes["hello"]);
//     document.getElementById("status_backend").textContent =
//       "Status: Conectado ao backend";
//     document.getElementById("resposta").textContent = JSON.stringify(
//       data,
//       null,
//       2,
//     );
//     console.log("Dados recebida:", data);
//   } catch (error) {
//     document.getElementById("status_backend").textContent =
//       "Status: Falha na conexão.";
//     document.getElementById("resposta").textContent = error.message;
//     console.error(`Fetch error:`, error);
//   }
//}

const ctx = document.getElementById("graph_decibels").getContext("2d");
const graph = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Decibéis (dB)",
        data: [],
        borderColor: "#4fc3f7",
        backgroundColor: "#4fc3f71a",
        tension: 0.3,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, max: 120 },
    },
  },
});

async function updateGraph() {
  const datas = await fetchData(routes["decibels"]);
  if (!datas || !Array.isArray(datas)) return;
  const inverted = [...datas].reverse();
  graph.data.labels = inverted.map((d) => d.timestamp.slice(11, 19));
  graph.data.datasets[0].data = inverted.map((d) => d.value);
  graph.update();
}

////fetchHelloWorld();
updateGraph();
setInterval(updateGraph, 3000); //? Atualiza a cada 3 segundos...

// ============================================================
//? NAS — Login, browser, upload, download
// ============================================================

let nasCurrentFolder = "fonogramas";

function nasGetCreds() {
  const user = sessionStorage.getItem("nas_user");
  const pass = sessionStorage.getItem("nas_pass");
  return { user, pass };
}

function nasIsLoggedIn() {
  const { user, pass } = nasGetCreds();
  return !!(user && pass);
}

function nasUpdateUI() {
  const loginPanel = document.getElementById("nas_login_panel");
  const browser = document.getElementById("nas_browser");
  const badge = document.getElementById("nas_user_badge");

  if (nasIsLoggedIn()) {
    loginPanel.classList.add("hidden");
    browser.classList.remove("hidden");
    badge.textContent = sessionStorage.getItem("nas_user");
    nasLoadFiles(nasCurrentFolder);
  } else {
    loginPanel.classList.remove("hidden");
    browser.classList.add("hidden");
    badge.textContent = "não autenticado";
  }
}

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

    if (!data.length) {
      list.innerHTML =
        '<li class="file__empty">Nenhum arquivo nesta pasta</li>';
      return;
    }

    list.innerHTML = "";
    data.forEach((file) => {
      if (file.is_dir) return;
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

async function nasDownload(folder, filename) {
  const { user, pass } = nasGetCreds();
  try {
    const res = await fetch(
      `/api/nas/download/${folder}/${encodeURIComponent(filename)}`,
      {
        headers: { "X-NAS-User": user, "X-NAS-Pass": pass },
      },
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

// ============================================================
//? NAS — Event bindings (executado uma vez no carregamento)
// ============================================================
document.getElementById("nas_login_form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("nas_username").value.trim();
  const password = document.getElementById("nas_password").value;
  nasLogin(username, password);
});

document.getElementById("nas_logout_btn").addEventListener("click", nasLogout);

document.getElementById("nas_upload_form").addEventListener("submit", (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("nas_upload_input");
  if (fileInput.files.length === 0) return;
  nasUpload(nasCurrentFolder, fileInput.files[0]);
  fileInput.value = "";
});

document.querySelectorAll(".folder__tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".folder__tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    nasLoadFiles(tab.dataset.folder);
  });
});

nasUpdateUI();
