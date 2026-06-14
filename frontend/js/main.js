// ============================================================
// AcousticNet — Entry point
// ============================================================

import { initNavigation } from "./core/navigation.js";
import { initDashboard } from "./dashboard/dashboard.js";
import { initNAS } from "./NAS/nas.js";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initDashboard();
  initNAS();
});
