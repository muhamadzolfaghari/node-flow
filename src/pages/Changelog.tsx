import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  GitCommit,
  Calendar,
  CheckCircle2,
  Rocket,
  ArrowRight,
  Clock,
  Zap,
  Search,
  ExternalLink,
} from "lucide-react";
import { Badge, Button, Card, CardContent, Input } from "../components/ui.tsx";
import { CHANGELOG_ENTRIES, UPCOMING_ROADMAP } from "../data/changelogdata.ts";

function ChangelogStats({ counts }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
        <div className="text-xs font-medium text-muted-foreground">Total Releases</div>
        <div className="mt-1 text-2xl font-black tracking-tight text-foreground">{counts.all}</div>
      </div>
      <div className="rounded-xl border border-primary/40 bg-primary/5 p-3.5 backdrop-blur-sm">
        <div className="text-xs font-medium text-primary">Major Milestones</div>
        <div className="mt-1 text-2xl font-black tracking-tight text-primary">{counts.major}</div>
      </div>
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3.5 backdrop-blur-sm">
        <div className="text-xs font-medium text-emerald-400">Feature Releases</div>
        <div className="mt-1 text-2xl font-black tracking-tight text-emerald-400">{counts.minor}</div>
      </div>
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-3.5 backdrop-blur-sm">
        <div className="text-xs font-medium text-amber-400">Patches & Fixes</div>
        <div className="mt-1 text-2xl font-black tracking-tight text-amber-400">{counts.patch}</div>
      </div>
    </div>
  );
}

function ChangelogFilters({ filterType, setFilterType, counts, searchQuery, setSearchQuery }) {
  const tabs = [
    { id: "all", label: `All (${counts.all})`, activeCls: "bg-primary text-primary-foreground shadow" },
    { id: "major", label: `Major (${counts.major})`, activeCls: "bg-primary text-primary-foreground shadow" },
    { id: "minor", label: `Minor (${counts.minor})`, activeCls: "bg-emerald-500 text-white shadow" },
    { id: "patch", label: `Patch (${counts.patch})`, activeCls: "bg-amber-500 text-white shadow" },
  ];

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg border border-border/70 bg-card/40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              filterType === tab.id ? tab.activeCls : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search release, keyword, hash..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-xs bg-card/60 border-border/80"
        />
      </div>
    </div>
  );
}

