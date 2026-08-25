import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EditorTabs } from './EditorTabs';

const file = { path: 'C:/Project/app.ts', name: 'app.ts', content: 'changed', savedContent: 'original', language: 'typescript' };

describe('EditorTabs', () => {
  it('shows modified state and supports activation and closing', async () => {
    const onActivate = vi.fn();
    const onClose = vi.fn();
    render(<EditorTabs files={[file]} activePath={file.path} onActivate={onActivate} onClose={onClose} />);
    expect(screen.getByText('app.ts ●')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab'));
    await userEvent.click(screen.getByRole('button', { name: 'app.ts schließen' }));
    expect(onActivate).toHaveBeenCalledWith(file.path);
    expect(onClose).toHaveBeenCalledWith(file.path);
  });
});
