export interface ProjectManifest {
  formatVersion: 1;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecentProject extends ProjectManifest {
  path: string;
}

export interface FileEntry {
  name: string;
  path: string;
  kind: 'file' | 'directory';
}

export type AppView = 'home' | 'workspace' | 'settings';
export type SidebarSection = 'explorer' | 'search' | 'source-control' | 'tests' | 'activity' | 'settings';
