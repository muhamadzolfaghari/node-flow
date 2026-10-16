import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  { to: "/studio", label: "Workspace" },
  { to: "/templates", label: "Templates" },
  { to: "/formats", label: "Format support" },
  { to: "/changelog", label: "Changelog" },
];

const EXTERNAL_LINKS = [
  { href: "https://github.com/muhamadzolfaghari/node-flow", label: "GitHub ↗" },
  { href: "https://mermaid.js.org/intro/syntax-reference.html", label: "Mermaid docs ↗" },
];

function FooterNav() {
  return (
    <nav aria-label="Footer navigation" className="flex flex-wrap gap-5 text-xs text-muted-foreground">
      {FOOTER_LINKS.map((l) => (
        <Link key={l.to} className="hover:text-foreground" to={l.to}>
          {l.label}
        </Link>
      ))}
      {EXTERNAL_LINKS.map((l) => (
        <a key={l.href} className="hover:text-foreground" href={l.href} target="_blank" rel="noreferrer">
          {l.label}
        </a>
      ))}
    </nav>
  );
}

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-7 sm:px-8">
        <div>
          <p className="text-sm font-semibold tracking-tight">NodeFlow</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Crafted by{" "}
            <a
              href="https://github.com/muhamadzolfaghari"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary transition-colors"
            >
              Mohammad Zolfaghari
            </a>{" "}
            · Open source under MIT license
          </p>
        </div>
        <FooterNav />
      </div>
    </footer>
  );
}
