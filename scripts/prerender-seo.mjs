// Post-build SEO/GEO step: writes standalone, crawlable HTML pages (real paths,
// not #/hash routes) plus sitemap.xml and llms.txt into dist/.
//   /templates/            hub listing every template
//   /templates/<id>/       one page per template with its Mermaid source
//   /formats/              supported source formats
//   /studio/               what the studio is, with a link into the app
// Each page links into the single-page app, which stays the interactive product.
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { DIAGRAM_TEMPLATES } from "../src/components/templates.js";
import { FORMATS } from "../src/lib/formats.js";
import { FAQS } from "../src/data/content.js";

const SITE = (process.env.SITE_URL || "https://muhamadzolfaghari.github.io/node-flow").replace(/\/+$/, "");
const DIST = path.resolve("dist");
const TODAY = new Date().toISOString().slice(0, 10);
const APP = `${SITE}/#/studio`;

try {
  await access(DIST);
} catch {
  console.error("dist/ not found. Run `vite build` first.");
  process.exit(1);
}

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const clip = (text, max) => (text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`);
const cleanTitle = (title) => title.replace(/^\d+\.\s*/, "").replace(/\s*\([^)]*\)\s*$/, "");

const STYLE = `
:root{color-scheme:dark light;--bg:#0c1017;--fg:#e9edf4;--card:#111722;--muted:#96a4b8;--primary:#5e8cfa;--border:#263143;--code:#0a0e15}
@media (prefers-color-scheme:light){:root{--bg:#f6f8fb;--fg:#0f172a;--card:#fff;--muted:#526179;--primary:#2f5fd8;--border:#d8dfea;--code:#f1f4f9}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.65 Inter,system-ui,-apple-system,Segoe UI,sans-serif}
a{color:var(--primary)}header,main,footer{max-width:960px;margin:0 auto;padding:20px}
header{display:flex;align-items:center;gap:16px;border-bottom:1px solid var(--border)}header strong{font-size:18px}
nav a{margin-right:16px;text-decoration:none;font-size:14px;color:var(--muted)}nav a:hover{color:var(--fg)}
h1{font-size:2rem;line-height:1.2;margin:.4em 0}h2{margin-top:2em;font-size:1.25rem}
.lede{color:var(--muted);font-size:1.1rem}.btn{display:inline-block;background:var(--primary);color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600}
.btn.alt{background:transparent;color:var(--fg);border:1px solid var(--border)}
pre{background:var(--code);border:1px solid var(--border);border-radius:8px;padding:16px;overflow:auto;font:13px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace}
ul.grid{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
ul.grid li{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px}ul.grid a{font-weight:600;text-decoration:none}
ul.grid p{margin:.4em 0 0;color:var(--muted);font-size:14px}.crumbs{font-size:13px;color:var(--muted)}footer{color:var(--muted);font-size:13px;border-top:1px solid var(--border);margin-top:40px}
`;

function shell({ title, description, urlPath, body, jsonld = [] }) {
  const url = `${SITE}${urlPath}`;
  const graph = { "@context": "https://schema.org", "@graph": jsonld };
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(clip(description, 160))}">
<link rel="canonical" href="${url}">
<link rel="icon" type="image/svg+xml" href="${SITE}/favicon.svg">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0c1017">
<meta property="og:type" content="website">
<meta property="og:site_name" content="NodeFlow">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(clip(description, 200))}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="NodeFlow — source, canvas, and AI editing the same diagram">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(clip(description, 200))}">
<meta name="twitter:image" content="${SITE}/og-image.png">
<script type="application/ld+json">${JSON.stringify(graph)}</script>
<style>${STYLE}</style>
</head>
<body>
<header><strong>NodeFlow</strong><nav aria-label="Main"><a href="${SITE}/">Home</a><a href="${SITE}/templates/">Templates</a><a href="${SITE}/formats/">Formats</a><a href="${APP}">Open studio</a></nav></header>
<main>
${body}
</main>
<footer>NodeFlow is open source under the MIT license. Projects are stored in your browser. <a href="${SITE}/">Home</a></footer>
</body>
</html>
`;
}

const crumbs = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, urlPath], index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    item: `${SITE}${urlPath}`,
  })),
});

async function write(urlPath, html) {
  const dir = path.join(DIST, urlPath.replace(/^\/+/, ""));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), html);
}

