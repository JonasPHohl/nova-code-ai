import { describe, expect, it } from 'vitest';
import { buildCodePrompt } from './promptService';

describe('buildCodePrompt', () => {
  it('includes action, file, language, selection and project guidance', () => {
    const [system, user] = buildCodePrompt('refactor', { file: { path: 'C:/Project/app.py', name: 'app.py', content: 'whole', savedContent: 'whole', language: 'python' }, selection: 'selected()', rules: 'Keep functions small.', memory: 'Uses pytest.' });
    expect(system.content).toContain('Never edit files');
    expect(user.content).toContain('Refactor');
    expect(user.content).toContain('C:/Project/app.py');
    expect(user.content).toContain('selected()');
    expect(user.content).toContain('Keep functions small.');
  });
});