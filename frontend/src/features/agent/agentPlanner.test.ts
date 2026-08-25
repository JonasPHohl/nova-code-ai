import { describe, expect, it } from 'vitest';
import { createAgentPlan } from './agentPlanner';

describe('createAgentPlan', () => {
  it('normalizes numbered model steps', async () => {
    const plan = await createAgentPlan({ chat: async () => ({ done: true, message: { role: 'assistant', content: '1. Read project\n2. Create main.py' } }) } as never, 'model', 'Build app');
    expect(plan.steps).toEqual(['Read project', 'Create main.py']);
  });
});
