import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useEditorSettings } from './useEditorSettings';

beforeEach(() => localStorage.clear());

describe('useEditorSettings', () => {
  it('persists editor settings', () => {
    const { result } = renderHook(() => useEditorSettings());
    act(() => result.current.updateSettings({ theme: 'light', fontSize: 18, tabSize: 4, wordWrap: 'on' }));
    expect(result.current.settings).toEqual({ theme: 'light', fontSize: 18, tabSize: 4, wordWrap: 'on' });
    expect(JSON.parse(localStorage.getItem('nova.editor-settings') ?? '{}')).toMatchObject({ theme: 'light', fontSize: 18, tabSize: 4, wordWrap: 'on' });
  });

  it('falls back when settings are corrupt', () => {
    localStorage.setItem('nova.editor-settings', '{broken');
    const { result } = renderHook(() => useEditorSettings());
    expect(result.current.settings).toEqual({ theme: 'vs-dark', fontSize: 14, tabSize: 2, wordWrap: 'off' });
  });
});
