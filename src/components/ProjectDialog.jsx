import React from "react";
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui.jsx";

export function ProjectDialog({
  dialog,
  onClose,
  selected,
  name,
  setName,
  isPendingAction,
  projectFormAction,
  onBackup,
  onDelete,
}) {
  return (
    <Dialog
      open={!!dialog}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {dialog === "create"
              ? "Create a project"
              : dialog === "rename"
                ? "Rename project"
                : "Delete project?"}
          </DialogTitle>
          <DialogDescription>
            {dialog === "delete"
              ? `This removes ${selected?.name} and its files from this browser. Download a backup first if you need to keep it.`
              : "Give this collection of source files a clear, recognizable name."}
          </DialogDescription>
        </DialogHeader>
        {dialog === "delete" ? (
          <DialogFooter>
            <Button variant="outline" onClick={() => onBackup(selected)}>
              Download backup
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete project
            </Button>
          </DialogFooter>
        ) : (
          <form action={projectFormAction}>
            <label
              htmlFor="project-name"
              className="mb-2 block text-xs text-muted-foreground"
            >
              Project name
            </label>
            <Input
              id="project-name"
              name="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              disabled={isPendingAction}
            />
            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPendingAction}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPendingAction}>
                {isPendingAction
                  ? "Saving…"
                  : dialog === "create"
                    ? "Create and open"
                    : "Rename"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
