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

function normalize(value: string): string {
  return value.replaceAll('\\', '/').replace(/\/+/g, '/').replace(/\/$/, '').toLowerCase();
}
