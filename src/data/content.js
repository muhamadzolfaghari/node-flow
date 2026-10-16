import { Crosshair, Brain, Rocket, Lock, Layers, ShieldCheck } from 'lucide-react'

export const FEATURES = [
  { icon: Crosshair, title: 'CAD & Figma-grade canvas', desc: 'Kinetic momentum panning, cursor-centered zoom, trackpad + pinch support, live minimap and laser pointer.' },
  { icon: Brain, title: 'Dual in-browser AI engine', desc: 'Instant 0 MB heuristic synthesis plus a real local Qwen2.5-Coder LLM via WebGPU. No API keys.' },
  { icon: Rocket, title: 'Pro export studio', desc: 'Clean vector SVG, 2x/4x PNG, vector PDF, standalone HTML and native .xmind — watermark-free.' },
  { icon: Lock, title: '100% private & offline', desc: 'Zero telemetry, no backend. Drafts and snapshots live only in your browser localStorage.' },
  { icon: Layers, title: 'Universal multi-format importer', desc: 'XMind, Draw.io, PlantUML, Graphviz DOT, D2, SQL DDL, OpenAPI, Markdown and CSV.' },
  { icon: ShieldCheck, title: 'Non-destructive error guard', desc: 'Typos never wipe your canvas. Errors isolate in a banner while the last good render stays.' },
]

export const FORMAT_ROWS = [
  ['.xmind', 'XMind Pro', '$59–$179/yr', 'Bi-directional import & export, zero paywall'],
  ['.drawio', 'Lucidchart / Visio', '$95–$240/yr', 'XML → flowchart, 4K PNG + vector PDF'],
  ['.puml', 'PlantText / Confluence', '$36–$120/yr', 'Client-side sequence / class / state'],
  ['.d2', 'Terrastruct Studio', '$144–$240/yr', 'Instant in-browser converter'],
  ['.sql', 'dbdiagram Pro', '$108–$229/yr', 'CREATE TABLE → erDiagram'],
  ['.json', 'SwaggerHub', '$168–$360/yr', 'OpenAPI → sequence flows'],
  ['.dot', 'Commercial Graphviz', '$49–$99/yr', 'DOT → flowchart with CAD canvas'],
  ['.md', 'Miro / Whimsical', '$96–$120/yr', 'Outline → mindmap + local AI'],
]

export const MATRIX = [
  ['Pricing', '100% Free / MIT', 'Free', '$59.99/yr', '$95–$240/yr'],
  ['Sign-up', 'No — instant', 'No', 'Yes', 'Yes'],
  ['XMind bi-directional', '✓ Full', '✗', 'Native only', '✗'],
  ['Draw.io import', '✓ Built-in', '✗', '✗', 'Import only'],
  ['PlantUML & D2', '✓ Built-in', '✗', '✗', '✗'],
  ['SQL → ER', '✓ Built-in', '✗', '✗', 'Paid add-on'],
  ['Local AI (no key)', '✓ Dual engine', '✗', 'Cloud paid', 'Cloud paid'],
  ['CAD canvas', '✓ Kinetic + dock', 'Basic zoom', 'Proprietary', 'Good'],
  ['Vector PDF + 4K PNG', '✓ Print-ready', '✗', 'Paid', 'Paid'],
  ['Privacy', '100% client-side', 'Client-side', 'Local app', 'Hosted cloud'],
]

export const FAQS = [
  { q: 'Is NodeFlow free?', a: 'Yes. NodeFlow is open source under the MIT license, with no account, watermark, or paywall. If you connect a third-party AI provider, that provider may charge for its own usage.' },
  { q: 'Is my data private?', a: 'Projects, parsing, rendering, and exports run in your browser, and drafts are stored in your browser storage. NodeFlow has no backend of its own. If you choose Gemini or an OpenAI-compatible provider, the prompt you submit (and the active file when you insert into it) is sent to that provider. The deterministic, Ollama, and WebGPU engines do not send it to a cloud service.' },
  { q: 'Do I need an API key to use AI?', a: 'No. The deterministic engine works instantly without a key, the WebGPU engine runs a small model on your device after a one-time download, and Ollama uses a model on your own machine. Gemini and OpenAI-compatible engines need your own key.' },
  { q: 'What can I import and export?', a: 'Import Mermaid, PlantUML, Graphviz DOT, Draw.io, D2, SQL, OpenAPI, XMind, Markdown, CSV and many more listed on the Formats page. Export SVG, PNG, PDF, PPTX, standalone HTML, source files, and project backups.' },
  { q: 'Can I use it offline?', a: 'After the first load, editing, rendering, and exports run client-side. Cloud AI providers and web fonts need a connection.' },
  { q: 'How is it different from the Mermaid Live Editor?', a: 'NodeFlow adds multi-file projects with version checkpoints, direct canvas editing for flowcharts, converters for dozens of formats, role-based templates, themes, and an AI assistant that shows a reviewable proposal before changing your files.' },
]