const urls = [{ loc: `${SITE}/`, priority: "1.0" }];

// ---- template pages
const byCategory = new Map();
for (const t of DIAGRAM_TEMPLATES) {
  if (!byCategory.has(t.category)) byCategory.set(t.category, []);
  byCategory.get(t.category).push(t);
}

for (const t of DIAGRAM_TEMPLATES) {
  const name = cleanTitle(t.title);
  const urlPath = `/templates/${t.id}/`;
  const related = (byCategory.get(t.category) || []).filter((x) => x.id !== t.id).slice(0, 6);
  const title = `${name} template — editable diagram | NodeFlow`;
  const suffix = " Edit it in NodeFlow.";
  const description = t.description.length + suffix.length <= 160 ? `${t.description}${suffix}` : t.description;
  const body = `
<p class="crumbs"><a href="${SITE}/templates/">Templates</a> › ${esc(t.category)}</p>
<h1>${esc(name)}</h1>
<p class="lede">${esc(t.description)}</p>
<p><a class="btn" href="${SITE}/#/studio?template=${encodeURIComponent(t.id)}">Open this template in NodeFlow</a>
<a class="btn alt" href="${SITE}/templates/">All templates</a></p>
<h2>Diagram source (Mermaid)</h2>
<p>This is the exact source the template starts from. Edit it in the studio and the canvas updates as you type.</p>
<pre><code>${esc(t.code.trim())}</code></pre>
<h2>How to use it</h2>
<ol><li>Open the template in the studio.</li><li>Change the source or select shapes on the canvas to rename, restyle, and connect them.</li><li>Export as SVG, PNG, PDF, PPTX, or standalone HTML, or keep it as a project in your browser.</li></ol>
${related.length ? `<h2>Related templates in ${esc(t.category)}</h2><ul class="grid">${related.map((r) => `<li><a href="${SITE}/templates/${r.id}/">${esc(cleanTitle(r.title))}</a><p>${esc(clip(r.description, 110))}</p></li>`).join("")}</ul>` : ""}`;
  await write(
    urlPath,
    shell({
      title,
      description,
      urlPath,
      body,
      jsonld: [
        crumbs([["Home", "/"], ["Templates", "/templates/"], [name, urlPath]]),
        {
          "@type": "SoftwareSourceCode",
          name,
          description: t.description,
          programmingLanguage: "Mermaid",
          codeSampleType: "full solution",
          text: t.code.trim(),
          url: `${SITE}${urlPath}`,
          isPartOf: { "@type": "WebApplication", name: "NodeFlow", url: `${SITE}/` },
          license: "https://opensource.org/licenses/MIT",
        },
      ],
    }),
  );
  urls.push({ loc: `${SITE}${urlPath}`, priority: "0.7" });
}

