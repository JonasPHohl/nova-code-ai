export type AIProviderType = 'local' | 'cloud';
export type AIProviderStatus = 'connected' | 'offline' | 'checking' | 'not-configured';
export type AIChatRole = 'system' | 'user' | 'assistant';

export interface AIModel { name: string; size?: number; modifiedAt?: string; }
export interface AIChatMessage { role: AIChatRole; content: string; }
export interface AIChatRequest { model: string; messages: AIChatMessage[]; signal?: AbortSignal; }
export interface AIChatResponse { message: AIChatMessage; done: boolean; }
export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly type: AIProviderType;
  isAvailable(): Promise<boolean>;
  listModels(): Promise<AIModel[]>;
  chat(request: AIChatRequest): Promise<AIChatResponse>;
}
export interface AIConfig { provider: 'ollama'; ollamaUrl: string; model: string; }
