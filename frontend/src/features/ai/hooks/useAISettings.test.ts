import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAISettings } from './useAISettings';

beforeEach(() => localStorage.clear());

describe('useAISettings', () => {
  it('persists the Ollama URL and selected model', () => {
    const { result } = renderHook(() => useAISettings());
    act(() => result.current.updateConfig({ ollamaUrl: 'http://127.0.0.1:11434', model: 'qwen-coder' }));
    expect(result.current.config).toMatchObject({ ollamaUrl: 'http://127.0.0.1:11434', model: 'qwen-coder' });
    expect(localStorage.getItem('nova.ai-config')).toContain('qwen-coder');
  });
});
