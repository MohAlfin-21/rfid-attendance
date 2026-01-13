let demoMode = false;
let toggleFlag = false;

export function initDemoModeFromDB(value) {
  demoMode = value === "true";
}

export function isDemoMode() {
  return demoMode;
}

export function toggleDemoMode() {
  demoMode = !demoMode;
  return demoMode;
}

export function getDemoStatus() {
  toggleFlag = !toggleFlag;
  return toggleFlag ? "on_time" : "late";
}
