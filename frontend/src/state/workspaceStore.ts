export interface WorkspaceState {
  openFiles: string[];
  activeFile: string | null;
  bottomPanel: 'terminal' | 'problems' | 'output' | 'tests' | 'git';
}

export const initialWorkspaceState: WorkspaceState = {
  openFiles: [], activeFile: null, bottomPanel: 'terminal'
};
