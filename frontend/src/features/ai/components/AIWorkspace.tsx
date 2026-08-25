import { useMemo, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import type { AIConfig } from '../types';
import { OllamaProvider } from '../providers/ollama/OllamaProvider';
import { useChat } from '../hooks/useChat';

export function AIWorkspace({ config }: { config: AIConfig }) {
  const [tab, setTab] = useState('Chat');
  const [input, setInput] = useState('');
  const provider = useMemo(() => new OllamaProvider(config.ollamaUrl), [config.ollamaUrl]);
  const chat = useChat(provider, config.model);
  async function submit(): Promise<void> { await chat.send(input); setInput(''); }
  return <aside className="ai-panel"><div className="ai-heading"><div><span className="eyebrow">✦ NOVA</span><h2>AI Workspace</h2></div></div><div className="ai-tabs" role="tablist">{['Chat', 'Agent', 'Debug', 'Explain', 'Tests'].map((item) => <button key={item} className={tab === item ? 'active' : ''} role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{item}</button>)}</div>{tab === 'Chat' ? <div className="chat-content"><div className="chat-messages">{chat.messages.length === 0 && <div className="chat-empty"><div className="chat-orbit"><Bot size={22} /></div><strong>{config.model ? 'Ask Nova anything.' : 'Ollama ist erreichbar, aber kein Modell ist konfiguriert.'}</strong><span>{config.model ? 'Lokaler Chat ohne automatischen Dateikontext.' : 'Wähle in den Settings ein Modell aus.'}</span></div>}{chat.messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === 'user' ? 'You' : 'Nova'}</span><p>{message.content}</p></div>)}{chat.isThinking && <div className="thinking">Nova is thinking...</div>}{chat.error && <div className="chat-error" role="alert">Could not connect to Ollama.<small>{chat.error}</small></div>}</div><div className="chat-input"><textarea value={input} disabled={!chat.canChat || chat.isThinking} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit(); } }} placeholder={chat.canChat ? 'Message Nova ...' : 'Configure a model in Settings'} aria-label="Message Nova" rows={2} /><button className="icon-button" disabled={!chat.canChat || chat.isThinking || !input.trim()} onClick={() => void submit()} aria-label="Nachricht senden"><Send size={16} /></button></div></div> : <div className="ai-content"><div className="chat-orbit"><Bot size={24} /></div><h3>{tab} workspace</h3><p>Dieser Bereich bleibt bis zu einer späteren Phase deaktiviert.</p></div>}<div className="ai-footer"><span>{config.model ? 'Local model' : 'Model not configured'}</span><span>Ollama</span></div></aside>;
}
