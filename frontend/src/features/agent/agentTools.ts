import { validateProjectPath } from '../../core/errors/pathValidation';
import type { AgentFileServiceContract, AgentToolCall } from './types';

export class AgentToolGateway {
  constructor(private readonly root: string, private readonly fileService: AgentFileServiceContract) {}

  async executeRead(call: AgentToolCall): Promise<unknown> {
    if (!call.path) throw new Error('Tool benötigt einen Pfad.');
    const path = this.safeReadPath(call.path);
    switch (call.tool) {
      case 'read_file': return this.fileService.readFile(path);
      case 'file_exists': return this.fileService.fileExists(path);
      case 'list_directory': return this.fileService.listDirectory(path);
      case 'search_files': return this.fileService.searchFiles(call.content ?? '');
      default: throw new Error('Schreib-Tools benötigen eine Benutzerfreigabe.');
    }
  }

  async fileExists(path: string): Promise<boolean> { return this.fileService.fileExists(this.safePath(path)); }
  async readFile(path: string): Promise<string> { return this.fileService.readFile(this.safePath(path)); }

  async readProtectedFile(path: string): Promise<string> { return this.fileService.readFile(this.safeReadPath(path)); }

  private safeReadPath(path: string): string {
    const candidate = /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith('/') ? path : `${this.root}/${path}`;
    return validateProjectPath(this.root, candidate);
  }

  safePath(path: string): string {
    const candidate = /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith('/') ? path : `${this.root}/${path}`;
    const normalized = validateProjectPath(this.root, candidate);
    if (normalized === this.root.toLowerCase() || normalized.split('/').includes('.nova')) throw new Error('.nova ist für Agenten schreibgeschützt.');
    return normalized;
  }
}
