export class UnsafePathError extends Error {
  constructor(path: string) {
    super(`Der Pfad ist nicht innerhalb des Projekts erlaubt: ${path}`);
    this.name = 'UnsafePathError';
  }
}

export function validateProjectPath(projectRoot: string, candidate: string): string {
  const root = normalize(projectRoot);
  const path = normalize(candidate);
  if (path !== root && !path.startsWith(`${root}/`)) {
    throw new UnsafePathError(candidate);
  }
  return path;
}

export function validateProjectName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed === '.' || trimmed === '..' || /[\\/:*?"<>|]/.test(trimmed) || trimmed.includes('..')) {
    throw new Error('Der Projektname enthält ungültige Zeichen.');
  }
  return trimmed;
}

function normalize(value: string): string {
  const replaced = value.replaceAll('\\', '/').replace(/\/+/g, '/');
  const parts = replaced.split('/');
  const normalized: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') { normalized.pop(); continue; }
    normalized.push(part);
  }
  return normalized.join('/').replace(/\/$/, '').toLowerCase();
}
