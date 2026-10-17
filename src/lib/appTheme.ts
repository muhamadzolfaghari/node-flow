// App-wide colour themes. The palettes live in index.css under
// :root[data-app-theme="…"]; this module only picks and persists the choice.
export const APP_THEME_KEY = "nodeflow_app_theme";

export const APP_THEMES = [
  { id: "auto", label: "Match system", swatch: ["#0c1017", "#f6f8fb"], dark: null },
  { id: "studio", label: "Studio Dark", swatch: ["#0c1017", "#5e8cfa"], dark: true },
  { id: "light", label: "Light", swatch: ["#f6f8fb", "#2f5fd8"], dark: false },
  { id: "midnight", label: "Midnight", swatch: ["#070a16", "#8493ff"], dark: true },
  { id: "nord", label: "Nord", swatch: ["#2e3440", "#88c0d0"], dark: true },
  { id: "contrast", label: "High contrast", swatch: ["#000000", "#ffd400"], dark: true },
];

/** The canvas/diagram theme that pairs naturally with an app theme. */
export const DIAGRAM_THEME_FOR = { studio: "dark", light: "default", midnight: "tokyo-night", nord: "nord", contrast: "dark" };

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(APP_THEME_KEY);
    return APP_THEMES.some((t) => t.id === stored) ? stored : "auto";
  } catch {
    return "auto";
  }
}

export function resolveTheme(id) {
  if (id !== "auto") return id;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "studio";
}

export function applyTheme(id) {
  const resolved = resolveTheme(id);
  const root = document.documentElement;
  if (resolved === "studio") root.removeAttribute("data-app-theme");
  else root.setAttribute("data-app-theme", resolved);
  return resolved;
}

export function setTheme(id) {
  try {
    localStorage.setItem(APP_THEME_KEY, id);
  } catch {}
  const resolved = applyTheme(id);
  window.dispatchEvent(new CustomEvent("nodeflow-theme", { detail: { id, resolved } }));
  return resolved;
}
