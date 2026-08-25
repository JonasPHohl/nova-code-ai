import { useState } from 'react';
import type { EditorSettings } from '../types/settings';

const storageKey = 'nova.editor-settings';
export const defaultEditorSettings: EditorSettings = { theme: 'vs-dark', fontSize: 14, tabSize: 2, wordWrap: 'off' };

export function useEditorSettings() {
  const [settings, setSettings] = useState<EditorSettings>(() => readSettings());
  function updateSettings(patch: Partial<EditorSettings>): void {
    const next = normalizeSettings({ ...settings, ...patch });
    setSettings(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* keep in-memory settings */ }
  }
  return { settings, updateSettings };
}

function readSettings(): EditorSettings {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    if (typeof parsed !== 'object' || parsed === null) return defaultEditorSettings;
    return normalizeSettings(parsed as Partial<EditorSettings>);
  } catch { return defaultEditorSettings; }
}

function normalizeSettings(value: Partial<EditorSettings>): EditorSettings {
  const fontSize = typeof value.fontSize === 'number' && value.fontSize >= 8 && value.fontSize <= 32 ? value.fontSize : defaultEditorSettings.fontSize;
  const tabSize = typeof value.tabSize === 'number' && value.tabSize >= 1 && value.tabSize <= 8 ? value.tabSize : defaultEditorSettings.tabSize;
  const theme = value.theme === 'light' || value.theme === 'vs-dark' ? value.theme : defaultEditorSettings.theme;
  const wordWrap = ['off', 'on', 'wordWrapColumn', 'bounded'].includes(value.wordWrap ?? '') ? value.wordWrap as EditorSettings['wordWrap'] : defaultEditorSettings.wordWrap;
  return { theme, fontSize, tabSize, wordWrap };
}
