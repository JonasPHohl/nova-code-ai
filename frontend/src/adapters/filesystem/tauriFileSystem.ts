import { invoke } from '@tauri-apps/api/core';
import type { FileEntry } from '../../core/types/project';
import type { FileSystemAdapter } from './types';

interface NativeFileEntry { name: string; path: string; kind: 'file' | 'directory'; }

export class TauriFileSystem implements FileSystemAdapter {
  constructor(private readonly projectRoot: string) {}

  readFile(path: string): Promise<string> { return invoke<string>('read_project_file', { root: this.projectRoot, path }); }
  writeFile(path: string, content: string): Promise<void> { return invoke('write_project_file', { root: this.projectRoot, path, content }); }
  exists(path: string): Promise<boolean> { return invoke<boolean>('project_path_exists', { root: this.projectRoot, path }); }
  createDirectory(path: string): Promise<void> { return invoke('create_project_directory', { root: this.projectRoot, path }); }
  async listDirectory(path: string): Promise<FileEntry[]> {
    const entries = await invoke<NativeFileEntry[]>('list_project_directory', { root: this.projectRoot, path });
    return entries.map((entry) => ({ ...entry, path: entry.path.replaceAll('\\', '/') }));
  }
}
