import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Network,
  Database,
  Code2,
  Files,
  GitBranch,
  Layers,
  Shield,
  FileCode2,
  Sparkles,
  CheckCircle2,
  Target,
  CheckSquare,
  Terminal,
  Briefcase,
  GraduationCap,
  Palette,
  ChevronDown,
  MousePointerClick,
  Download,
  FileInput,
} from "lucide-react";
import { Button, Badge, Card, CardContent } from "../components/ui.jsx";
import { FORMATS } from "../lib/formats.js";
import { DIAGRAM_TEMPLATES } from "../components/templates.js";
import { FAQS } from "../data/content.js";
import { useDocumentPreview } from "../hooks/useDocumentPreview.js";
import { DIAGRAM_THEME_FOR, getStoredTheme, resolveTheme } from "../lib/app-theme.js";

const DEMOS = [
  {
    id: "architecture",
    title: "Architecture",
    file: "architecture.mmd",
    format: "mermaid",
    template: "service-architecture",
    source:
      "flowchart LR\n  Web[Web client] --> API[API gateway]\n  API --> Orders[Order service]\n  Orders --> DB[(Database)]\n  Orders --> Queue[Event queue]",
  },
  {
    id: "data",
    title: "Database",
    file: "schema.sql",
    format: "sql",
    template: "er-diagram",
    source:
      "CREATE TABLE users (\n  id INTEGER PRIMARY KEY,\n  name VARCHAR(100)\n);\nCREATE TABLE orders (\n  id INTEGER PRIMARY KEY,\n  user_id INTEGER REFERENCES users(id)\n);",
  },
  {
    id: "uml",
    title: "UML sequence",
    file: "checkout.mmd",
    format: "mermaid",
    template: "sequence-auth",
    source:
      "sequenceDiagram\n  participant Client\n  participant API\n  participant Orders\n  Client->>API: Create order\n  API->>Orders: Validate inventory\n  Orders-->>API: Confirmed\n  API-->>Client: Order created",
  },
];

const QUICK_STARTS = [
  { icon: Network, label: "UML & architecture", detail: "Structure, behavior, interactions", query: "UML" },
  { icon: Database, label: "Entity relationships", detail: "Tables, keys, and data models", query: "erDiagram" },
  { icon: Layers, label: "Charts & planning", detail: "Gantt, timelines, and data charts", query: "Product & Design" },
  { icon: GitBranch, label: "Flows & mindmaps", detail: "Processes and connected ideas", query: "mindmap" },
];

const FEATURES = [
  {
    icon: Files,
    title: "Projects, not one-off files",
    description: "Keep source files in a project, work in tabs, and return to your drafts exactly as you left them.",
  },
  {
    icon: Code2,
    title: "A real source editor",
    description: "Syntax highlighting, live error markers, symbol-aware completion, search, undo, and one-click repairs.",
  },
  {
    icon: MousePointerClick,
    title: "Edit on the canvas",
    description: "Select a shape to rename, restyle, connect, duplicate, or delete it, and watch the source update.",
  },
  {
    icon: Sparkles,
    title: "AI you can review",
    description: "Generate with deterministic rules, WebGPU, Ollama, Gemini, or an OpenAI-compatible API, then approve the proposal.",
  },
  {
    icon: Palette,
    title: "Themes that fit your team",
    description: "Studio Dark, Light, Midnight, Nord, High contrast, or match your system, applied across editor and canvas.",
  },
  {
    icon: Download,
    title: "Deliver anywhere",
    description: "Export SVG, PNG, PDF, PPTX, or standalone HTML, create checkpoints, and download project backups.",
  },
];

const STEPS = [
  { icon: FileInput, title: "Start", description: "Pick a template, import a file, describe it to the assistant, or write source." },
  { icon: MousePointerClick, title: "Refine", description: "Edit the source and the canvas side by side. Errors are marked as you type." },
  { icon: Download, title: "Ship", description: "Export for docs and decks, or keep the project and its checkpoints in your browser." },
];

const ROLES = [
  { role: "Product Managers", icon: Target, badge: "PM & Strategy", desc: "User story maps, strategic OKRs, conversion funnels, and feature milestone tracking.", templateId: "pm-story-mapping" },
  { role: "QA & Testing", icon: CheckSquare, badge: "QA Quality Gate", desc: "Defect triage lifecycles, automated CI/CD smoke gates, and test coverage pipelines.", templateId: "qa-defect-lifecycle" },
  { role: "Developers & DevOps", icon: Terminal, badge: "Architecture & GIS", desc: "Cloud microservices, ER schemas, git trunk flows, and GIS vector tile data pipelines.", templateId: "geospatial-vector-tile-pipeline" },
  { role: "Operations & Business", icon: Briefcase, badge: "SOP & Governance", desc: "Standard operating procedures, compliance approval chains, and org charts.", templateId: "sop-approval-process" },
  { role: "Students & Academia", icon: GraduationCap, badge: "Research & Study", desc: "Doctoral literature maps, scientific method protocols, and exam schedules.", templateId: "academic-research-thesis" },
];

