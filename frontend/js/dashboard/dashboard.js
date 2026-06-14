// ============================================================
//? Dashboard — gráfico de decibéis + status do sistema
// ============================================================

import { routes, fetchData } from "../core/api.js";

let graph = null;

export function initDashboard() {
  const canvas = document.getElementById("graph_decibels");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  graph = new Chart(ctx, {
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
  updateGraph();
  updateStatus();
  setInterval(updateGraph, 3000);
  setInterval(updateStatus, 5000);
}

async function updateGraph() {
  const datas = await fetchData(routes.decibels);
  if (!datas || !Array.isArray(datas)) return;
  const inverted = [...datas].reverse();
  graph.data.labels = inverted.map((d) => d.timestamp.slice(11, 19));
  graph.data.datasets[0].data = inverted.map((d) => d.value);
  graph.update();
  if (inverted.length > 0) {
    const last = inverted[inverted.length - 1];
    setText("db_now", `${last.value.toFixed(1)} dB`);
    setText("db_time", `última leitura: ${last.timestamp.slice(11, 19)}`);
  } else {
    setText("db_now", "— dB");
    setText("db_time", "aguardando leitura");
  }
}

async function updateStatus() {
  const dot = document.getElementById("status_dot");
  const statusText = document.getElementById("status_text");
  const health = await fetchData(routes.health);
  if (health && health.status === "ok") {
    if (dot) {
      dot.classList.add("online");
      dot.classList.remove("offline");
    }
    if (statusText) statusText.textContent = "Conectado";
    setText("backend_status", "Online");
    setText("backend_sub", "respondendo normalmente");
  } else {
    if (dot) {
      dot.classList.add("offline");
      dot.classList.remove("online");
    }
    if (statusText) statusText.textContent = "Sem conexão";
    setText("backend_status", "Offline");
    setText("backend_sub", "sem resposta do servidor");
  }

  const hello = await fetchData(routes.hello);
  if (hello) {
    setText("db_status", hello.banco === "vazio" ? "Vazio" : "Conectado");
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
