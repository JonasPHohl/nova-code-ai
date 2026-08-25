import { Code2, X } from 'lucide-react';
import type { OpenFile } from '../types';

interface EditorTabsProps { files: OpenFile[]; activePath: string | null; onActivate: (path: string) => void; onClose: (path: string) => void; }
export function EditorTabs({ files, activePath, onActivate, onClose }: EditorTabsProps) {
  return <div className="editor-tabs" role="tablist">{files.map((file) => <div className={`editor-tab ${activePath === file.path ? 'active' : ''}`} key={file.path} role="tab" aria-selected={activePath === file.path} onClick={() => onActivate(file.path)}><Code2 size={14} /><span>{file.name}{file.content !== file.savedContent ? ' ●' : ''}</span><button aria-label={`${file.name} schließen`} onClick={(event) => { event.stopPropagation(); onClose(file.path); }}><X size={13} /></button></div>)}</div>;
}
