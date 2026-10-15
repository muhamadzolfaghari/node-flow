import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  ArrowUpRight,
  Network,
  Database,
  GitBranch,
  Calendar,
  Shapes,
  Layers,
  ClipboardList,
  Binary,
  X,
  Target,
  Compass,
  Clock,
  Workflow,
} from "lucide-react";
import {
  SectionHeader,
  Badge,
  EmptyState,
  Button,
  Input,
} from "../components/ui.jsx";
import { DIAGRAM_TEMPLATES } from "../components/templates.js";
const icons = {
  er: Database,
  sequence: GitBranch,
  gantt: Calendar,
  class: Shapes,
  mindmap: GitBranch,
  flowchart: Network,
  requirement: ClipboardList,
  packet: Binary,
  quadrantChart: Target,
  journey: Compass,
  timeline: Clock,
  sankey: Workflow,
};
export default function Templates() {
  const [params, setParams] = useSearchParams(),
    q = params.get("q") || "",
    category = params.get("category") || "All",
    role = params.get("role") || "All";

  const categories = [
    "All",
    ...new Set(DIAGRAM_TEMPLATES.map((t) => t.category)),
  ];

  const roles = [
    { id: "All", label: "All Roles" },
    { id: "PM", label: "Product Managers (PM)" },
    { id: "QA", label: "QA & Testing" },
    { id: "Dev", label: "Developers & DevOps" },
    { id: "Operations", label: "Operations & SOP" },
    { id: "Academic", label: "Students & Academics" },
  ];

  const setFilter = (key, value, replace = false) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value && value !== "All") next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace },
    );

  const list = useMemo(
    () =>
      DIAGRAM_TEMPLATES.filter((t) => {
        const matchesCategory = category === "All" || category === t.category;
        const matchesRole =
          role === "All" ||
          (role === "PM" && (t.role === "Product Manager" || t.category === "Product & Design")) ||
          (role === "QA" && (t.role === "QA & Testing" || t.category === "QA & Testing")) ||
          (role === "Dev" && (!t.role || t.role === "Developer" || ["UML Specification", "Architecture & Cloud", "Engineering & Data", "Software Architecture"].includes(t.category))) ||
          (role === "Operations" && (t.role === "Operations & SOP" || t.category === "Business & Operations")) ||
          (role === "Academic" && (t.role === "Student & Academic" || t.category === "Education & Research"));
        const matchesQuery =
          !q ||
          `${t.title} ${t.kind} ${t.category} ${t.role || ""} ${t.description} ${t.code}`
            .toLowerCase()
            .includes(q.toLowerCase());
        return matchesCategory && matchesRole && matchesQuery;
      }),
    [q, category, role],
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <SectionHeader
        eyebrow="Start with a model"
        title="Template library"
        desc="Tailored diagrams for Product Managers, QA Engineers, Developers, Operations Teams, and Students. Each opens as an editable file in your local workspace."
        action={
          <Button variant="outline" asChild>
            <Link to="/studio">
              Open workspace <ArrowUpRight />
            </Link>
          </Button>
        }
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside>
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              aria-label="Search templates"
              className="pl-9"
              placeholder="Search templates…"
              value={q}
              onChange={(e) => setFilter("q", e.target.value, true)}
            />
          </div>

          <p className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-widest text-primary">
            Target Audience & Role
          </p>
          <div className="flex flex-wrap gap-1 lg:grid">
            {roles.map((r) => (
              <button
                key={r.id}
                aria-pressed={role === r.id}
                onClick={() => setFilter("role", r.id)}
                className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-xs ${role === r.id ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:bg-accent"}`}
              >
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          <p className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Categories
          </p>
          <div className="flex flex-wrap gap-1 lg:grid">
            {categories.map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                onClick={() => setFilter("category", c)}
                className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-xs ${category === c ? "bg-primary/10 text-blue-300" : "text-muted-foreground hover:bg-accent"}`}
              >
                <span>{c === "All" ? "All categories" : c}</span>
                <span className="text-[10px] opacity-70">
                  {c === "All"
                    ? DIAGRAM_TEMPLATES.length
                    : DIAGRAM_TEMPLATES.filter((t) => t.category === c).length}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-md border bg-card p-3 text-xs leading-5 text-muted-foreground">
            Local-first visual studio. All templates support instant real-time editing, canvas visual modeling, and export.
          </div>
        </aside>
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {list.length} templates{q && ` matching “${q}”`}
            </p>
            {(q || category !== "All" || role !== "All") && (
              <Button variant="ghost" size="sm" onClick={() => setParams({})}>
                <X />
                Clear filters
              </Button>
            )}
          </div>
          {list.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((t) => {
                const Icon = icons[t.kind] || Layers;
                return (
                  <Link
                    key={t.id}
                    to={`/studio?template=${t.id}`}
                    className="group flex flex-col overflow-hidden rounded-lg border bg-card transition hover:border-primary/50"
                  >
                    <div className="relative flex h-28 items-center justify-center border-b bg-background/40">
                      <div className="dot-grid absolute inset-0 opacity-30" />
                      <Icon className="relative size-10 text-slate-500 group-hover:text-blue-300" />
                      <Badge className="absolute bottom-3 left-3" tone="indigo">
                        {t.kind}
                      </Badge>
                      <ArrowUpRight className="absolute right-3 top-3 size-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h2 className="text-sm font-medium leading-5">
                        {t.title.replace(/^\d+\. /, "")}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
                        {t.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t pt-3 text-[10px] text-muted-foreground">
                        <span>{t.category}</span>
                        {t.role && (
                          <span className="rounded bg-accent/80 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                            {t.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Search />}
              title="No matching templates"
              desc="Try a diagram type such as ER, sequence, or mindmap."
              action={
                <Button variant="outline" onClick={() => setParams({})}>
                  Clear filters
                </Button>
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}
