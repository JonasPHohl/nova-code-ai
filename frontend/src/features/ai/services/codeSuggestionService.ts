import type { AIProvider } from '../types';
import type { OpenFile } from '../../editor/types';
import { buildCodePrompt, type AICodeAction } from './promptService';

export interface CodeSuggestion { action: AICodeAction; filePath: string; original: string; proposed: string; language: string; explanation?: string; }

export async function requestCodeSuggestion(provider: AIProvider, model: string, action: AICodeAction, file: OpenFile, selection: string, guidance?: { rules?: string; memory?: string }): Promise<CodeSuggestion> {
  const response = await provider.chat({ model, messages: buildCodePrompt(action, { file, selection, ...guidance }) });
  const original = selection || file.content;
  return { action, filePath: file.path, original, proposed: action === 'explain' ? original : extractCode(response.message.content), language: file.language, explanation: action === 'explain' ? response.message.content : undefined };
}

function extractCode(content: string): string { return content.replace(/^```[\w-]*\s*/i, '').replace(/\s*```$/, '').trim(); }
