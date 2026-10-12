const FENCE_RE = /^\s*(`{3,}|~{3,})/;

export interface MarkdownBlocks {
  completed: string[];
  tail: string;
}

// Splits streamed markdown into top-level blocks separated by blank lines so
// only the trailing block needs to be re-parsed as new tokens arrive. Blank
// lines inside fenced code blocks are ignored, and a block containing an
// unclosed fence is never emitted as completed.
export function splitMarkdownBlocks(text: string): MarkdownBlocks {
  const lines = text.split("\n");
  const completed: string[] = [];
  let current: string[] = [];
  let fence: string | null = null;

  for (const line of lines) {
    const match = FENCE_RE.exec(line);

    if (match) {
      const marker = match[1];
      if (!fence) {
        fence = marker;
      } else if (marker[0] === fence[0] && marker.length >= fence.length) {
        fence = null;
      }
      current.push(line);
      continue;
    }

    if (!fence && line.trim() === "") {
      if (current.length) {
        completed.push(current.join("\n"));
        current = [];
      }
      continue;
    }

    current.push(line);
  }

  return { completed, tail: current.join("\n") };
}