function ChangelogCommitList({ commits }) {
  if (!commits || commits.length === 0) return null;
  return (
    <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
        <GitCommit className="size-3 text-primary" /> Key commits:
      </span>
      {commits.map((c, i) => {
        const isHash = /^[0-9a-f]{7,40}$/i.test(c.hash);
        return (
          <a
            key={i}
            href={isHash ? `https://github.com/muhamadzolfaghari/node-flow/commit/${c.hash}` : "#"}
            target={isHash ? "_blank" : undefined}
            rel={isHash ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1 rounded bg-muted/60 hover:bg-muted/90 px-2 py-0.5 text-[11px] font-mono text-muted-foreground transition group/commit"
            title={c.message}
          >
            <span className="text-primary font-bold group-hover/commit:underline">{c.hash}</span>
            <span className="truncate max-w-[280px]">{c.message}</span>
            {isHash && <ExternalLink className="size-2.5 opacity-60 ml-0.5" />}
          </a>
        );
      })}
    </div>
  );
}

function ChangelogArticle({ entry }) {
  const isMajor = entry.type === "major";
  const isMinor = entry.type === "minor";
  const tone = isMajor ? "indigo" : isMinor ? "green" : "amber";

  return (
    <article key={entry.version} className="relative group">
      <div
        className={`absolute -left-[31px] sm:-left-[39px] top-1 size-5 rounded-full border-2 transition ${
          isMajor
            ? "border-primary bg-primary shadow-[0_0_12px_rgba(59,130,246,0.6)]"
            : isMinor
            ? "border-emerald-500/80 bg-emerald-500/20 group-hover:border-emerald-400"
            : "border-amber-500/80 bg-amber-500/20 group-hover:border-amber-400"
        }`}
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xl font-bold tracking-tight text-foreground font-mono">
          v{entry.version}
        </span>
        <Badge tone={tone} className="uppercase font-mono text-[10px]">
          {entry.type}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
          <Calendar className="size-3" /> {entry.date}
        </span>
      </div>

      <h2 className="mt-2 text-lg font-semibold text-foreground/90">{entry.title}</h2>

      <Card className="mt-4 border-border/70 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-5">
          <ul className="space-y-2.5">
            {entry.highlights.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/85 leading-relaxed">
                <CheckCircle2 className="size-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <ChangelogCommitList commits={entry.commits} />
        </CardContent>
      </Card>
    </article>
  );
}

function ChangelogRoadmap() {
  return (
    <section aria-label="Upcoming roadmap" className="pt-8 border-t border-border/80">
      <div className="flex items-center gap-2">
        <Rocket className="size-5 text-primary animate-bounce" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Upcoming Roadmap</h2>
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
                <span className="text-xs text-muted-foreground font-semibold">{item.targetDate}</span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">{item.title}</h3>
              <ul className="mt-4 space-y-2">
                {item.goals.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
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
  );
}

function ChangelogCta() {
  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-background to-primary/10 p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
      <div>
        <h3 className="text-lg font-bold text-foreground">Experience the Latest Release</h3>
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
  );
}

function useChangelogFilter(entries) {
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const counts = useMemo(
    () => ({
      all: entries.length,
      major: entries.filter((e) => e.type === "major").length,
      minor: entries.filter((e) => e.type === "minor").length,
      patch: entries.filter((e) => e.type === "patch").length,
    }),
    [entries],
  );

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (filterType !== "all" && entry.type !== filterType) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        entry.version.toLowerCase().includes(q) ||
        entry.title.toLowerCase().includes(q) ||
        entry.highlights.some((h) => h.toLowerCase().includes(q)) ||
        entry.commits?.some((c) => c.hash.toLowerCase().includes(q) || c.message.toLowerCase().includes(q))
      );
    });
  }, [entries, filterType, searchQuery]);

  return { filterType, setFilterType, searchQuery, setSearchQuery, counts, filteredEntries };
}

function ChangelogTimeline({ entries, searchQuery, onReset }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 p-12 text-center text-sm text-muted-foreground">
        No releases found matching "{searchQuery}".
        <div className="mt-3">
          <Button size="sm" variant="outline" onClick={onReset}>
            Reset Filters
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="relative border-l border-border/80 ml-3 sm:ml-4 pl-6 sm:pl-8 space-y-12">
      {entries.map((entry) => (
        <ChangelogArticle key={entry.version} entry={entry} />
      ))}
    </div>
  );
}

export default function Changelog() {
  const { filterType, setFilterType, searchQuery, setSearchQuery, counts, filteredEntries } =
    useChangelogFilter(CHANGELOG_ENTRIES);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Clock className="size-3.5" /> Platform Release History
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Changelog & Version History
        </h1>
        <p className="mt-2 text-base text-muted-foreground max-w-2xl">
          Complete chronological record of all releases, features, optimizations, and hotfixes from initial commit to current production milestone.
        </p>
        <ChangelogStats counts={counts} />
        <ChangelogFilters
          filterType={filterType}
          setFilterType={setFilterType}
          counts={counts}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      <div className="mt-10 space-y-12">
        <section aria-label="Version history">
          <ChangelogTimeline
            entries={filteredEntries}
            searchQuery={searchQuery}
            onReset={() => {
              setSearchQuery("");
              setFilterType("all");
            }}
          />
        </section>

        <ChangelogRoadmap />
        <ChangelogCta />
      </div>
    </div>
  );
}
