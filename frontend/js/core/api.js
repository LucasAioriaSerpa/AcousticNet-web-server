// ============================================================
// Rotas da API e helper de fetch compartilhado
// ============================================================

export const routes = {
  api: "/api/",
  hello: "/api/hello",
  health: "/api/health",
  decibels: "/api/decibels",
};

export async function fetchData(pathAPI) {
  try {
    const response = await fetch(pathAPI);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}
