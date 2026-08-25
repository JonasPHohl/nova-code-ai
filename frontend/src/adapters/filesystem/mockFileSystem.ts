import type { FileEntry } from '../../core/types/project';
import { validateProjectPath } from '../../core/errors/pathValidation';
import type { FileSystemAdapter } from './types';

export class MockFileSystem implements FileSystemAdapter {
  private readonly files: Map<string, string>;
  private readonly directories: Set<string>;
  private readonly storageKey: string;

  constructor(private readonly projectRoot: string) {
    this.storageKey = `nova.mock-filesystem:${projectRoot.toLowerCase()}`;
    const saved = readStoredFileSystem(this.storageKey);
    this.files = new Map(Object.entries(saved.files ?? {}));
    this.directories = new Set(saved.directories ?? [projectRoot]);
    this.directories.add(projectRoot.toLowerCase());
  }

  async readFile(path: string): Promise<string> {
    const safePath = validateProjectPath(this.projectRoot, path);
    const content = this.files.get(safePath);
    if (content === undefined) throw new Error(`Datei nicht gefunden: ${path}`);
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    const safePath = validateProjectPath(this.projectRoot, path);
    this.files.set(safePath, content);
    this.persist();
  }

  async deleteFile(path: string): Promise<void> {
    const safePath = validateProjectPath(this.projectRoot, path);
    this.files.delete(safePath);
    this.persist();
  }

  async exists(path: string): Promise<boolean> {
    const safePath = validateProjectPath(this.projectRoot, path);
    return this.files.has(safePath) || this.directories.has(safePath);
  }

  async createDirectory(path: string): Promise<void> {
    this.directories.add(validateProjectPath(this.projectRoot, path));
    this.persist();
  }

  async listDirectory(path: string): Promise<FileEntry[]> {
    const safePath = validateProjectPath(this.projectRoot, path);
    const prefix = `${safePath}/`;
    const entries = new Map<string, FileEntry>();
    for (const filePath of this.files.keys()) {
      if (filePath.startsWith(prefix)) {
        const name = filePath.slice(prefix.length).split('/')[0];
        entries.set(name, { name, path: `${safePath}/${name}`, kind: filePath === `${safePath}/${name}` ? 'file' : 'directory' });
      }
    }
    for (const directoryPath of this.directories) {
      if (directoryPath.startsWith(prefix)) {
        const name = directoryPath.slice(prefix.length).split('/')[0];
        entries.set(name, { name, path: `${safePath}/${name}`, kind: 'directory' });
      }
    }
    return [...entries.values()].sort((a, b) => a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'directory' ? -1 : 1);
  }

  private persist(): void {
    localStorage.setItem(this.storageKey, JSON.stringify({ files: Object.fromEntries(this.files), directories: [...this.directories] }));
  }
}

function readStoredFileSystem(storageKey: string): { files?: Record<string, string>; directories?: string[] } {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    if (typeof parsed !== 'object' || parsed === null) return {};
    const value = parsed as Record<string, unknown>;
    return {
      files: isStringRecord(value.files) ? value.files : {},
      directories: Array.isArray(value.directories) && value.directories.every((item) => typeof item === 'string') ? value.directories : []
    };
  } catch {
    return {};
  }
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return typeof value === 'object' && value !== null && Object.values(value).every((item) => typeof item === 'string');
}
