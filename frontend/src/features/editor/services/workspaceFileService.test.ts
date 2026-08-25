import { describe, expect, it } from 'vitest';
import { MockFileSystem } from '../../../adapters/filesystem/mockFileSystem';
import { WorkspaceFileService } from './workspaceFileService';

describe('WorkspaceFileService', () => {
  it('opens files and builds a recursive tree without .nova', async () => {
    const fileSystem = new MockFileSystem('C:/Project-editor-tree');
    await fileSystem.createDirectory('C:/Project-editor-tree/src');
    await fileSystem.createDirectory('C:/Project-editor-tree/.nova');
    await fileSystem.writeFile('C:/Project-editor-tree/src/app.py', 'print("hello")');
    await fileSystem.writeFile('C:/Project-editor-tree/.nova/project.json', '{}');
    const service = new WorkspaceFileService(fileSystem);
    const tree = await service.loadTree('C:/Project-editor-tree');
    expect(tree).toEqual([{ name: 'src', path: 'c:/project-editor-tree/src', kind: 'directory', children: [{ name: 'app.py', path: 'c:/project-editor-tree/src/app.py', kind: 'file', children: undefined }] }]);
    expect((await service.openFile('C:/Project-editor-tree/src/app.py')).language).toBe('python');
  });

  it('searches file contents recursively', async () => {
    const fileSystem = new MockFileSystem('C:/Project-editor-search');
    await fileSystem.writeFile('C:/Project-editor-search/app.ts', 'const answer = 42;');
    const results = await new WorkspaceFileService(fileSystem).search('C:/Project-editor-search', 'answer');
    expect(results[0]).toMatchObject({ line: 1, column: 7, preview: 'const answer = 42;' });
  });

  it('keeps save errors available to the caller', async () => {
    const service = new WorkspaceFileService({
      readFile: async () => '', writeFile: async () => { throw new Error('write failed'); }, exists: async () => true,
      createDirectory: async () => undefined, deleteFile: async () => undefined, listDirectory: async () => []
    });
    await expect(service.saveFile({ path: 'C:/Project/app.ts', name: 'app.ts', content: 'x', savedContent: '', language: 'typescript' })).rejects.toThrow('write failed');
  });

  it('reads optional Nova guidance without exposing it in the tree', async () => {
    const fileSystem = new MockFileSystem('C:/Project-guidance');
    await fileSystem.createDirectory('C:/Project-guidance/.nova');
    await fileSystem.writeFile('C:/Project-guidance/.nova/rules.md', 'rules');
    await fileSystem.writeFile('C:/Project-guidance/.nova/memory.md', 'memory');
    const service = new WorkspaceFileService(fileSystem);
    await expect(service.readProjectGuidance('C:/Project-guidance')).resolves.toEqual({ rules: 'rules', memory: 'memory' });
    await expect(service.loadTree('C:/Project-guidance')).resolves.toEqual([]);
  });
});