// ---- templates hub
{
  const urlPath = "/templates/";
  const sections = [...byCategory.entries()]
    .map(
      ([category, items]) => `<h2>${esc(category)}</h2><ul class="grid">${items
        .map((t) => `<li><a href="${SITE}/templates/${t.id}/">${esc(cleanTitle(t.title))}</a><p>${esc(clip(t.description, 120))}</p></li>`)
        .join("")}</ul>`,
    )
    .join("\n");
  await write(
    urlPath,
    shell({
      title: `${DIAGRAM_TEMPLATES.length} diagram templates for UML, architecture, data, and planning | NodeFlow`,
      description: `Browse ${DIAGRAM_TEMPLATES.length} editable diagram templates: UML, cloud architecture, ER schemas, flowcharts, roadmaps, and role-based workflows. Open any template in NodeFlow.`,
      urlPath,
      body: `<h1>Diagram templates</h1><p class="lede">${DIAGRAM_TEMPLATES.length} ready-to-edit templates across ${byCategory.size} categories. Each opens in the NodeFlow studio with source and canvas side by side.</p><p><a class="btn" href="${SITE}/#/templates">Browse in the app</a></p>${sections}`,
      jsonld: [
        crumbs([["Home", "/"], ["Templates", urlPath]]),
        {
          "@type": "ItemList",
          name: "NodeFlow diagram templates",
          numberOfItems: DIAGRAM_TEMPLATES.length,
          itemListElement: DIAGRAM_TEMPLATES.map((t, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE}/templates/${t.id}/`,
            name: cleanTitle(t.title),
          })),
        },
      ],
    }),
  );
  urls.push({ loc: `${SITE}${urlPath}`, priority: "0.9" });
}

// ---- formats hub
{
  const urlPath = "/formats/";
  const rows = FORMATS.map(
    (f) => `<tr><td>${esc(f.name)}</td><td>${esc((f.extensions || [f.ext]).map((e) => `.${String(e).replace(/^\./, "")}`).join(", "))}</td><td>${esc(f.mode)}</td><td>${esc(f.description)}</td></tr>`,
  ).join("");
  await write(
    urlPath,
    shell({
      title: `${FORMATS.length} supported diagram and data formats | NodeFlow`,
      description: `NodeFlow opens and edits ${FORMATS.length} source formats including Mermaid, PlantUML, Graphviz DOT, Draw.io, D2, SQL, OpenAPI, and more, with documented conversion limits.`,
      urlPath,
      body: `<h1>Supported formats</h1><p class="lede">${FORMATS.length} source formats. “Native” formats render directly; others are converted to an editable preview, and the original source stays recoverable.</p><p><a class="btn" href="${SITE}/#/formats">See details in the app</a></p><table style="width:100%;border-collapse:collapse;font-size:14px" border="0"><thead><tr><th align="left">Format</th><th align="left">Extensions</th><th align="left">Mode</th><th align="left">What it covers</th></tr></thead><tbody>${rows}</tbody></table>`,
      jsonld: [crumbs([["Home", "/"], ["Formats", urlPath]])],
    }),
  );
  urls.push({ loc: `${SITE}${urlPath}`, priority: "0.8" });
}

// ---- studio page (+ FAQ answers, mirrored from the landing page FAQ)
{
  const urlPath = "/studio/";
  await write(
    urlPath,
    shell({
      title: "NodeFlow Studio — edit diagrams from source, canvas, and AI",
      description: "The NodeFlow studio: a code editor with live error markers, a canvas you can edit directly, AI proposals you review, themes, and exports to SVG, PNG, PDF, and PPTX.",
      urlPath,
      body: `<h1>NodeFlow Studio</h1><p class="lede">Edit one diagram three ways: write source, adjust shapes on the canvas, or describe it to the assistant and review the proposal before it changes your file.</p><p><a class="btn" href="${APP}">Open the studio</a></p>
<h2>Frequently asked questions</h2>${FAQS.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}`,
      jsonld: [
        crumbs([["Home", "/"], ["Studio", urlPath]]),
        {
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        },
      ],
    }),
  );
  urls.push({ loc: `${SITE}${urlPath}`, priority: "0.9" });
}

// ---- sitemap.xml
await writeFile(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${TODAY}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`,
);

// ---- llms.txt (answer-first, accurate, with every template)
await writeFile(
  path.join(DIST, "llms.txt"),
  `# NodeFlow

> NodeFlow is an open-source (MIT) browser workspace for creating and editing diagrams. Source code, a live canvas, and an AI assistant edit the same diagram. Projects are stored in the browser; there is no NodeFlow backend or account.

## Key facts
- ${FORMATS.length} source formats (Mermaid and Graphviz render natively; others convert to an editable preview).
- ${DIAGRAM_TEMPLATES.length} starter templates for UML, architecture, data models, planning, and role-based workflows.
- AI engines: deterministic (offline), local WebGPU model, Ollama, Gemini, and OpenAI-compatible APIs. Cloud engines send the submitted prompt (and the active file when inserting) to the provider you choose; the other engines do not use a cloud service.
- Exports: SVG, PNG, PDF, PPTX, standalone HTML, source files, project backups.
- Themes: Studio Dark, Light, Midnight, Nord, High contrast, or match system.

## Pages
- App: ${SITE}/
- Studio: ${SITE}/studio/
- Templates: ${SITE}/templates/
- Formats: ${SITE}/formats/
- Source code: https://github.com/muhamadzolfaghari/node-flow

## Templates
${DIAGRAM_TEMPLATES.map((t) => `- [${cleanTitle(t.title)}](${SITE}/templates/${t.id}/): ${clip(t.description, 140)}`).join("\n")}

## FAQ
${FAQS.map((f) => `**${f.q}** ${f.a}`).join("\n\n")}
`,
);

console.log(`SEO pages written: ${urls.length} URLs (${DIAGRAM_TEMPLATES.length} template pages) -> dist/sitemap.xml, dist/llms.txt`);
