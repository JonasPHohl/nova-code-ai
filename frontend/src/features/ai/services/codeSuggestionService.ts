import type { AIProvider } from '../types';
import type { OpenFile } from '../../editor/types';
import { buildCodePrompt, type AICodeAction } from './promptService';

export interface CodeSuggestion { action: AICodeAction; filePath: string; original: string; proposed: string; language: string; }

export async function requestCodeSuggestion(provider: AIProvider, model: string, action: AICodeAction, file: OpenFile, selection: string, guidance?: { rules?: string; memory?: string }): Promise<CodeSuggestion> {
  const response = await provider.chat({ model, messages: buildCodePrompt(action, { file, selection, ...guidance }) });
  return { action, filePath: file.path, original: selection || file.content, proposed: extractCode(response.message.content), language: file.language };
}

function extractCode(content: string): string { return content.replace(/^```[\w-]*\s*/i, '').replace(/\s*```$/, '').trim(); }
