const routes = {
  api: "/api/",
  hello: "/api/hello",
  health: "/api/health",
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
    return error;
  }
}

async function fetchHelloWorld() {
	try{
		const data = await fetchData(routes[hello]);
		document.getElementById("status_backend").textContent = "Status: Conectado ao backend";
		document.getElementById("resposta").textContent = JSON.stringify(data, null, 2);
		console.log("Dados recebida:", data);
	} catch (error) {
		document.getElementById("status_backend").textContent = "Status: Falha na conexão.";
		document.getElementById("resposta").textContent = error.message;
		console.erro(`Fetch error:`, error);
	}
}

fetchData(routes[api]);
fetchData(routes[health]);
fetchHelloWorld();