export default function Landing() {
  const [demo, setDemo] = useState(0);
  const current = DEMOS[demo];
  const [diagramTheme, setDiagramTheme] = useState(() => DIAGRAM_THEME_FOR[resolveTheme(getStoredTheme())] || "dark");
  useEffect(() => {
    const onTheme = (event) => setDiagramTheme(DIAGRAM_THEME_FOR[event.detail?.resolved] || "dark");
    window.addEventListener("nodeflow-theme", onTheme);
    return () => window.removeEventListener("nodeflow-theme", onTheme);
  }, []);
  const preview = useDocumentPreview(current, diagramTheme, "split");

  return (
    <div>
      <title>NodeFlow — Visual workspace for diagrams and systems</title>
      <meta
        name="description"
        content="Create and edit diagrams from source, templates, imports, or AI. NodeFlow combines a browser-based code editor, live canvas, format converters, and local or cloud AI providers."
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(60% 50% at 75% 0%, color-mix(in srgb, var(--primary) 22%, transparent), transparent 70%), radial-gradient(40% 40% at 0% 30%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-5 pt-14 pb-10 sm:px-8 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge tone="indigo" className="gap-2 px-3 py-1">
              <span className="size-1.5 rounded-full bg-primary" />
              <span>Open source visual workspace</span>
              <span className="text-muted-foreground/60">·</span>
              <a
                href="https://github.com/muhamadzolfaghari"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground/90 transition-colors hover:text-primary"
              >
                by Mohammad Zolfaghari
              </a>
            </Badge>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-[-.035em] sm:text-6xl">
              Turn systems into{" "}
              <span className="bg-gradient-to-r from-primary to-foreground/70 bg-clip-text text-transparent">
                editable diagrams
              </span>
              .
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              NodeFlow is a browser workspace where source code, a live canvas, and an AI assistant edit the same
              diagram. Start from a template or an import, and keep your projects in your browser.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/studio">
                  Open workspace <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/templates">
                  Explore {DIAGRAM_TEMPLATES.length} templates <ArrowUpRight />
                </Link>
              </Button>
            </div>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Shield className="size-3.5" /> Local project storage
              </li>
              <li>No account required</li>
              <li>MIT licensed</li>
              <li>{FORMATS.length} source formats</li>
            </ul>
          </div>

          {/* Live product window */}
          <div className="mx-auto mt-12 max-w-5xl">
            <div className="overflow-hidden rounded-xl border bg-card shadow-2xl shadow-black/20 ring-1 ring-black/5">
              <div className="flex h-11 items-center gap-3 border-b bg-secondary/40 px-4">
                <span className="flex gap-1.5" aria-hidden="true">
                  <i className="size-2.5 rounded-full bg-rose-400/80" />
                  <i className="size-2.5 rounded-full bg-amber-400/80" />
                  <i className="size-2.5 rounded-full bg-emerald-400/80" />
                </span>
                <FileCode2 className="size-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">{current.file}</span>
                <div role="group" aria-label="Choose an example" className="ml-auto flex gap-1 rounded-md border bg-background/60 p-0.5">
                  {DEMOS.map((d, i) => (
                    <button
                      key={d.id}
                      aria-pressed={demo === i}
                      onClick={() => setDemo(i)}
                      className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                        demo === i ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d.title}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid min-h-[320px] md:grid-cols-[.8fr_1fr]">
                <pre className="max-h-[360px] overflow-auto border-b bg-[var(--editor-bg)] p-6 font-mono text-xs leading-6 text-[var(--editor-fg)] md:border-r md:border-b-0">
                  {current.source}
                </pre>
                <div className="marketing-diagram dot-grid grid min-h-[300px] items-center overflow-hidden p-6">
                  <div ref={preview.containerRef} className="mermaid-stage w-full" />
                  {preview.error && <p className="text-xs text-destructive">{preview.error}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between border-t bg-secondary/30 px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="size-3 text-emerald-400" />
                  {preview.status.message}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/studio?template=${current.template}`}>
                    Edit a full example <ArrowUpRight />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick starts */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_STARTS.map((f) => (
            <Link
              key={f.label}
              to={`/templates?q=${encodeURIComponent(f.query)}`}
              className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition hover:border-primary/50 hover:bg-accent/40"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{f.label}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{f.detail}</span>
              </span>
              <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">The workspace</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Everything in one editable place.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="gap-0 py-0 shadow-none transition hover:border-primary/40">
              <CardContent className="p-6">
                <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">From idea to deliverable in three steps.</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative rounded-lg border bg-card p-6">
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  Step {index + 1}
                </span>
                <step.icon className="mt-2 size-5 text-primary" />
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Cross-disciplinary studio</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Workflows for every role</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            From product story maps to QA triage pipelines and thesis structures, start from a ready template and edit it
            like any other project.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ROLES.map((item) => (
            <Card key={item.role} className="flex flex-col justify-between border-border/80 bg-card/60 transition hover:border-primary/50 hover:bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <item.icon className="size-5 text-primary" />
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{item.badge}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{item.role}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.desc}</p>
              </CardContent>
              <div className="border-t p-3">
                <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-primary" asChild>
                  <Link to={`/studio?template=${item.templateId}`}>
                    Open template <ArrowUpRight className="size-3" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Formats + stats */}
      <section className="border-y bg-card/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-5 py-10 sm:px-8">
          <div>
            <h2 className="text-xl font-semibold">Bring the formats you already use.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Native Mermaid and Graphviz rendering, plus editable source-backed previews for SQL, PlantUML, API
              specifications, XML formats, and more.
            </p>
            <Button variant="link" className="mt-3 px-0" asChild>
              <Link to="/formats">
                See support and conversion limits <ArrowRight />
              </Link>
            </Button>
          </div>
          <dl className="grid grid-cols-3 gap-6 text-center sm:gap-10">
            {[
              [FORMATS.length, "Source formats"],
              [DIAGRAM_TEMPLATES.length, "Starter templates"],
              [14, "UML categories"],
            ].map(([value, label]) => (
              <div key={label}>
                <dd className="text-3xl font-semibold">{value}</dd>
                <dt className="mt-1 text-xs text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FAQ (mirrors the FAQPage structured data) */}
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-6 divide-y rounded-lg border bg-card">
          {FAQS.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                {item.q}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-xl border bg-gradient-to-br from-primary/15 to-card p-6 sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Start with the system you’re building.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a template, open your source files, or create a new project.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link to="/studio">
              Open NodeFlow <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
