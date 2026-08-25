export type EditorTheme = 'vs-dark' | 'light';
export type WordWrap = 'off' | 'on' | 'wordWrapColumn' | 'bounded';

export interface EditorSettings {
  theme: EditorTheme;
  fontSize: number;
  tabSize: number;
  wordWrap: WordWrap;
}
