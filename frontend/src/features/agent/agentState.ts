import type { AgentRun } from './types';
export const emptyAgentRun: AgentRun = { task: '', plan: null, status: 'idle', step: 0, maxSteps: 20, changes: [], error: null };
