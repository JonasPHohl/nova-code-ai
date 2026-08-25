import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProjectSwitchDialog } from './ProjectSwitchDialog';

const file = { path: 'C:/Project/app.ts', name: 'app.ts', content: 'new', savedContent: 'old', language: 'typescript' };

describe('ProjectSwitchDialog', () => {
  it.each([
    ['Speichern', 'onSave'], ['Verwerfen', 'onDiscard'], ['Abbrechen', 'onCancel']
  ] as const)('supports %s without changing files itself', async (label, callback) => {
    const handlers = { onSave: vi.fn(), onDiscard: vi.fn(), onCancel: vi.fn() };
    render(<ProjectSwitchDialog files={[file]} {...handlers} saving={false} />);
    await userEvent.click(screen.getByRole('button', { name: label }));
    expect(handlers[callback]).toHaveBeenCalledOnce();
  });
});
