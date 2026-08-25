import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AIWorkspace } from './AIWorkspace';

const config = { provider: 'ollama' as const, ollamaUrl: 'http://localhost:11434', model: 'qwen-coder' };

describe('AIWorkspace', () => {
  it('sends a message and renders the response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ done: true, message: { role: 'assistant', content: 'Hallo! Ich bin Nova.' } }) }));
    render(<AIWorkspace config={config} />);
    const input = screen.getByRole('textbox', { name: 'Message Nova' });
    await userEvent.type(input, 'Hallo');
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByText('Hallo! Ich bin Nova.')).toBeInTheDocument();
  });

  it('renders a connection error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<AIWorkspace config={config} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Message Nova' }), 'Hallo');
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not connect to Ollama.');
  });

  it('keeps chat disabled without a model', () => {
    render(<AIWorkspace config={{ ...config, model: '' }} />);
    expect(screen.getByRole('textbox', { name: 'Message Nova' })).toBeDisabled();
  });
});
