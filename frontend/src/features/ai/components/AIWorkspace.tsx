import { useMemo, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import type { AIConfig } from '../types';
import { OllamaProvider } from '../providers/ollama/OllamaProvider';
import { useChat } from '../hooks/useChat';
import type { OpenFile } from '../../editor/types';
import type { FileSystemAdapter } from '../../../adapters/filesystem/types';
import { requestCodeSuggestion, type CodeSuggestion } from '../services/codeSuggestionService';
import type { AICodeAction } from '../services/promptService';
import { applyCodeSuggestion } from '../../editor/services/diffService';
import { WorkspaceFileService } from '../../editor/services/workspaceFileService';
import { SuggestionDiff } from './SuggestionDiff';

const actions: Array<{ id: AICodeAction; label: string }> = [{ id: 'explain', label: 'Explain' }, { id: 'fix', label: 'Fix' }, { id: 'improve', label: 'Improve' }, { id: 'refactor', label: 'Refactor' }, { id: 'generate', label: 'Generate' }, { id: 'comments', label: 'Comments' }];

export function AIWorkspace({ config, projectRoot, activeFile, selection, fileSystem, onApply }: { config: AIConfig; projectRoot: string; activeFile: OpenFile | null; selection: string; fileSystem: FileSystemAdapter; onApply?: (content: string) => void }) {
  const [tab, setTab] = useState('Chat');
  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState<CodeSuggestion | null>(null);
  const [workingAction, setWorkingAction] = useState<AICodeAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const provider = useMemo(() => new OllamaProvider(config.ollamaUrl), [config.ollamaUrl]);
  const chat = useChat(provider, config.model);
  const fileService = useMemo(() => new WorkspaceFileService(fileSystem), [fileSystem]);
  async function submit(): Promise<void> { await chat.send(input); setInput(''); }
  async function runAction(action: AICodeAction): Promise<void> {
    if (!activeFile || !config.model) return;
    setWorkingAction(action); setActionError(null);
    try { const guidance = await fileService.readProjectGuidance(projectRoot); setSuggestion(await requestCodeSuggestion(provider, config.model, action, activeFile, selection, guidance)); } catch (caught) { setActionError(caught instanceof Error ? caught.message : 'AI-Vorschlag konnte nicht erstellt werden.'); } finally { setWorkingAction(null); }
  }
  async function applySuggestion(): Promise<void> {
    if (!suggestion || !activeFile) return;
    if (suggestion.filePath !== activeFile.path) { setActionError('Die Datei hat sich geändert. Bitte den Vorschlag erneut erstellen.'); return; }
    setSaving(true); setActionError(null);
    try { const content = applyCodeSuggestion(activeFile.content, selection, suggestion.proposed); await fileService.saveFile({ ...activeFile, content }); onApply?.(content); setSuggestion(null); } catch (caught) { setActionError(caught instanceof Error ? caught.message : 'Vorschlag konnte nicht gespeichert werden.'); } finally { setSaving(false); }
  }
  return <aside className="ai-panel"><div className="ai-heading"><div><span className="eyebrow">✦ NOVA</span><h2>AI Workspace</h2></div></div><div className="ai-tabs" role="tablist">{['Chat', 'Agent', 'Debug', 'Explain', 'Tests'].map((item) => <button key={item} className={tab === item ? 'active' : ''} role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{item}</button>)}</div>{tab === 'Chat' ? <div className="chat-content"><div className="ai-actions">{actions.map((action) => <button key={action.id} disabled={!activeFile || !config.model || Boolean(workingAction)} onClick={() => void runAction(action.id)}>{workingAction === action.id ? '...' : action.label}</button>)}</div>{suggestion ? <SuggestionDiff suggestion={suggestion} onApply={() => void applySuggestion()} onReject={() => setSuggestion(null)} saving={saving} /> : <div className="chat-messages">{chat.messages.length === 0 && <div className="chat-empty"><div className="chat-orbit"><Bot size={22} /></div><strong>{config.model ? 'Ask Nova anything.' : 'Kein Modell konfiguriert.'}</strong><span>{activeFile ? `${activeFile.name}${selection ? ' · Auswahl aktiv' : ''}` : 'Öffne eine Datei für Code-Aktionen.'}</span></div>}{chat.messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === 'user' ? 'You' : 'Nova'}</span><p>{message.content}</p></div>)}{chat.isThinking && <div className="thinking">Nova is thinking...</div>}{chat.error && <div className="chat-error" role="alert">Could not connect to Ollama.<small>{chat.error}</small></div>}{actionError && <div className="chat-error" role="alert">{actionError}</div>}</div>}<div className="chat-input"><textarea value={input} disabled={!chat.canChat || chat.isThinking} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit(); } }} placeholder={chat.canChat ? 'Message Nova ...' : 'Configure a model in Settings'} aria-label="Message Nova" rows={2} /><button className="icon-button" disabled={!chat.canChat || chat.isThinking || !input.trim()} onClick={() => void submit()} aria-label="Nachricht senden"><Send size={16} /></button></div></div> : <div className="ai-content"><div className="chat-orbit"><Bot size={24} /></div><h3>{tab} workspace</h3><p>Dieser Bereich bleibt bis zu einer späteren Phase deaktiviert.</p></div>}<div className="ai-footer"><span>{config.model ? 'Local model' : 'Model not configured'}</span><span>Ollama</span></div></aside>;
}
