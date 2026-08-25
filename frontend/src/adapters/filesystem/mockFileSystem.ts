import type { FileEntry } from '../../core/types/project';
import { validateProjectPath } from '../../core/errors/pathValidation';
import type { FileSystemAdapter } from './types';

export class MockFileSystem implements FileSystemAdapter {
  private readonly files = new Map<string, string>();
  private readonly directories = new Set<string>();

  constructor(private readonly projectRoot: string) {
    this.directories.add(projectRoot);
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
  }

  async exists(path: string): Promise<boolean> {
    const safePath = validateProjectPath(this.projectRoot, path);
    return this.files.has(safePath) || this.directories.has(safePath);
  }

  async createDirectory(path: string): Promise<void> {
    this.directories.add(validateProjectPath(this.projectRoot, path));
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
    return [...entries.values()].sort((a, b) => a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'directory' ? -1 : 1);
  }
}
