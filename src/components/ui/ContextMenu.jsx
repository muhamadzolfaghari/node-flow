import { useEffect, useRef, useState } from "react";

/**
 * VSCode-inspired floating context menu.
 * Automatically clamps coordinates to viewport edges so items never overflow.
 * Supports keyboard navigation (Escape), icons, shortcut badges, dividers, and danger actions.
 */
export function ContextMenu({
  isOpen,
  position = { x: 0, y: 0 },
  onClose,
  items = [],
  title,
}) {
  const menuRef = useRef(null);
  const [coords, setCoords] = useState(position);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
      return;
    }

    // Measure and clamp exactly to viewport boundaries
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const pad = 8;
      const x = Math.max(pad, Math.min(position.x, window.innerWidth - rect.width - pad));
      const y = Math.max(pad, Math.min(position.y, window.innerHeight - rect.height - pad));
      setCoords({ x, y });
    } else {
      setCoords(position);
    }

    const actionable = items.filter((it) => !it.divider && !it.disabled);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % actionable.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? actionable.length - 1 : prev - 1));
      } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < actionable.length) {
        e.preventDefault();
        actionable[activeIndex]?.onClick?.();
        onClose();
      }
    };

    const handleMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, position, onClose, items]);

  if (!isOpen || !items || items.length === 0) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={title || "Context Menu"}
      className="fixed z-50 min-w-[210px] max-w-[320px] rounded-lg border border-border/80 bg-popover/95 p-1 text-popover-foreground shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 select-none"
      style={{
        left: coords.x,
        top: coords.y,
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {title && (
        <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground border-b border-border/40 mb-1">
          {title}
        </div>
      )}
      {items.map((item, idx) => {
        if (item.divider) {
          return (
            <div
              key={`div-${idx}`}
              className="my-1 h-px bg-border/60"
              role="separator"
            />
          );
        }

        const Icon = item.icon;

        return (
          <button
            key={item.id || item.label || idx}
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;
              item.onClick?.();
              onClose();
            }}
            className={`flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-xs text-left transition-colors ${
              item.disabled
                ? "opacity-40 cursor-not-allowed"
                : item.danger
                  ? "text-rose-400 hover:bg-rose-500/15 hover:text-rose-300"
                  : "text-foreground/90 hover:bg-accent hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {Icon && <Icon className="size-3.5 shrink-0 opacity-70" />}
              <span className="truncate">{item.label}</span>
            </div>
            {item.shortcut && (
              <span className="ml-auto text-[10px] text-muted-foreground tracking-tight font-mono">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
