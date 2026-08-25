import type { ProjectManifest, RecentProject } from '../core/types/project';
import { validateProjectName, validateProjectPath } from '../core/errors/pathValidation';
import type { FileSystemAdapter } from '../adapters/filesystem/types';

const recentKey = 'nova.recent-projects';

export class ProjectService {
  constructor(private readonly fileSystem: FileSystemAdapter, private readonly projectRoot: string) {}

  async createProject(path: string, name: string): Promise<RecentProject> {
    const root = validateProjectPath(this.projectRoot, path);
    const safeName = validateProjectName(name);
    const now = new Date().toISOString();
    const manifest: ProjectManifest = { formatVersion: 1, name: safeName, createdAt: now, updatedAt: now };
    await this.fileSystem.createDirectory(`${root}/.nova`);
    await this.fileSystem.createDirectory(`${root}/.nova/context`);
    await this.fileSystem.createDirectory(`${root}/.nova/snapshots`);
    await this.fileSystem.writeFile(`${root}/.nova/project.json`, JSON.stringify(manifest, null, 2));
    await this.fileSystem.writeFile(`${root}/.nova/rules.md`, '# Project rules\n');
    await this.fileSystem.writeFile(`${root}/.nova/memory.md`, '# Project memory\n');
    await this.fileSystem.writeFile(`${root}/README.md`, `# ${safeName}\n`);
    return { ...manifest, path: root };
  }

  async readManifest(path: string): Promise<ProjectManifest> {
    const root = validateProjectPath(this.projectRoot, path);
    const raw = await this.fileSystem.readFile(`${root}/.nova/project.json`);
    const parsed: unknown = JSON.parse(raw);
    if (!isProjectManifest(parsed)) throw new Error('Ungültiges Nova-Projektformat.');
    return parsed;
  }

  getRecentProjects(): RecentProject[] {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(recentKey) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter(isRecentProject) : [];
    }
    catch { return []; }
  }

  rememberProject(project: RecentProject): void {
    const projects = [project, ...this.getRecentProjects().filter((item) => item.path !== project.path)].slice(0, 8);
    localStorage.setItem(recentKey, JSON.stringify(projects));
  }
}

function isRecentProject(value: unknown): value is RecentProject {
  if (typeof value !== 'object' || value === null || !isProjectManifest(value)) return false;
  return typeof (value as unknown as Record<string, unknown>).path === 'string';
}

function isProjectManifest(value: unknown): value is ProjectManifest {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return item.formatVersion === 1 && typeof item.name === 'string' && typeof item.createdAt === 'string' && typeof item.updatedAt === 'string';
}
