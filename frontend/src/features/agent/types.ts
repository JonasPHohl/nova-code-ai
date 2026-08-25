import type { AIChatMessage, AIProvider } from '../ai/types';

export type AgentChangeOperation = 'create' | 'modify' | 'delete';
export type AgentStatus = 'idle' | 'thinking' | 'planning' | 'reading' | 'generating' | 'reviewing' | 'waiting-approval' | 'applying' | 'completed' | 'error';

export interface AgentPlan { task: string; steps: string[]; }
export interface AgentFileChange {
  path: string;
  operation: AgentChangeOperation;
  originalContent: string | null;
  newContent: string | null;
  expectedContent: string | null;
  approved: boolean;
  error?: string;
}
export interface AgentRun { task: string; plan: AgentPlan | null; status: AgentStatus; step: number; maxSteps: number; changes: AgentFileChange[]; error: string | null; }
export interface AgentToolCall { tool: 'read_file' | 'write_file' | 'create_file' | 'delete_file' | 'list_directory' | 'search_files' | 'file_exists'; path?: string; content?: string; }
export interface AgentDependencies { provider: AIProvider; fileService: AgentFileServiceContract; model: string; }
export interface AgentFileServiceContract {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  createFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  listDirectory(path: string): Promise<unknown>;
  searchFiles(query: string): Promise<unknown>;
  fileExists(path: string): Promise<boolean>;
}
export type AgentMessage = AIChatMessage;
