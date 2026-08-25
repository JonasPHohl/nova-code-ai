import { DiffEditor } from '@monaco-editor/react';
import { SplitSquareHorizontal } from 'lucide-react';
import type { OpenFile } from '../types';

export function DiffView({ file }: { file: OpenFile | null }) {
  if (!file) return <div className="diff-empty"><SplitSquareHorizontal size={20} /><span>Öffne eine Datei, um Änderungen zu vergleichen.</span></div>;
  return <div className="diff-view"><div className="diff-header"><span>ORIGINAL</span><span>VORSCHLAG</span></div><DiffEditor height="360px" original={file.savedContent} modified={file.content} language={file.language} theme="vs-dark" options={{ readOnly: true, automaticLayout: true, minimap: { enabled: false } }} /></div>;
}
