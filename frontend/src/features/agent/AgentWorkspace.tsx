import { useMemo, useState } from 'react';
import { Check, Play, ShieldCheck } from 'lucide-react';
import type { AIProvider } from '../ai/types';
import type { FileSystemAdapter } from '../../adapters/filesystem/types';
import { WorkspaceFileService } from '../editor/services/workspaceFileService';
import { AgentService } from './agentService';
import type { AgentFileChange, AgentRun } from './types';

export function AgentWorkspace({ provider, model, projectRoot, fileSystem }: { provider: AIProvider; model: string; projectRoot: string; fileSystem: FileSystemAdapter }) {
  const [task, setTask] = useState('');
  const [run, setRun] = useState<AgentRun | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const service = useMemo(() => new AgentService({ provider, model, fileService: new WorkspaceFileService(fileSystem, projectRoot) }, projectRoot), [fileSystem, model, projectRoot, provider]);

  async function start(): Promise<void> {
    if (!task.trim() || !model || working) return;
    setWorking(true); setError(null);
    try { setRun(await service.prepareTask(task.trim())); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Agent konnte nicht gestartet werden.'); } finally { setWorking(false); }
  }
  function toggle(path: string): void { setRun((current) => current ? { ...current, changes: current.changes.map((change) => change.path === path ? { ...change, approved: !change.approved } : change) } : current); }
  function approveAll(): void { setRun((current) => current ? { ...current, changes: current.changes.map((change) => ({ ...change, approved: true })) } : current); }
  async function applySelected(): Promise<void> {
    if (!run) return;
    setWorking(true); setError(null);
    try { const applied = await service.apply(run.changes); const failures = applied.filter((change) => change.error); if (failures.length) setError(failures.map((change) => `${change.path}: ${change.error}`).join('\n')); setRun({ ...run, status: failures.length ? 'error' : 'completed', changes: run.changes.map((change) => applied.find((item) => item.path === change.path) ?? change) }); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Agent-Änderungen konnten nicht angewendet werden.'); } finally { setWorking(false); }
  }
  async function applyAll(): Promise<void> {
    if (!run || run.changes.length === 0) return;
    setWorking(true); setError(null);
    try { const applied = await service.apply(run.changes.map((change) => ({ ...change, approved: true }))); const failures = applied.filter((change) => change.error); if (failures.length) setError(failures.map((change) => `${change.path}: ${change.error}`).join('\n')); setRun({ ...run, status: failures.length ? 'error' : 'completed', changes: run.changes.map((change) => applied.find((item) => item.path === change.path) ?? change) }); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Agent-Änderungen konnten nicht angewendet werden.'); } finally { setWorking(false); }
  }
  return <div className="agent-workspace"><div className="agent-task"><textarea value={task} onChange={(event) => setTask(event.target.value)} placeholder="Beschreibe, was erstellt oder geändert werden soll ..." aria-label="Agent task" rows={3} /><button className="primary-button" disabled={!task.trim() || !model || working} onClick={() => void start()}><Play size={15} /> {working ? 'Working ...' : 'Create plan'}</button></div>{error && <div className="chat-error" role="alert">{error}</div>}{run?.plan && <div className="agent-plan"><span className="eyebrow">PLAN</span><strong>{run.task}</strong><ol>{run.plan.steps.map((step, index) => <li key={`${step}-${index}`}>{step}</li>)}</ol></div>}{run && <div className="agent-changes"><div className="agent-change-header"><span className="eyebrow">FILE CHANGES · {run.changes.length}</span><span><ShieldCheck size={13} /> approval required</span></div>{run.changes.length === 0 ? <p>Keine Dateiänderungen vorgeschlagen.</p> : run.changes.map((change) => <ChangeRow key={change.path} change={change} onToggle={() => toggle(change.path)} />)}<div className="agent-approval"><button className="secondary-button" disabled={working} onClick={() => setRun(null)}>Reject all</button><button className="secondary-button" disabled={working || run.changes.length === 0} onClick={approveAll}>Select all</button><button className="secondary-button" disabled={working || run.changes.length === 0} onClick={() => void applyAll()}>Apply all</button><button className="primary-button" disabled={working || !run.changes.some((change) => change.approved)} onClick={() => void applySelected()}><Check size={15} /> Apply selected</button></div></div>}</div>;
}

function ChangeRow({ change, onToggle }: { change: AgentFileChange; onToggle: () => void }) {
  return <label className={`agent-change ${change.approved ? 'approved' : ''}`}><input type="checkbox" checked={change.approved} onChange={onToggle} /><span className={`operation ${change.operation}`}>{change.operation === 'create' ? '+' : change.operation === 'modify' ? '~' : '-'}</span><span className="change-path">{change.path}</span>{change.error && <small>{change.error}</small>}</label>;
}
