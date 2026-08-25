export interface OpenFile {
  path: string;
  name: string;
  content: string;
  savedContent: string;
  language: string;
}

export interface ExplorerNode {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  children?: ExplorerNode[];
}

export interface SearchResult {
  path: string;
  line: number;
  column: number;
  preview: string;
}
