import { useEffect, useState } from 'react';
import { Check, Circle, RefreshCw } from 'lucide-react';
import type { AIConfig, AIModel, AIProviderStatus } from '../types';
import { OllamaProvider, validateOllamaUrl } from '../providers/ollama/OllamaProvider';

export function AISettings({ config, onChange }: { config: AIConfig; onChange: (patch: Partial<AIConfig>) => void }) {
  const [url, setUrl] = useState(config.ollamaUrl);
  const [models, setModels] = useState<AIModel[]>([]);
  const [status, setStatus] = useState<AIProviderStatus>('offline');
  const [error, setError] = useState<string | null>(null);
  async function checkConnection(): Promise<void> { setStatus('checking'); setError(null); try { const provider = new OllamaProvider(validateOllamaUrl(url)); const available = await provider.isAvailable(); setStatus(available ? 'connected' : 'offline'); if (available) setModels(await provider.listModels()); } catch (caught) { setStatus('offline'); setError(caught instanceof Error ? caught.message : 'Verbindung fehlgeschlagen.'); } }
  useEffect(() => { void checkConnection(); }, []);
  return <div className="setting-block"><span className="eyebrow">AI PROVIDER</span><h2>Ollama</h2><div className="ai-setting-status"><Circle size={8} fill="currentColor" />{status === 'connected' ? 'Connected' : status === 'checking' ? 'Checking ...' : 'Offline'}</div><label className="ai-field"><span>Ollama URL</span><input value={url} onChange={(event) => setUrl(event.target.value)} onBlur={() => { try { onChange({ ollamaUrl: validateOllamaUrl(url) }); } catch (caught) { setError(caught instanceof Error ? caught.message : 'URL ungültig.'); } }} /></label><label className="ai-field"><span>Model</span><select value={config.model} onChange={(event) => onChange({ model: event.target.value })}><option value="">Not configured</option>{models.map((model) => <option value={model.name} key={model.name}>{model.name}</option>)}</select></label><button className="secondary-button" onClick={() => void checkConnection()}><RefreshCw size={14} /> Test Connection</button>{config.model && status === 'connected' && <span className="setting-confirm"><Check size={13} /> Model bereit</span>}{error && <span className="setting-error" role="alert">{error}</span>}</div>;
}
