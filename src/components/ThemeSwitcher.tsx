import { useEffect, useState } from "react";
import { Check, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui.tsx";
import { APP_THEMES, applyTheme, getStoredTheme, setTheme } from "../lib/appTheme.ts";

export default function ThemeSwitcher() {
  const [theme, setCurrent] = useState(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "auto") return;
    // Follow the OS while "Match system" is selected.
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => applyTheme("auto");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-ghost !px-2.5 !py-2" aria-label="Change colour theme" title="Colour theme">
          <Palette className="size-4" />
          <span className="hidden 2xl:inline text-xs">Theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Colour theme</DropdownMenuLabel>
        {APP_THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onSelect={() => {
              setTheme(t.id);
              setCurrent(t.id);
            }}
          >
            <span className="flex w-full items-center gap-2.5">
              <span
                aria-hidden="true"
                className="size-4 shrink-0 rounded-full border border-border"
                style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)` }}
              />
              <span className="flex-1">{t.label}</span>
              {theme === t.id && <Check className="size-3.5 text-primary" />}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
