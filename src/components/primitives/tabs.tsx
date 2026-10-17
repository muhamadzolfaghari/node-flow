import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext({ value: "", onValueChange: () => {} });

function Tabs({ value, onValueChange, defaultValue, className, children, ...props }) {
  const [val, setVal] = React.useState(defaultValue || "");
  const currentVal = value !== undefined ? value : val;
  const changeVal = React.useCallback((v) => {
    if (onValueChange) onValueChange(v);
    else setVal(v);
  }, [onValueChange]);

  const ctxValue = React.useMemo(() => ({ value: currentVal, onValueChange: changeVal }), [currentVal, changeVal]);

  return (
    <TabsContext.Provider value={ctxValue}>
      <div className={cn("group/tabs flex gap-2 flex-col", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function TabsList({ className, variant = "default", ...props }) {
  return (
    <div
      role="tablist"
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ value, className, onClick, ...props }) {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      data-slot="tabs-trigger"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={(e) => {
        ctx.onValueChange?.(value);
        onClick?.(e);
      }}
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ value, className, children, ...props }) {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return (
    <div
      role="tabpanel"
      tabIndex={0}
      data-slot="tabs-content"
      data-state="active"
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
