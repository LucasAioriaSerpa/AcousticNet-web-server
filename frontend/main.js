try {
  fetch("/api/hello")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("resposta").textContent = JSON.stringify(
        data,
        null,
        2,
      );
    });
} catch (error) {
  document.getElementById("resposta").textContent = JSON.stringify(
    error,
    null,
    2,
  );
}
