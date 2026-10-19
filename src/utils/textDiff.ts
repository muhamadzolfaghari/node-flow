export interface TextChange {
  from: number;
  to: number;
  insert: string;
}

/**
 * Smallest single replacement that turns `oldText` into `newText`, found by
 * trimming the common prefix and the common suffix. Returns null when the
 * strings are equal.
 */
export function minimalTextChange(oldText: string, newText: string): TextChange | null {
  if (oldText === newText) return null;
  const limit = Math.min(oldText.length, newText.length);
  let start = 0;
  while (start < limit && oldText[start] === newText[start]) start++;
  let oldEnd = oldText.length;
  let newEnd = newText.length;
  while (oldEnd > start && newEnd > start && oldText[oldEnd - 1] === newText[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }
  return { from: start, to: oldEnd, insert: newText.slice(start, newEnd) };
}
