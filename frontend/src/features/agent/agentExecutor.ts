import type { AgentChangeOperation, AgentFileChange, AgentToolCall } from './types';
import { AgentToolGateway } from './agentTools';

export class AgentExecutor {
  constructor(private readonly gateway: AgentToolGateway, private readonly maxSteps = 20) {}

  async prepareChanges(calls: AgentToolCall[]): Promise<AgentFileChange[]> {
    if (calls.length > this.maxSteps) throw new Error('Agent stopped after reaching the maximum number of steps.');
    const changes: AgentFileChange[] = [];
    for (const call of calls) {
      if (!['create_file', 'write_file', 'delete_file'].includes(call.tool)) continue;
      if (!call.path) throw new Error('Change benötigt einen Pfad.');
      const path = this.gateway.safePath(call.path);
      const exists = await this.gateway.fileExists(path);
      const originalContent = exists ? await this.gateway.readFile(path) : null;
      const operation: AgentChangeOperation = call.tool === 'create_file' ? 'create' : call.tool === 'delete_file' ? 'delete' : exists ? 'modify' : 'create';
      if (operation === 'create' && exists) throw new Error(`Datei existiert bereits: ${path}`);
      changes.push({ path, operation, originalContent, newContent: operation === 'delete' ? null : call.content ?? '', expectedContent: originalContent, approved: false });
    }
    return changes;
  }
}
