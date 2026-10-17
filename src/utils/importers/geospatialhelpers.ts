export function getGeomIcon(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("point")) return "📍";
  if (t.includes("line")) return "🛣️";
  if (t.includes("poly")) return "🗺️";
  if (t.includes("tile") || t.includes("mvt") || t.includes("pbf")) return "🧱";
  return "🌐";
}

export function escapeLabel(text) {
  return String(text || "")
    .replace(/"/g, "'")
    .replace(/[<>]/g, "");
}
// @ts-nocheck
