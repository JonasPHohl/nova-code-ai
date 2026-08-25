import { Search } from 'lucide-react';
import { useState } from 'react';
import type { SearchResult } from '../types';

export function SearchPanel({ results, onSearch, onOpen }: { results: SearchResult[]; onSearch: (query: string) => void; onOpen: (path: string) => void }) {
  const [query, setQuery] = useState('');
  return <div className="search-panel"><div className="search-input"><Search size={15} /><input value={query} onChange={(event) => { setQuery(event.target.value); onSearch(event.target.value); }} placeholder="Im Projekt suchen" aria-label="Im Projekt suchen" /></div><div className="search-results">{query && results.length === 0 ? <span className="tree-empty">Keine Treffer.</span> : results.map((result, index) => <button className="search-result" key={`${result.path}-${result.line}-${index}`} onClick={() => onOpen(result.path)}><strong>{result.path.split('/').at(-1)}</strong><span>{result.line}:{result.column} {result.preview}</span></button>)}</div></div>;
}
