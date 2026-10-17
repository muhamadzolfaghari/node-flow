"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

const DropdownMenuContext = createContext(null);

function DropdownMenu({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
  ...props
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  const setOpen = useCallback(
    (next) => {
      const value = typeof next === "function" ? next(isOpen) : next;
      if (!isControlled) {
        setUncontrolledOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, isOpen, onOpenChange]
  );

  return (
    <DropdownMenuContext.Provider
      value={{
        isOpen,
        setOpen,
        triggerRef,
        contentRef,
      }}
    >
      <div className="relative inline-block" data-slot="dropdown-menu" {...props}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuPortal({ children }) {
  return <>{children}</>;
}

function DropdownMenuTrigger({ asChild, children, className, ...props }) {
  const ctx = useContext(DropdownMenuContext);
  const triggerRef = ctx?.triggerRef;

  const handleClick = (e) => {
    props.onClick?.(e);
    if (!e.defaultPrevented) {
      ctx?.setOpen((prev) => !prev);
    }
  };

  const handleKeyDown = (e) => {
    props.onKeyDown?.(e);
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      ctx?.setOpen(true);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      "aria-haspopup": "menu",
      "aria-expanded": ctx?.isOpen,
      "data-state": ctx?.isOpen ? "open" : "closed",
      "data-slot": "dropdown-menu-trigger",
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      className: cn(children.props.className, className),
    });
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      data-slot="dropdown-menu-trigger"
      aria-haspopup="menu"
      aria-expanded={ctx?.isOpen}
      data-state={ctx?.isOpen ? "open" : "closed"}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  children,
  ...props
}) {
  const ctx = useContext(DropdownMenuContext);
  const isOpen = ctx?.isOpen;
  const contentRef = ctx?.contentRef;
  const triggerRef = ctx?.triggerRef;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      if (
        contentRef?.current?.contains(e.target) ||
        triggerRef?.current?.contains(e.target)
      ) {
        return;
      }
      ctx?.setOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        ctx?.setOpen(false);
        triggerRef?.current?.focus?.();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, ctx, contentRef, triggerRef]);

  if (!isOpen) return null;

  const alignClass =
    align === "end"
      ? "right-0"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-0";

  return (
    <div
      ref={contentRef}
      role="menu"
      tabIndex={-1}
      data-slot="dropdown-menu-content"
      data-state="open"
      data-side="bottom"
      style={{ marginTop: `${sideOffset}px` }}
      className={cn(
        "absolute top-full z-50 min-w-[8rem] max-h-[85vh] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuGroup({ className, ...props }) {
  return (
    <div
      role="group"
      data-slot="dropdown-menu-group"
      className={cn("space-y-1", className)}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  onSelect,
  onClick,
  disabled,
  children,
  ...props
}) {
  const ctx = useContext(DropdownMenuContext);

  const handleClick = (e) => {
    if (disabled) return;
    onClick?.(e);
    onSelect?.(e);
    if (!e.defaultPrevented) {
      ctx?.setOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        inset && "pl-8",
        variant === "destructive" &&
          "text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  onSelect,
  onClick,
  disabled,
  ...props
}) {
  const ctx = useContext(DropdownMenuContext);

  const handleClick = (e) => {
    if (disabled) return;
    onCheckedChange?.(!checked);
    onClick?.(e);
    onSelect?.(e);
    if (!e.defaultPrevented) {
      ctx?.setOpen(false);
    }
  };

  return (
    <div
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      data-slot="dropdown-menu-checkbox-item"
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CheckIcon className="size-4" />}
      </span>
      {children}
    </div>
  );
}

function DropdownMenuRadioGroup({ children, value, onValueChange, className, ...props }) {
  return (
    <div role="radiogroup" data-slot="dropdown-menu-radio-group" className={className} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          checked: child.props.value === value,
          onSelect: () => onValueChange?.(child.props.value),
        });
      })}
    </div>
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  checked,
  onSelect,
  onClick,
  disabled,
  ...props
}) {
  const ctx = useContext(DropdownMenuContext);

  const handleClick = (e) => {
    if (disabled) return;
    onClick?.(e);
    onSelect?.(e);
    if (!e.defaultPrevented) {
      ctx?.setOpen(false);
    }
  };

  return (
    <div
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      data-slot="dropdown-menu-radio-item"
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CircleIcon className="size-2 fill-current" />}
      </span>
      {children}
    </div>
  );
}

function DropdownMenuLabel({ className, inset, ...props }) {
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }) {
  return (
    <div
      role="separator"
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="relative"
      data-slot="dropdown-menu-sub"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, { isOpen, setIsOpen });
      })}
    </div>
  );
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  isOpen,
  setIsOpen,
  ...props
}) {
  return (
    <div
      role="menuitem"
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      data-state={isOpen ? "open" : "closed"}
      onClick={() => setIsOpen?.(!isOpen)}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground",
        inset && "pl-8",
        isOpen && "bg-accent text-accent-foreground",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </div>
  );
}

function DropdownMenuSubContent({ className, isOpen, ...props }) {
  if (!isOpen) return null;
  return (
    <div
      role="menu"
      data-slot="dropdown-menu-sub-content"
      data-state="open"
      className={cn(
        "absolute left-full top-0 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
