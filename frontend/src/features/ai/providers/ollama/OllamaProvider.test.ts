import { afterEach, describe, expect, it, vi } from 'vitest';
import { OllamaProvider, validateOllamaUrl } from './OllamaProvider';

afterEach(() => vi.restoreAllMocks());

describe('OllamaProvider', () => {
  it('reports availability and lists models', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ models: [{ name: 'qwen-coder', size: 10 }] }) }));
    const provider = new OllamaProvider();
    await expect(provider.isAvailable()).resolves.toBe(true);
    await expect(provider.listModels()).resolves.toEqual([{ name: 'qwen-coder', size: 10, modifiedAt: undefined }]);
  });

  it('reports availability failure and chat errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(new OllamaProvider().isAvailable()).resolves.toBe(false);
    await expect(new OllamaProvider().chat({ model: 'qwen-coder', messages: [] })).rejects.toThrow('offline');
  });

  it('sends a non-streaming chat request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ done: true, message: { role: 'assistant', content: 'Hallo!' } }) });
    vi.stubGlobal('fetch', fetchMock);
    const response = await new OllamaProvider().chat({ model: 'qwen-coder', messages: [{ role: 'user', content: 'Hallo' }] });
    expect(response.message.content).toBe('Hallo!');
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:11434/api/chat', expect.objectContaining({ method: 'POST' }));
  });

  it('only accepts localhost URLs', () => {
    expect(validateOllamaUrl('http://localhost:11434/')).toBe('http://localhost:11434');
    expect(() => validateOllamaUrl('https://example.com')).toThrow();
  });
});
