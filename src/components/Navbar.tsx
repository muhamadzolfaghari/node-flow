import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Network, Menu, X, Code2, Search, ArrowUpRight } from "lucide-react";
import CommandPalette from "./CommandPalette.jsx";
import ThemeSwitcher from "./ThemeSwitcher.jsx";

const NAV_LINKS = [
  { to: "/studio", label: "Studio" },
  { to: "/templates", label: "Templates" },
  { to: "/saved", label: "Projects" },
  { to: "/formats", label: "Formats & features" },
  { to: "/changelog", label: "Changelog" },
];

function NavBrand() {
  return (
    <Link to="/" aria-label="NodeFlow home" className="flex shrink-0 items-center gap-2.5">
      <span className="brand-mark">
        <Network className="size-5" />
      </span>
      <span className="leading-none">
        <span className="block text-base font-bold tracking-tight text-foreground">
          Node<span className="text-primary">Flow</span>
        </span>
        <span className="mt-1.5 block text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Visual studio
        </span>
      </span>
    </Link>
  );
}

function NavDesktopLinks() {
  return (
    <nav aria-label="Main navigation" className="ml-6 hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `rounded-md px-3 py-2 text-[13px] font-medium transition ${
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}

function NavActions({ onOpenPalette, isStudio, mobileOpen, onToggleMobile }) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <button
        onClick={onOpenPalette}
        className="btn-ghost !px-2.5 !py-2"
        aria-label="Search diagrams and commands"
        title="Search (⌘K / Ctrl+K)"
      >
        <Search className="size-4" />
        <span className="hidden xl:inline text-xs">Search</span>
        <kbd className="hidden sm:inline text-[10px] text-muted-foreground">⌘K</kbd>
      </button>
      <ThemeSwitcher />
      <a
        href="https://github.com/muhamadzolfaghari/node-flow"
        target="_blank"
        rel="noreferrer"
        className="hidden rounded-md p-2 text-muted-foreground hover:text-foreground sm:block"
        aria-label="View GitHub repository"
      >
        <Code2 className="size-4" />
      </a>
      {!isStudio && (
        <div className="hidden sm:block">
          <Link to="/studio" className="btn-primary !py-2 !text-xs">
            Open studio <ArrowUpRight className="size-4" />
          </Link>
        </div>
      )}
      <button
        onClick={onToggleMobile}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        aria-controls="mobile-navigation"
        className="grid size-10 place-items-center rounded-md border border-border bg-secondary lg:hidden"
      >
        {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>
    </div>
  );
}

function NavMobileMenu() {
  return (
    <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-border px-4 py-3 lg:hidden">
      <div className="grid gap-1">
        {[{ to: "/", label: "Home" }, ...NAV_LINKS].map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `rounded-md px-3 py-3 text-sm ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function useNavKeyShortcuts(setPalette, setOpen) {
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((value) => !value);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPalette, setOpen]);
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const loc = useLocation();
  const isStudio = loc.pathname.startsWith("/studio");

  useEffect(() => {
    setOpen(false);
    setPalette(false);
  }, [loc]);

  useNavKeyShortcuts(setPalette, setOpen);

  return (
    <>
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
        className="skip-link"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-background ">
        <div className="mx-auto flex h-14 max-w-none items-center gap-3 px-4 sm:px-6">
          <NavBrand />
          <NavDesktopLinks />
          <NavActions
            onOpenPalette={() => setPalette(true)}
            isStudio={isStudio}
            mobileOpen={open}
            onToggleMobile={() => setOpen(!open)}
          />
        </div>
        {open && <NavMobileMenu />}
      </header>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </>
  );
}
