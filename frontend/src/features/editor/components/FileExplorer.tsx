import { ChevronDown, ChevronRight, FileCode2, Folder, FolderOpen } from 'lucide-react';
import type { ExplorerNode } from '../types';

interface FileExplorerProps { nodes: ExplorerNode[]; expanded: Set<string>; activePath: string | null; onToggle: (path: string) => void; onOpen: (path: string) => void; }
type TreeNodeProps = Omit<FileExplorerProps, 'nodes'> & { node: ExplorerNode };
export function FileExplorer({ nodes, expanded, activePath, onToggle, onOpen }: FileExplorerProps) {
  return <div className="file-tree">{nodes.length === 0 ? <div className="tree-empty">Keine Dateien gefunden.</div> : nodes.map((node) => <TreeNode key={node.path} node={node} expanded={expanded} activePath={activePath} onToggle={onToggle} onOpen={onOpen} />)}</div>;
}
function TreeNode({ node, expanded, activePath, onToggle, onOpen }: TreeNodeProps) {
  const isOpen = expanded.has(node.path);
  return <div className="tree-node"><button className={`tree-row ${activePath === node.path ? 'active' : ''}`} onClick={() => node.kind === 'directory' ? onToggle(node.path) : onOpen(node.path)}>{node.kind === 'directory' ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="tree-indent" />}{node.kind === 'directory' ? (isOpen ? <FolderOpen size={15} /> : <Folder size={15} />) : <FileCode2 size={15} />}<span>{node.name}</span></button>{node.kind === 'directory' && isOpen && node.children?.map((child) => <TreeNode key={child.path} node={child} expanded={expanded} activePath={activePath} onToggle={onToggle} onOpen={onOpen} />)}</div>;
}
