import { DiffEditor } from '@monaco-editor/react';
import type { CodeSuggestion } from '../services/codeSuggestionService';

export function SuggestionDiff({ suggestion, onApply, onReject, saving }: { suggestion: CodeSuggestion; onApply: () => void; onReject: () => void; saving: boolean }) {
  return <section className="suggestion-diff" aria-label="AI-Vorschlag"><div className="suggestion-header"><div><span className="eyebrow">AI SUGGESTION</span><strong>{suggestion.action} · {suggestion.filePath.split(/[\\/]/).at(-1)}</strong></div><div className="suggestion-actions"><button className="secondary-button" onClick={onReject} disabled={saving}>Reject</button><button className="primary-button" onClick={onApply} disabled={saving}>{saving ? 'Saving ...' : 'Apply'}</button></div></div><DiffEditor height="310px" original={suggestion.original} modified={suggestion.proposed} language={suggestion.language} theme="vs-dark" options={{ readOnly: true, automaticLayout: true, minimap: { enabled: false } }} /></section>;
}
