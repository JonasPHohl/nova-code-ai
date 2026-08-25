import type { AIChatRequest, AIChatResponse, AIModel, AIProvider } from '../../types';

export const DEFAULT_OLLAMA_URL = 'http://localhost:11434';

export class OllamaProvider implements AIProvider {
  readonly id = 'ollama';
  readonly name = 'Ollama';
  readonly type = 'local' as const;

  constructor(private readonly baseUrl: string = DEFAULT_OLLAMA_URL) {
    validateOllamaUrl(baseUrl);
  }

  async isAvailable(): Promise<boolean> {
    try { const response = await fetch(`${this.baseUrl}/api/tags`); return response.ok; } catch { return false; }
  }

  async listModels(): Promise<AIModel[]> {
    const response = await fetch(`${this.baseUrl}/api/tags`);
    if (!response.ok) throw new Error(`Ollama antwortete mit HTTP ${response.status}.`);
    const payload: unknown = await response.json();
    if (!isModelPayload(payload)) throw new Error('Ollama lieferte eine ungültige Modellliste.');
    return payload.models.map((model) => ({ name: model.name, size: model.size, modifiedAt: model.modified_at }));
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    if (!request.model.trim()) throw new Error('Kein Ollama-Modell konfiguriert.');
    const response = await fetch(`${this.baseUrl}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: request.model, messages: request.messages, stream: false }), signal: request.signal });
    if (!response.ok) throw new Error(`Ollama antwortete mit HTTP ${response.status}.`);
    const payload: unknown = await response.json();
    if (!isChatPayload(payload)) throw new Error('Ollama lieferte eine ungültige Chat-Antwort.');
    return { message: payload.message, done: payload.done ?? true };
  }
}

export function validateOllamaUrl(value: string): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('Ollama URL ist ungültig.'); }
  if (!['http:', 'https:'].includes(url.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Ollama darf nur über localhost angesprochen werden.');
  return value.replace(/\/$/, '');
}

function isModelPayload(value: unknown): value is { models: Array<{ name: string; size?: number; modified_at?: string }> } {
  return typeof value === 'object' && value !== null && Array.isArray((value as Record<string, unknown>).models) && (value as { models: unknown[] }).models.every((model) => typeof model === 'object' && model !== null && typeof (model as Record<string, unknown>).name === 'string');
}
function isChatPayload(value: unknown): value is { message: { role: 'assistant'; content: string }; done?: boolean } {
  if (typeof value !== 'object' || value === null) return false;
  const message = (value as Record<string, unknown>).message;
  return typeof message === 'object' && message !== null && (message as Record<string, unknown>).role === 'assistant' && typeof (message as Record<string, unknown>).content === 'string';
}
