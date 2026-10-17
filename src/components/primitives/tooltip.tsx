"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function TooltipProvider({ children }) {
  return <>{children}</>;
}

function Tooltip({ children, ...props }) {
  return <div className="group/tooltip relative inline-flex" {...props}>{children}</div>;
}

function TooltipTrigger({ asChild, children, ...props }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }
  return <span {...props}>{children}</span>;
}

function TooltipContent({ className, children, sideOffset = 4, ...props }) {
  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden z-50 w-max rounded-md bg-foreground px-2 py-1 text-[11px] text-background shadow-md group-hover/tooltip:inline-block transition-opacity duration-150",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
