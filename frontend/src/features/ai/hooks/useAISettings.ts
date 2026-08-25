import { useState } from 'react';
import type { AIConfig } from '../types';
import { DEFAULT_OLLAMA_URL, validateOllamaUrl } from '../providers/ollama/OllamaProvider';

const storageKey = 'nova.ai-config';
const defaultConfig: AIConfig = { provider: 'ollama', ollamaUrl: DEFAULT_OLLAMA_URL, model: '' };

export function useAISettings() {
  const [config, setConfigState] = useState<AIConfig>(() => readConfig());
  function updateConfig(patch: Partial<AIConfig>): void {
    const next = { ...config, ...patch };
    validateOllamaUrl(next.ollamaUrl);
    setConfigState(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }
  return { config, updateConfig };
}

function readConfig(): AIConfig {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    if (typeof parsed === 'object' && parsed !== null) {
      const value = parsed as Record<string, unknown>;
      if (value.provider === 'ollama' && typeof value.ollamaUrl === 'string' && typeof value.model === 'string') { try { validateOllamaUrl(value.ollamaUrl); return { provider: 'ollama', ollamaUrl: value.ollamaUrl, model: value.model }; } catch { /* use defaults */ } }
    }
  } catch { /* use defaults */ }
  return defaultConfig;
}
