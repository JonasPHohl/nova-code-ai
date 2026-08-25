import type { AIChatMessage } from '../types';
import type { OpenFile } from '../../editor/types';

export type AICodeAction = 'explain' | 'fix' | 'improve' | 'refactor' | 'generate' | 'comments';

const instructions: Record<AICodeAction, string> = {
  explain: 'Explain the selected code clearly. Do not propose file changes.',
  fix: 'Identify and fix problems in the selected code. Return only the complete replacement code.',
  improve: 'Improve the selected code while preserving its behavior. Return only the complete replacement code.',
  refactor: 'Refactor the selected code for clarity and maintainability. Return only the complete replacement code.',
  generate: 'Generate code that fits the requested intent. Return only the complete replacement code.',
  comments: 'Add useful comments to the selected code. Return only the complete replacement code.'
};

export interface AIContext { file: OpenFile; selection: string; rules?: string; memory?: string; }

export function buildCodePrompt(action: AICodeAction, context: AIContext): AIChatMessage[] {
  const selected = context.selection || context.file.content;
  const contextBlock = [`File: ${context.file.path}`, `Language: ${context.file.language}`, `Selected code:\n${selected}`, context.rules ? `Project rules:\n${context.rules}` : '', context.memory ? `Project memory:\n${context.memory}` : ''].filter(Boolean).join('\n\n');
  return [
    { role: 'system', content: 'You are Nova Code AI. Never edit files. Provide an explicit suggestion for user review.' },
    { role: 'user', content: `${instructions[action]}\n\n${contextBlock}` }
  ];
}
