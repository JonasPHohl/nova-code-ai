import type { RecentProject } from '../core/types/project';

export interface ProjectState {
  activeProject: RecentProject | null;
  recentProjects: RecentProject[];
  setActiveProject: (project: RecentProject) => void;
}

export function createProjectState(recentProjects: RecentProject[] = []): ProjectState {
  let activeProject: RecentProject | null = null;
  return {
    activeProject,
    recentProjects,
    setActiveProject: (project) => { activeProject = project; }
  };
}
