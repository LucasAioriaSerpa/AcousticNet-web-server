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
