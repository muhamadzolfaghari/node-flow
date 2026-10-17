import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../components/ui.tsx";

export function Menu({ label, children }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Item({ icon: Icon, children, onSelect, onClick, ...props }) {
  return (
    <DropdownMenuItem
      className="text-xs"
      onSelect={onSelect || onClick}
      {...props}
    >
      {Icon && <Icon className="size-3.5" />}
      {children}
    </DropdownMenuItem>
  );
}
