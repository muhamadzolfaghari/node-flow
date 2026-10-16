import React from "react";

export function ExportPreviewPane({
  background,
  previewSvg,
  previewRef,
  title,
  scale,
  padding,
}) {
  return (
    <div className="md:col-span-7 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/60 bg-muted/20 p-6 min-h-[300px]">
      <div
        className="relative flex size-full max-h-[460px] items-center justify-center overflow-hidden rounded-xl border border-border/50 shadow-inner"
        style={{
          background:
            background === "transparent"
              ? "radial-gradient(#94a3b8 1px, transparent 1px) 0 0 / 16px 16px, #0b0f17"
              : background,
        }}
      >
        {previewSvg ? (
          <div
            ref={previewRef}
            className="flex size-full items-center justify-center p-4 [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:object-contain"
            dangerouslySetInnerHTML={{ __html: previewSvg }}
          />
        ) : (
          <span className="text-xs text-muted-foreground">No active diagram preview</span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between w-full px-1 text-[11px] text-muted-foreground font-mono">
        <span>{title}</span>
        <span>Scale: {scale}× • Pad: {padding}px</span>
      </div>
    </div>
  );
}
