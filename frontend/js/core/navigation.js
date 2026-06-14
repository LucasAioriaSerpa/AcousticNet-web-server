// ============================================================
//? Navegação entre páginas (sidebar desktop + bottombar mobile)
// ============================================================

export function initNavigation() {
  const menuItems = document.querySelectorAll(".menu__item, .bottom-nav__item");
  const pages = document.querySelectorAll(".page");
  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetPageId = item.getAttribute("data-page");
      menuItems.forEach((m) => m.classList.remove("active"));
      pages.forEach((p) => p.classList.remove("active"));
      document
        .querySelectorAll(`[data-page="${targetPageId}"]`)
        .forEach((btn) => btn.classList.add("active"));
      const targetPage = document.getElementById(`page-${targetPageId}`);
      if (targetPage) targetPage.classList.add("active");
    });
  });
}
