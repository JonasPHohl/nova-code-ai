import { describe, expect, it } from 'vitest';
import { AgentToolGateway } from './agentTools';

const files = { readFile: async () => 'x', writeFile: async () => undefined, createFile: async () => undefined, deleteFile: async () => undefined, listDirectory: async () => [], searchFiles: async () => [], fileExists: async () => false };

describe('AgentToolGateway', () => {
  it('rejects traversal, absolute paths and .nova writes', () => {
    const gateway = new AgentToolGateway('C:/Project', files);
    expect(() => gateway.safePath('C:/Project/../other.py')).toThrow();
    expect(() => gateway.safePath('C:/other.py')).toThrow();
    expect(() => gateway.safePath('C:/Project/.nova/rules.md')).toThrow();
  });

  it('allows protected files to be read', async () => {
    const gateway = new AgentToolGateway('C:/Project', { ...files, readFile: async () => 'rules' });
    await expect(gateway.executeRead({ tool: 'read_file', path: 'C:/Project/.nova/rules.md' })).resolves.toBe('rules');
  });
});
