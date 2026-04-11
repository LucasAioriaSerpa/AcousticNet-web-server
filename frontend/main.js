fetch("/api/hello")
  .then((response) => {
    if (!response.ok) {
      document.getElementById("status_backend").textContent =
        `Status: ${response.status}`;
      throw new Error("HTTP error!");
    }
  })
  .then((data) => {
    document.getElementById("resposta").textContent = JSON.stringify(
      data,
      null,
      2,
    );
  })
  .catch((error) => {
    document.getElementById("resposta").textContent = error.message;
    console.error("Fetch error: ", error.message);
  });
