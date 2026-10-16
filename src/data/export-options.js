export const BACKGROUND_OPTIONS = [
  { id: "transparent", label: "Transparent", value: "transparent", color: "border-dashed border-muted-foreground/40 bg-transparent" },
  { id: "dark", label: "Studio Dark", value: "#080c14", color: "bg-[#080c14]" },
  { id: "slate", label: "Slate Navy", value: "#0f172a", color: "bg-[#0f172a]" },
  { id: "white", label: "Crisp Paper", value: "#ffffff", color: "bg-white border-slate-300" },
  { id: "blueprint", label: "Blueprint Grid", value: "#0b1e36", color: "bg-[#0b1e36] ring-1 ring-cyan-500/30" },
  { id: "ambient", label: "Ambient Glow", value: "radial-gradient(ellipse at 50% 50%, #172554 0%, #030712 100%)", color: "bg-gradient-to-br from-indigo-950 via-slate-900 to-black" },
];

export const PADDING_OPTIONS = [
  { label: "0px", value: 0 },
  { label: "16px", value: 16 },
  { label: "32px", value: 32 },
  { label: "64px", value: 64 },
];

export const SCALE_OPTIONS = [
  { label: "1× Standard", value: 1 },
  { label: "2× Retina (HD)", value: 2 },
  { label: "4× Ultra HD 4K", value: 4 },
];
