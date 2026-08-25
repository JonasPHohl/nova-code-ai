import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AgentWorkspace } from './AgentWorkspace';
import type { AIProvider } from '../ai/types';

const provider: AIProvider = {
  id: 'mock', name: 'Mock', type: 'local', isAvailable: async () => true, listModels: async () => [],
  chat: async ({ messages }) => messages[0]?.content.includes('planning')
    ? { done: true, message: { role: 'assistant', content: '1. Analyse\n2. Erstellen' } }
    : { done: true, message: { role: 'assistant', content: '{"changes":[{"path":"main.py","operation":"create","newContent":"print(1)"}]}' } }
};
const fileSystem = { readFile: async () => '', writeFile: async () => undefined, deleteFile: async () => undefined, exists: async () => false, createDirectory: async () => undefined, listDirectory: async () => [] };

describe('AgentWorkspace', () => {
  it('shows a plan and requires approval for proposed files', async () => {
    render(<AgentWorkspace provider={provider} model="model" projectRoot="C:/Project" fileSystem={fileSystem} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Agent task' }), 'Create a Python app');
    await userEvent.click(screen.getByRole('button', { name: 'Create plan' }));
    expect(await screen.findByText('Analyse')).toBeInTheDocument();
    expect(await screen.findByText('c:/project/main.py')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply selected' })).toBeDisabled();
    expect(screen.getByText('approval required')).toBeInTheDocument();
  });
});
