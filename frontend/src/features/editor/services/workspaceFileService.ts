import type { FileEntry } from '../../../core/types/project';
import type { FileSystemAdapter } from '../../../adapters/filesystem/types';
import { detectLanguage } from '../language';
import type { ExplorerNode, OpenFile, SearchResult } from '../types';

export class WorkspaceFileService {
  constructor(private readonly fileSystem: FileSystemAdapter, private readonly root = '.') {}

  async readFile(path: string): Promise<string> { return this.fileSystem.readFile(path); }
  async writeFile(path: string, content: string): Promise<void> { return this.fileSystem.writeFile(path, content); }

  async openFile(path: string): Promise<OpenFile> {
    const content = await this.fileSystem.readFile(path);
    return { path, name: path.split('/').at(-1) ?? path, content, savedContent: content, language: detectLanguage(path) };
  }

  async saveFile(file: OpenFile): Promise<void> {
    await this.fileSystem.writeFile(file.path, file.content);
  }

  async deleteFile(path: string): Promise<void> {
    await this.fileSystem.deleteFile(path);
  }

  async createFile(path: string, content: string): Promise<void> {
    if (await this.fileSystem.exists(path)) throw new Error(`Datei existiert bereits: ${path}`);
    await this.fileSystem.writeFile(path, content);
  }

  async fileExists(path: string): Promise<boolean> { return this.fileSystem.exists(path); }
  async listDirectory(path: string): Promise<unknown> { return this.fileSystem.listDirectory(path); }
  async searchFiles(query: string): Promise<unknown> { return this.search(this.root, query); }
  async readProjectGuidance(root: string): Promise<{ rules?: string; memory?: string }> {
    const guidance: { rules?: string; memory?: string } = {};
    try { guidance.rules = await this.fileSystem.readFile(`${root}/.nova/rules.md`); } catch { /* optional guidance */ }
    try { guidance.memory = await this.fileSystem.readFile(`${root}/.nova/memory.md`); } catch { /* optional guidance */ }
    return guidance;
  }

  async loadTree(root: string): Promise<ExplorerNode[]> {
    return this.loadChildren(root);
  }

  async search(root: string, query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    if (!query.trim()) return results;
    for (const node of await this.flatten(await this.loadTree(root))) {
      if (node.kind !== 'file') continue;
      const content = await this.fileSystem.readFile(node.path);
      content.split('\n').forEach((line, index) => {
        const column = line.toLowerCase().indexOf(query.toLowerCase());
        if (column >= 0) results.push({ path: node.path, line: index + 1, column: column + 1, preview: line.trim().slice(0, 120) });
      });
    }
    return results;
  }

  private async loadChildren(path: string): Promise<ExplorerNode[]> {
    const entries = (await this.fileSystem.listDirectory(path)).filter((entry) => entry.name !== '.nova');
    return Promise.all(entries.map(async (entry) => ({
      ...entry,
      children: entry.kind === 'directory' ? await this.loadChildren(entry.path) : undefined
    })));
  }

  private async flatten(nodes: ExplorerNode[]): Promise<ExplorerNode[]> {
    const flat: ExplorerNode[] = [];
    for (const node of nodes) { flat.push(node); if (node.children) flat.push(...await this.flatten(node.children)); }
    return flat;
  }
}
