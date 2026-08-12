/**
 * Text transforms for the Markdown editor.
 *
 * Pure functions over `(text, selectionStart, selectionEnd)` so the editing
 * behaviour can be reasoned about — and corrected — without touching React or
 * the DOM. Each returns the new text and where the selection should land.
 */

export type Edit = { text: string; start: number; end: number };

/** A list bullet or an ordered marker at the start of a line. */
const LIST = /^(\s*)([-*+]\s+\[[ xX]\]\s+|[-*+]\s+|(\d+)([.)])\s+)/;
/** A blockquote or callout line. */
const QUOTE = /^(\s*>\s?)/;

/**
 * Wrap the selection in a marker, or unwrap it if it is already wrapped.
 *
 * With nothing selected it inserts the pair and places the caret between them,
 * which is what every editor does for ⌘B on an empty line.
 */
export function toggleWrap(text: string, start: number, end: number, marker: string, closing = marker): Edit {
  const selected = text.slice(start, end);
  const before = text.slice(0, start);
  const after = text.slice(end);

  if (before.endsWith(marker) && after.startsWith(closing)) {
    return {
      text: before.slice(0, -marker.length) + selected + after.slice(closing.length),
      start: start - marker.length,
      end: end - marker.length,
    };
  }

  if (selected.startsWith(marker) && selected.endsWith(closing) && selected.length > marker.length + closing.length) {
    const inner = selected.slice(marker.length, selected.length - closing.length);
    return { text: before + inner + after, start, end: start + inner.length };
  }

  return {
    text: `${before}${marker}${selected}${closing}${after}`,
    start: start + marker.length,
    end: end + marker.length,
  };
}

/** Wrap the selection as a link, putting the caret where the URL goes. */
export function makeLink(text: string, start: number, end: number): Edit {
  const selected = text.slice(start, end) || "text";
  const inserted = `[${selected}]()`;
  return {
    text: text.slice(0, start) + inserted + text.slice(end),
    // Caret inside the empty parentheses, ready for the URL.
    start: start + inserted.length - 1,
    end: start + inserted.length - 1,
  };
}

/**
 * Enter inside a list, quote or callout continues it.
 *
 * Pressing Enter on an item that is empty ends the list instead of adding
 * another blank bullet — the behaviour every Markdown editor has and whose
 * absence is immediately annoying.
 */
export function continueBlock(text: string, start: number): Edit | null {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const line = text.slice(lineStart, start);

  const list = line.match(LIST);
  if (list) {
    const [, indent, marker, digits, delimiter] = list;

    // An empty item: clear it and break out of the list.
    if (line.trim() === marker.trim()) {
      return { text: text.slice(0, lineStart) + text.slice(start), start: lineStart, end: lineStart };
    }

    const next = digits
      ? `${indent}${Number(digits) + 1}${delimiter} `
      : `${indent}${marker.replace(/\[[xX]\]/, "[ ]")}`;
    const inserted = `\n${next}`;
    return {
      text: text.slice(0, start) + inserted + text.slice(start),
      start: start + inserted.length,
      end: start + inserted.length,
    };
  }

  const quote = line.match(QUOTE);
  if (quote) {
    if (line.trim() === ">") {
      return { text: text.slice(0, lineStart) + text.slice(start), start: lineStart, end: lineStart };
    }
    const inserted = `\n${quote[1]}`;
    return {
      text: text.slice(0, start) + inserted + text.slice(start),
      start: start + inserted.length,
      end: start + inserted.length,
    };
  }

  return null;
}

/** Tab and Shift+Tab indent or outdent every line the selection touches. */
export function shiftIndent(text: string, start: number, end: number, outdent: boolean): Edit {
  const from = text.lastIndexOf("\n", start - 1) + 1;
  const toEnd = text.indexOf("\n", end);
  const to = toEnd === -1 ? text.length : toEnd;

  const lines = text.slice(from, to).split("\n");
  let firstDelta = 0;
  let total = 0;

  const shifted = lines.map((line, i) => {
    if (outdent) {
      const removed = line.match(/^(\s{1,2})/)?.[1].length ?? 0;
      if (i === 0) firstDelta = -removed;
      total -= removed;
      return line.slice(removed);
    }
    if (i === 0) firstDelta = 2;
    total += 2;
    return `  ${line}`;
  });

  return {
    text: text.slice(0, from) + shifted.join("\n") + text.slice(to),
    start: Math.max(from, start + firstDelta),
    end: Math.max(from, end + total),
  };
}

/** Words in the body, for the counter under the editor. */
export function wordCount(text: string): number {
  const prose = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .trim();
  return prose ? prose.split(/\s+/).length : 0;
}
