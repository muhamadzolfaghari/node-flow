import React from "react";
import { Link } from "react-router-dom";
import {
  GitCommit,
  Sparkles,
  Calendar,
  CheckCircle2,
  Rocket,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  Zap,
} from "lucide-react";
import { Badge, Button, Card, CardContent } from "../components/ui.jsx";
import { CHANGELOG_ENTRIES, UPCOMING_ROADMAP } from "../data/changelog-data.js";

export default function Changelog() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Clock className="size-3.5" /> Platform Release History
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Changelog & Roadmap
        </h1>
        <p className="mt-2 text-base text-muted-foreground max-w-2xl">
          Track continuous enhancements, enterprise architecture features, performance
          optimizations, and upcoming platform milestones in NodeFlow.
        </p>
      </div>

      {/* Main Release Timeline */}
      <div className="mt-12 space-y-12">
        <section aria-label="Version history">
          <div className="relative border-l border-border/80 ml-3 sm:ml-4 pl-6 sm:pl-8 space-y-12">
            {CHANGELOG_ENTRIES.map((entry) => {
              const isMajor = entry.type === "major";
              return (
                <article key={entry.version} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-1 size-5 rounded-full border-2 transition ${
                      isMajor
                        ? "border-primary bg-primary shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                        : "border-border bg-card group-hover:border-primary/80"
                    }`}
                  />

                  {/* Version header */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xl font-bold tracking-tight text-foreground">
                      v{entry.version}
                    </span>
                    <Badge
                      variant={isMajor ? "default" : "secondary"}
                      className="uppercase font-mono text-[10px]"
                    >
                      {entry.type}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <Calendar className="size-3" /> {entry.date}
                    </span>
                  </div>

                  <h2 className="mt-2 text-lg font-semibold text-foreground/90">
                    {entry.title}
                  </h2>

                  {/* Highlights list */}
                  <Card className="mt-4 border-border/70 bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-5">
                      <ul className="space-y-2.5">
                        {entry.highlights.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-sm text-foreground/85 leading-relaxed"
                          >
                            <CheckCircle2 className="size-4 text-emerald-400 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      {entry.commits && entry.commits.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            <GitCommit className="size-3 text-primary" /> Key commits:
                          </span>
                          {entry.commits.map((c, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground"
                            >
                              <span className="text-primary font-bold">{c.hash}</span>
                              <span className="truncate max-w-[280px]">{c.message}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </article>
              );
            })}
          </div>
        </section>

        {/* Upcoming Roadmap Section */}
        <section aria-label="Upcoming roadmap" className="pt-8 border-t border-border/80">
          <div className="flex items-center gap-2">
            <Rocket className="size-5 text-primary animate-bounce" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Upcoming Roadmap
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Planned capabilities scheduled for upcoming releases.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {UPCOMING_ROADMAP.map((item) => (
              <Card
                key={item.version}
                className="relative overflow-hidden border-border/80 bg-gradient-to-br from-card via-card/80 to-primary/5 hover:border-primary/50 transition shadow-lg"
              >
                <div className="absolute top-0 right-0 h-16 w-16 bg-primary/10 rounded-bl-full pointer-events-none" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
                      Target: v{item.version}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {item.targetDate}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-semibold text-foreground">
                    {item.title}
                  </h3>

                  <ul className="mt-4 space-y-2">
                    {item.goals.map((g, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                      >
                        <Zap className="size-3.5 text-primary mt-0.5 shrink-0" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Open Studio CTA */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-background to-primary/10 p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Experience the Latest Release
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Launch the IDE studio now with full diagramming, enterprise governance, and offline local privacy.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0 gap-2">
            <Link to="/studio">
              Launch Studio <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
