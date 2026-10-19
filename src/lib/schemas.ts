import { z } from "zod";

// Data crossing a trust boundary (network responses, browser storage) is parsed
// here so a malformed payload becomes one clear error instead of a crash later.

export const ollamaResponseSchema = z.object({ response: z.string() });

export const openaiResponseSchema = z.object({
  choices: z
    .array(z.object({ message: z.object({ content: z.string().nullable() }) }))
    .min(1),
});

export const openaiErrorSchema = z.object({
  error: z.object({ message: z.string() }),
});

export const CANVAS_GRIDS = ["dots", "lines", "blueprint", "none"] as const;

// Each field falls back on its own, so one stale or corrupt value (e.g. from an
// older build) does not discard the rest of the saved canvas preferences.
export const persistedCanvasSchema = z.object({
  activeLens: z.string().catch("standard"),
  grid: z.enum(CANVAS_GRIDS).catch("dots"),
  tool: z.enum(["pointer", "hand"]).catch("pointer"),
  wheelMode: z.enum(["zoom", "pan"]).catch("zoom"),
  minimap: z.boolean().catch(true),
});

export type PersistedCanvas = z.infer<typeof persistedCanvasSchema>;

/** Parse a provider payload, throwing a readable error naming the provider. */
export function parseProviderResponse<T>(schema: z.ZodType<T>, data: unknown, provider: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.length ? ` (${issue.path.join(".")}: ${issue.message})` : "";
    throw new Error(`${provider} returned an unexpected response${where}.`);
  }
  return result.data;
}
