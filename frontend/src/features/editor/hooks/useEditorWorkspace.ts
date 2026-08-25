import { useCallback, useEffect, useState } from 'react';
import type { ExplorerNode, OpenFile, SearchResult } from '../types';
import { WorkspaceFileService } from '../services/workspaceFileService';

export function useEditorWorkspace(service: WorkspaceFileService, root: string) {
  const [files, setFiles] = useState<OpenFile[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [tree, setTree] = useState<ExplorerNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingPath, setSavingPath] = useState<string | null>(null);
  const [selection, setSelection] = useState('');

  const refreshTree = useCallback(async () => {
    try { setTree(await service.loadTree(root)); } catch (caught) { setError(messageOf(caught, 'Explorer konnte nicht geladen werden.')); }
  }, [root, service]);
  useEffect(() => { void refreshTree(); }, [refreshTree]);

  const openFile = useCallback(async (path: string) => {
    const existing = files.find((file) => file.path === path);
    if (existing) { setActivePath(path); setSelection(''); return; }
    try { const file = await service.openFile(path); setFiles((current) => [...current, file]); setActivePath(path); setSelection(''); }
    catch (caught) { setError(messageOf(caught, 'Datei konnte nicht geöffnet werden.')); }
  }, [files, service]);

  const updateContent = useCallback((content: string) => {
    if (!activePath) return;
    setFiles((current) => current.map((file) => file.path === activePath ? { ...file, content } : file));
  }, [activePath]);

  const replaceSavedContent = useCallback((path: string, content: string) => {
    setFiles((current) => current.map((file) => file.path === path ? { ...file, content, savedContent: content } : file));
  }, []);

  const saveFile = useCallback(async (path: string): Promise<boolean> => {
    const file = files.find((item) => item.path === path);
    if (!file || file.content === file.savedContent) return true;
    const contentAtSaveStart = file.content;
    setSavingPath(path);
    try { await service.saveFile(file); setFiles((current) => current.map((item) => item.path === path ? { ...item, savedContent: contentAtSaveStart } : item)); return true; }
    catch (caught) { setError(messageOf(caught, 'Datei konnte nicht gespeichert werden.')); return false; }
    finally { setSavingPath(null); }
  }, [files, service]);

  const closeFile = useCallback((path: string) => {
    const file = files.find((item) => item.path === path);
    if (file && file.content !== file.savedContent && !window.confirm(`${file.name} hat ungespeicherte Änderungen. Trotzdem schließen?`)) return;
    setFiles((current) => current.filter((file) => file.path !== path));
    setActivePath((current) => current === path ? (files.find((file) => file.path !== path)?.path ?? null) : current);
    if (activePath === path) setSelection('');
  }, [files]);

  const toggleDirectory = useCallback((path: string) => setExpanded((current) => { const next = new Set(current); if (next.has(path)) next.delete(path); else next.add(path); return next; }), []);
  const search = useCallback(async (query: string) => { try { setSearchResults(await service.search(root, query)); } catch (caught) { setError(messageOf(caught, 'Suche fehlgeschlagen.')); } }, [root, service]);
  const clearError = useCallback(() => setError(null), []);
  return { files, activeFile: files.find((file) => file.path === activePath) ?? null, selection, setSelection, tree, expanded, error, savingPath, openFile, updateContent, replaceSavedContent, saveFile, closeFile, toggleDirectory, search, searchResults, clearError, refreshTree };
}

function messageOf(caught: unknown, fallback: string): string { return caught instanceof Error ? caught.message : fallback; }
