# NodeFlow — Visual Diagram & Mind Map Studio

**Create, edit, validate, and convert diagrams in your browser.** NodeFlow combines a Mermaid editor and canvas with focused converters for common diagram and technical formats.

**[Open the live demo](https://muhamadzolfaghari.github.io/mermaid-studio/)** · **[View the source](https://github.com/muhamadzolfaghari/node-flow)**

![NodeFlow landing page](./screenshots/ui/01-landing-hero.png)

| Diagram editor | AI assistant |
| :---: | :---: |
| ![NodeFlow editor](./screenshots/ui/10-studio-split-view.png) | ![NodeFlow AI assistant](./screenshots/ui/19-studio-ai-drawer.png) |

## Format coverage

NodeFlow converts supported source formats into Mermaid diagrams. Graphviz DOT can also be rendered directly with the WebAssembly renderer.

| Input format | Current behavior |
| --- | --- |
| Mermaid | Edit, validate, and render Mermaid diagrams |
| Graphviz DOT | Render with WebAssembly or convert to Mermaid |
| XMind | Import and export `.xmind` files |
| Draw.io / diagrams.net XML | Convert diagram nodes and edges to Mermaid |
| PlantUML | Convert supported sequence, class, and state diagrams |
| D2 | Convert D2 source to Mermaid |
| SQL DDL | Convert table definitions and relationships to Mermaid ER diagrams |
| OpenAPI / Swagger JSON | Convert REST endpoints to Mermaid sequence diagrams |
| AsyncAPI JSON | Convert channels and events to Mermaid sequence diagrams |
| GraphQL SDL | Convert types and relationships to Mermaid class diagrams |
| BPMN 2.0 XML | Convert supported events, tasks, gateways, and flows |
| C4 / Structurizr DSL | Convert supported declarations to Mermaid C4 context diagrams |
| Terraform HCL | Convert supported resources and dependencies |
| CSV / tabular data | Convert rows to relationship diagrams |
| Markdown outlines, FreeMind, and OPML | Convert hierarchical content to Mermaid mind maps or flowcharts |

Converters target useful subsets of these formats; they do not guarantee full-fidelity round trips for every dialect or feature. XMind is the current bidirectional file workflow. The verification suite tests representative fixtures for each converter.

## AI and syntax validation

- **Instant generator:** creates diagrams without downloading a model.
- **Local Qwen model:** Qwen2.5-Coder 0.5B runs in the browser using WebLLM. The model is downloaded from a CDN (about 380 MB) and cached; inference runs locally after loading and requires a compatible browser and WebGPU support.
- **Ollama:** optional connection to a model running on the user’s own machine.
- **Syntax repair:** tries deterministic fixes first, then a loaded local model when available. Every proposed repair is parsed before it is returned.
- **Apply protection:** generated and converted Mermaid is checked before it can replace the canvas. Invalid syntax is rejected with an error message, and the current rendered diagram is retained.

The first Qwen download requires an internet connection. NodeFlow does not need a hosted AI API for local inference.

## Other capabilities

- Interactive canvas with pan, zoom, minimap, fit-to-view, and presentation controls.
- Export diagrams as SVG, PNG, PDF, standalone HTML, and XMind files.
- Browser-based drafts and revision snapshots.
- Client-side conversion and rendering; no NodeFlow account or application server is required.

## Run locally

### Requirements

- Node.js 18 or later
- npm 9 or later

### Install and start

```bash
git clone https://github.com/muhamadzolfaghari/node-flow.git
cd node-flow
npm ci
npm run dev
```

Vite prints the local development URL after startup.

### Verify and build

```bash
npm test
npm run build
```

The verification suite covers diagram templates, syntax repair and apply validation, representative converter outputs, exports, and WebAssembly utilities. Production assets are written to `dist/`. GitHub Pages currently serves the app at the legacy `/mermaid-studio/` path.

## License

MIT
