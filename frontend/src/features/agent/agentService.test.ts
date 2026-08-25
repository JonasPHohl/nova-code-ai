import { describe, expect, it } from 'vitest';
import { AgentService } from './agentService';
import { AgentExecutor } from './agentExecutor';
import { AgentToolGateway } from './agentTools';
import type { AIProvider } from '../ai/types';

const provider: AIProvider = { id: 'mock', name: 'Mock', type: 'local', isAvailable: async () => true, listModels: async () => [], chat: async ({ messages }) => {
  if (messages[0]?.content.includes('planning')) return { done: true, message: { role: 'assistant', content: '1. Analyse\n2. Erstellen' } };
  return { done: true, message: { role: 'assistant', content: JSON.stringify({ changes: [{ path: 'main.py', operation: 'create', newContent: 'print("hello")' }] }) } };
} };
function fileService() { const data = new Map<string, string>(); return { readFile: async (path: string) => data.get(path) ?? '', writeFile: async (path: string, content: string) => { data.set(path, content); }, createFile: async (path: string, content: string) => { data.set(path, content); }, deleteFile: async (path: string) => { data.delete(path); }, listDirectory: async () => [], searchFiles: async () => [], fileExists: async (path: string) => data.has(path) }; }

describe('AgentService', () => {
  it('creates a plan and multi-file proposal without writing', async () => {
    const service = new AgentService({ provider, model: 'model', fileService: fileService() }, 'C:/Project');
    const run = await service.prepareTask('Create a Python app');
    expect(run.plan?.steps).toHaveLength(2);
    expect(run.changes[0]).toMatchObject({ path: 'c:/project/main.py', operation: 'create', approved: false });
  });

  it('applies only approved changes and detects stale files', async () => {
    const fs = fileService();
    await fs.writeFile('c:/project/existing.py', 'old');
    const gateway = new AgentToolGateway('C:/Project', fs);
    const changes = await new AgentExecutor(gateway).prepareChanges([{ tool: 'create_file', path: 'C:/Project/app.py', content: 'x' }]);
    expect(await new AgentService({ provider, model: 'model', fileService: fs }, 'C:/Project').apply(changes)).toEqual([]);
    changes[0].approved = true;
    const applied = await new AgentService({ provider, model: 'model', fileService: fs }, 'C:/Project').apply(changes);
    expect(applied[0].error).toBeUndefined();
    expect(await fs.readFile('c:/project/app.py')).toBe('x');

    const stale = await new AgentExecutor(gateway).prepareChanges([{ tool: 'write_file', path: 'C:/Project/existing.py', content: 'new' }]);
    stale[0].approved = true;
    await fs.writeFile('c:/project/existing.py', 'changed externally');
    expect((await new AgentService({ provider, model: 'model', fileService: fs }, 'C:/Project').apply(stale))[0].error).toContain('verändert');
  });

  it('enforces the step limit', async () => {
    const fs = fileService();
    await expect(new AgentExecutor(new AgentToolGateway('C:/Project', fs), 1).prepareChanges([{ tool: 'create_file', path: 'a.py', content: '' }, { tool: 'create_file', path: 'b.py', content: '' }])).rejects.toThrow('maximum number');
  });
});
