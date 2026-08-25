export interface CodeDiff { original: string; proposed: string; }

export function createCodeDiff(original: string, proposed: string): CodeDiff {
  return { original, proposed };
}

export function applyCodeSuggestion(content: string, selection: string, proposed: string): string {
  if (!selection) return proposed;
  const index = content.indexOf(selection);
  if (index < 0) throw new Error('Die ursprüngliche Auswahl ist nicht mehr im Dokument vorhanden.');
  return `${content.slice(0, index)}${proposed}${content.slice(index + selection.length)}`;
}
