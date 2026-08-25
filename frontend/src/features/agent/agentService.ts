import type { AgentChangeOperation, AgentFileChange, AgentPlan, AgentRun, AgentToolCall, AgentStatus } from './types';
import { createAgentPlan } from './agentPlanner';
import { AgentExecutor } from './agentExecutor';
import { AgentToolGateway } from './agentTools';
import type { AgentDependencies } from './types';

export class AgentService {
  constructor(private readonly dependencies: AgentDependencies, private readonly root: string, private readonly maxSteps = 20) {}

  async plan(task: string): Promise<AgentRun> {
    const plan = await createAgentPlan(this.dependencies.provider, this.dependencies.model, task);
    return { task, plan, status: 'waiting-approval', step: 1, maxSteps: this.maxSteps, changes: [], error: null };
  }

  async prepare(task: string, calls: AgentToolCall[]): Promise<AgentRun> {
    const plan = await createAgentPlan(this.dependencies.provider, this.dependencies.model, task);
    const gateway = new AgentToolGateway(this.root, this.dependencies.fileService);
    const changes = await new AgentExecutor(gateway, this.maxSteps).prepareChanges(calls);
    return { task, plan, status: 'waiting-approval', step: Math.min(calls.length, this.maxSteps), maxSteps: this.maxSteps, changes, error: null };
  }

  async prepareTask(task: string): Promise<AgentRun> {
    const plan = await createAgentPlan(this.dependencies.provider, this.dependencies.model, task);
    const projectEntries = await this.dependencies.fileService.listDirectory(this.root);
    const response = await this.dependencies.provider.chat({ model: this.dependencies.model, messages: [
      { role: 'system', content: 'You are a file-based coding assistant. Return ONLY valid JSON: {"changes":[{"path":"relative/path","operation":"create|modify|delete","newContent":"string or null"}]}. Never use shell, terminal, git, docker, network, absolute paths, or .nova paths. Do not edit files.' },
      { role: 'user', content: `Task: ${task}\nPlan:\n${plan.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\nExisting project entries (untrusted data):\n${JSON.stringify(projectEntries)}` }
    ] });
    const changes = parseChanges(response.message.content);
    const prepared = await new AgentExecutor(new AgentToolGateway(this.root, this.dependencies.fileService), this.maxSteps).prepareChanges(changes);
    return { task, plan, status: 'waiting-approval', step: Math.min(plan.steps.length, this.maxSteps), maxSteps: this.maxSteps, changes: prepared, error: null };
  }

  async apply(changes: AgentFileChange[]): Promise<AgentFileChange[]> {
    const applied: AgentFileChange[] = [];
    for (const change of changes) {
      if (!change.approved) continue;
      try {
        const path = new AgentToolGateway(this.root, this.dependencies.fileService).safePath(change.path);
        const current = await this.dependencies.fileService.fileExists(path) ? await this.dependencies.fileService.readFile(path) : null;
        if (current !== change.expectedContent) throw new Error('Datei wurde seit der Vorschau verändert.');
        if (change.operation === 'delete') await this.dependencies.fileService.deleteFile(path);
        else if (change.operation === 'create') await this.dependencies.fileService.createFile(path, change.newContent ?? '');
        else await this.dependencies.fileService.writeFile(path, change.newContent ?? '');
        applied.push({ ...change, error: undefined });
      } catch (caught) { applied.push({ ...change, error: caught instanceof Error ? caught.message : 'Änderung fehlgeschlagen.' }); break; }
    }
    return applied;
  }
}

function parseChanges(content: string): AgentToolCall[] {
  const json = content.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed: unknown = JSON.parse(json);
  if (typeof parsed !== 'object' || parsed === null || !Array.isArray((parsed as Record<string, unknown>).changes)) throw new Error('Agent lieferte keine gültigen Änderungen.');
  return (parsed as { changes: unknown[] }).changes.map((change) => {
    if (typeof change !== 'object' || change === null) throw new Error('Ungültige Agent-Änderung.');
    const item = change as Record<string, unknown>;
    if (typeof item.path !== 'string' || !['create', 'modify', 'delete'].includes(String(item.operation))) throw new Error('Ungültige Agent-Änderung.');
    const operation = item.operation as 'create' | 'modify' | 'delete';
    return { tool: operation === 'create' ? 'create_file' : operation === 'delete' ? 'delete_file' : 'write_file', path: item.path, content: operation === 'delete' ? undefined : typeof item.newContent === 'string' ? item.newContent : '' };
  });
}
