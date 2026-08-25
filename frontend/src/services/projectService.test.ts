import { describe, expect, it } from 'vitest';
import { MockFileSystem } from '../adapters/filesystem/mockFileSystem';
import { ProjectService } from './projectService';

describe('ProjectService', () => {
  it('creates and validates a Nova project manifest', async () => {
    const service = new ProjectService(new MockFileSystem('C:/NovaProjects'), 'C:/NovaProjects');
    const project = await service.createProject('C:/NovaProjects/Example', 'Example');
    const manifest = await service.readManifest(project.path);
    expect(manifest).toMatchObject({ formatVersion: 1, name: 'Example' });
  });
});
