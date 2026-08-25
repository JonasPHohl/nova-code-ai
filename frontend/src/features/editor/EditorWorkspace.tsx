import { useMemo, useState } from 'react';
import { FileExplorer } from './components/FileExplorer';
import { EditorTabs } from './components/EditorTabs';
import { CodeEditor } from './components/CodeEditor';
import { SearchPanel } from './components/SearchPanel';
import { DiffView } from './components/DiffView';
import { useEditorWorkspace } from './hooks/useEditorWorkspace';
import { WorkspaceFileService } from './services/workspaceFileService';
import type { FileSystemAdapter } from '../../adapters/filesystem/types';

export function EditorWorkspace({ projectRoot, fileSystem, projectName }: { projectRoot: string; fileSystem: FileSystemAdapter; projectName: string }) {
  const service = useMemo(() => new WorkspaceFileService(fileSystem), [fileSystem]);
  const workspace = useEditorWorkspace(service, projectRoot);
  const [panel, setPanel] = useState<'explorer' | 'search' | 'diff'>('explorer');
  const activeIndex = workspace.files.findIndex((file) => file.path === workspace.activeFile?.path);
  const activePath = workspace.activeFile?.path ?? null;
  const saveActive = () => activePath ? void workspace.saveFile(activePath) : undefined;
  return <div className="editor-workspace"><aside className="editor-explorer"><div className="panel-title"><span>{panel === 'search' ? 'SEARCH' : panel === 'diff' ? 'DIFF' : 'EXPLORER'}</span><div className="panel-switch"><button className={panel === 'explorer' ? 'active' : ''} onClick={() => setPanel('explorer')} aria-label="Explorer"><FileExplorerIcon /></button><button className={panel === 'search' ? 'active' : ''} onClick={() => setPanel('search')} aria-label="Suche">⌕</button><button className={panel === 'diff' ? 'active' : ''} onClick={() => setPanel('diff')} aria-label="Diff">Δ</button></div></div>{panel === 'explorer' ? <><div className="tree-root"><FolderIcon />{projectName}</div><FileExplorer nodes={workspace.tree} expanded={workspace.expanded} activePath={activePath} onToggle={workspace.toggleDirectory} onOpen={workspace.openFile} /></> : panel === 'search' ? <SearchPanel results={workspace.searchResults} onSearch={(query) => void workspace.search(query)} onOpen={workspace.openFile} /> : <DiffView file={workspace.activeFile} />}</aside><section className="editor-panel"><EditorTabs files={workspace.files} activePath={activePath} onActivate={(path) => workspace.openFile(path)} onClose={workspace.closeFile} /><CodeEditor file={workspace.activeFile} onChange={workspace.updateContent} onSave={saveActive} />{workspace.activeFile && <div className="editor-status"><span>{workspace.activeFile.language}</span><span>{workspace.activeFile.path}</span><span>{workspace.savingPath === workspace.activeFile.path ? 'Speichern ...' : workspace.activeFile.content !== workspace.activeFile.savedContent ? 'Ungespeichert' : 'Gespeichert'}</span></div>}</section>{workspace.error && <div className="editor-error" role="alert">{workspace.error}<button onClick={workspace.clearError}>Schließen</button></div>}{activeIndex >= 0 && <span className="sr-only">Tab {activeIndex + 1} aktiv</span>}</div>;
}
function FileExplorerIcon() { return <span>◈</span>; }
function FolderIcon() { return <span>▣</span>; }
