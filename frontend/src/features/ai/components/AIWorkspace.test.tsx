import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AIWorkspace } from './AIWorkspace';

const config = { provider: 'ollama' as const, ollamaUrl: 'http://localhost:11434', model: 'qwen-coder' };
const fileSystem = { readFile: async () => '', writeFile: async () => undefined, deleteFile: async () => undefined, exists: async () => true, createDirectory: async () => undefined, listDirectory: async () => [] };
const props = { projectRoot: 'C:/Project', activeFile: null, selection: '', fileSystem };

describe('AIWorkspace', () => {
  const activeFile = { path: 'C:/Project/app.py', name: 'app.py', content: 'print("hello")', savedContent: 'print("hello")', language: 'python' };

  it('runs Explain and shows the explanation without offering a file write', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ done: true, message: { role: 'assistant', content: 'Diese Funktion gibt eine Begrüßung aus.' } }) }));
    render(<AIWorkspace config={config} {...props} activeFile={activeFile} />);
    await userEvent.click(screen.getByRole('button', { name: 'Explain' }));
    expect(await screen.findByRole('region', { name: 'Code-Erklärung' })).toHaveTextContent('Diese Funktion');
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument();
  });

  it('runs Add comments and presents a diff for explicit approval', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ done: true, message: { role: 'assistant', content: '# greeting\nprint("hello")' } }) }));
    render(<AIWorkspace config={config} {...props} activeFile={activeFile} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add comments' }));
    expect(await screen.findByRole('region', { name: 'AI-Vorschlag' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  it('sends a message and renders the response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ done: true, message: { role: 'assistant', content: 'Hallo! Ich bin Nova.' } }) }));
    render(<AIWorkspace config={config} {...props} />);
    const input = screen.getByRole('textbox', { name: 'Message Nova' });
    await userEvent.type(input, 'Hallo');
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByText('Hallo! Ich bin Nova.')).toBeInTheDocument();
  });

  it('renders a connection error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<AIWorkspace config={config} {...props} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Message Nova' }), 'Hallo');
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not connect to Ollama.');
  });

  it('keeps chat disabled without a model', () => {
    render(<AIWorkspace config={{ ...config, model: '' }} {...props} />);
    expect(screen.getByRole('textbox', { name: 'Message Nova' })).toBeDisabled();
  });

  it('clears the chat without making another request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ done: true, message: { role: 'assistant', content: 'Antwort' } }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<AIWorkspace config={config} {...props} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Message Nova' }), 'Hallo');
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByText('Antwort')).toBeInTheDocument();
    const callsBeforeClear = fetchMock.mock.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Clear Chat' }));
    expect(screen.queryByText('Antwort')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(callsBeforeClear);
  });
});
