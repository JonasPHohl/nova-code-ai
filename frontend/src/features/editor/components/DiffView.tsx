import { SplitSquareHorizontal } from 'lucide-react';
import type { OpenFile } from '../types';

export function DiffView({ file }: { file: OpenFile | null }) {
  if (!file) return <div className="diff-empty"><SplitSquareHorizontal size={20} /><span>Öffne eine Datei, um Änderungen zu vergleichen.</span></div>;
  return <div className="diff-view"><div className="diff-header"><span>ORIGINAL</span><span>AKTUELL</span></div><div className="diff-columns"><pre>{file.savedContent}</pre><pre>{file.content}</pre></div></div>;
}
