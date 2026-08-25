export interface BackendClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  request<TResponse>(path: string, options?: RequestInit): Promise<TResponse>;
  subscribe<TEvent>(event: string, listener: (payload: TEvent) => void): () => void;
}

export class MockBackendClient implements BackendClient {
  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  async request<TResponse>(): Promise<TResponse> { throw new Error('Backend-Mock: Anfrage nicht implementiert.'); }
  subscribe<TEvent>(_event: string, _listener: (payload: TEvent) => void): () => void { return () => undefined; }
}
