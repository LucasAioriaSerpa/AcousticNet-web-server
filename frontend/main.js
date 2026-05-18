// fetch("/api/hello")
//   .then((response) => {
//     if (!response.ok) {
//       document.getElementById("status_backend").textContent =
//         `Status: ${response.status}`;
//       throw new Error("HTTP error!");
//     }
//     response.json();
//   })
//   .then((data) => {
//     document.getElementById("resposta").textContent = JSON.stringify(
//       data,
//       null,
//       2,
//     );
//   })
//   .catch((error) => {
//     document.getElementById("resposta").textContent = error.message;
//     console.error("Fetch error: ", error.message);
//   });

// async function fetchData() {
//   try {
//     const response = await fetch('https://api.example.com/data');
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const data = await response.json();
//     console.log(data);
//   } catch (error) {
//     console.error('Fetch error:', error);
//   }
// }

const routes = {
  api: "/api/",
  hello: "/api/hello",
  health: "/api/health",
};

async function fetchData() {
  try {
    const response = await fetch("/api/hello");
    if (!response.ok) {
      throw new Error(`HTTP error!\n Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(`Fetch error:`, error);
  }
}
