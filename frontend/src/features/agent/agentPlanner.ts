import type { AIProvider } from '../ai/types';
import type { AgentPlan } from './types';

export async function createAgentPlan(provider: AIProvider, model: string, task: string): Promise<AgentPlan> {
  const response = await provider.chat({ model, messages: [
    { role: 'system', content: 'You are a planning assistant. Do not edit files or execute tools. Return a concise numbered implementation plan only.' },
    { role: 'user', content: `Task: ${task}` }
  ] });
  const steps = response.message.content.split('\n').map((line) => line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '').trim()).filter(Boolean).slice(0, 20);
  return { task, steps: steps.length > 0 ? steps : ['Projekt analysieren', 'Änderungen vorbereiten', 'Änderungen prüfen'] };
}
