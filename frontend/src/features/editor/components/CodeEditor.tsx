import Editor from '@monaco-editor/react';
import type { OpenFile } from '../types';

interface CodeEditorProps { file: OpenFile | null; onChange: (content: string) => void; onSave: () => void; }
export function CodeEditor({ file, onChange, onSave }: CodeEditorProps) {
  if (!file) return <div className="editor-empty"><div className="editor-glyph">✦</div><strong>Keine Datei geöffnet</strong><span>Wähle eine Datei im Explorer, um sie zu bearbeiten.</span></div>;
  return <div className="monaco-host"><Editor path={file.path} language={file.language} value={file.content} theme="vs-dark" onChange={(value) => onChange(value ?? '')} onMount={(editor, monaco) => editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, onSave)} options={{ automaticLayout: true, minimap: { enabled: false }, fontSize: 14, padding: { top: 18 }, scrollBeyondLastLine: false }} /></div>;
}
