import { useState } from 'react';
import { Activity, ChevronRight, Circle, Code2, FolderOpen, GitBranch, Layers3, Menu, Plus, Search, Settings, ShieldCheck, Terminal, TestTube2, X } from 'lucide-react';
import type { AppView, SidebarSection } from '../core/types/project';
import type { RecentProject } from '../core/types/project';
import { ProjectService } from '../services/projectService';
import { validateProjectName } from '../core/errors/pathValidation';
import { MockFileSystem } from '../adapters/filesystem/mockFileSystem';
import { TauriFileSystem } from '../adapters/filesystem/tauriFileSystem';
import { chooseDirectory } from '../adapters/desktop/tauriDialogs';
import { isTauriRuntime } from '../adapters/desktop/runtime';
import { EditorWorkspace } from '../features/editor/EditorWorkspace';
import { AIWorkspace } from '../features/ai/components/AIWorkspace';
import { AISettings } from '../features/ai/components/AISettings';
import { useAISettings } from '../features/ai/hooks/useAISettings';
import type { AIConfig } from '../features/ai/types';
import '../styles/index.css';

const webFileSystem = new MockFileSystem('C:/NovaProjects');
const webProjectService = new ProjectService(webFileSystem, 'C:/NovaProjects');
const navItems: Array<{ id: SidebarSection; label: string; icon: typeof FolderOpen }> = [
  { id: 'explorer', label: 'Explorer', icon: FolderOpen }, { id: 'search', label: 'Search', icon: Search },
  { id: 'source-control', label: 'Source Control', icon: GitBranch }, { id: 'tests', label: 'Tests', icon: TestTube2 },
  { id: 'activity', label: 'AI Activity', icon: Activity }, { id: 'settings', label: 'Settings', icon: Settings }
];
const bottomItems = ['Terminal', 'Problems', 'Output', 'Tests', 'Git'];

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [section, setSection] = useState<SidebarSection>('explorer');
  const [project, setProject] = useState<RecentProject | null>(null);
  const [projects, setProjects] = useState<RecentProject[]>(webProjectService.getRecentProjects());
  const [error, setError] = useState<string | null>(null);
  const [bottomPanel, setBottomPanel] = useState('Terminal');
  const { config, updateConfig } = useAISettings();

  async function createProject() {
    const name = window.prompt('Projektname', 'Nova Project');
    if (!name?.trim()) return;
    try { validateProjectName(name); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Projektname ungültig.'); return; }
    try {
      const parent = isTauriRuntime() ? await chooseDirectory() : 'C:/NovaProjects';
      if (!parent) return;
      const path = `${parent.replace(/[\\/]$/, '')}/${name.trim().replaceAll(' ', '-')}`;
      const service = isTauriRuntime() ? new ProjectService(new TauriFileSystem(parent), parent) : webProjectService;
      const created = await service.createProject(path, name.trim());
      webProjectService.rememberProject(created); setProjects(webProjectService.getRecentProjects()); setProject(created); setView('workspace');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Projekt konnte nicht erstellt werden.'); }
  }

  async function openProject(selected: RecentProject) { try { const service = isTauriRuntime() ? new ProjectService(new TauriFileSystem(selected.path), selected.path) : webProjectService; await service.readManifest(selected.path); webProjectService.rememberProject(selected); setProject(selected); setView('workspace'); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Projekt konnte nicht geöffnet werden.'); } }

  async function openDirectory(): Promise<void> {
    if (!isTauriRuntime()) { setError('Projekt öffnen ist in der Webversion nicht verfügbar.'); return; }
    try { const path = await chooseDirectory(); if (!path) return; const service = new ProjectService(new TauriFileSystem(path), path); const manifest = await service.readManifest(path); const selected = { ...manifest, path }; webProjectService.rememberProject(selected); setProjects(webProjectService.getRecentProjects()); setProject(selected); setView('workspace'); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Projekt konnte nicht geöffnet werden.'); }
  }

  return <div className="app-shell">
    {error && <div className="error-banner" role="alert">{error}<button className="icon-button" aria-label="Fehlermeldung schließen" onClick={() => setError(null)}><X size={15} /></button></div>}
    <header className="topbar">
      <div className="brand"><span className="brand-mark">✦</span><strong>Nova</strong><span className="brand-muted">Code AI</span></div>
      <div className="project-crumb"><span>Project</span><ChevronRight size={14} /> <strong>{project?.name ?? 'No project open'}</strong></div>
      <div className="top-actions"><span className="local-status"><Circle size={8} fill="currentColor" /> Local only</span><button className="icon-button" aria-label="Einstellungen" onClick={() => { setSection('settings'); setView('settings'); }}><Settings size={17} /></button></div>
    </header>
    <div className="body-layout">
      <aside className="sidebar">
        <button className="sidebar-menu" aria-label="Menü"><Menu size={18} /></button>
        <nav>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-button ${section === id ? 'active' : ''}`} title={label} onClick={() => { setSection(id); if (id === 'settings') setView('settings'); else if (project) setView('workspace'); }}><Icon size={18} /><span>{label}</span></button>)}</nav>
        <div className="sidebar-footer"><ShieldCheck size={16} /><span>Local first</span></div>
      </aside>
      {view === 'home' ? <Home projects={projects} onCreate={createProject} onOpen={openProject} onOpenDirectory={openDirectory} /> : view === 'settings' ? <SettingsPage config={config} onConfigChange={updateConfig} /> : <Workspace project={project} config={config} bottomPanel={bottomPanel} setBottomPanel={setBottomPanel} />}
    </div>
  </div>;
}

function Home({ projects, onCreate, onOpen, onOpenDirectory }: { projects: RecentProject[]; onCreate: () => void; onOpen: (project: RecentProject) => void; onOpenDirectory: () => void }) {
  return <main className="home-view"><div className="home-hero"><div className="eyebrow"><span className="spark">✦</span> FOUNDATION / 01</div><h1>Build with intent.</h1><p>Eine ruhige, lokale Entwicklungsumgebung für den nächsten Gedanken.</p><div className="home-actions"><button className="primary-button" onClick={onCreate}><Plus size={17} /> Neues Projekt</button><button className="secondary-button" onClick={onOpenDirectory}><FolderOpen size={17} /> Projekt öffnen</button></div></div><section className="recent-section"><div className="section-heading"><div><span className="eyebrow">WORKSPACE</span><h2>Letzte Projekte</h2></div><span className="count-badge">{projects.length.toString().padStart(2, '0')}</span></div>{projects.length === 0 ? <div className="empty-projects"><Layers3 size={30} /><strong>Noch kein Projekt geöffnet</strong><span>Erstelle deinen ersten lokalen Workspace, um loszulegen.</span><button className="text-button" onClick={onCreate}>Projekt erstellen <ChevronRight size={15} /></button></div> : <div className="project-grid">{projects.map((item) => <button className="project-card" key={item.path} onClick={() => onOpen(item)}><div className="card-icon"><Code2 size={18} /></div><div><strong>{item.name}</strong><span>{item.path}</span></div><ChevronRight size={16} /></button>)}</div>}</section></main>;
}

function Workspace({ project, config, bottomPanel, setBottomPanel }: { project: RecentProject | null; config: AIConfig; bottomPanel: string; setBottomPanel: (value: string) => void }) {
  const projectFileSystem = project && isTauriRuntime() ? new TauriFileSystem(project.path) : webFileSystem;
  return <main className="workspace-view"><section className="workspace-main"><EditorWorkspace projectRoot={project?.path ?? 'C:/NovaProjects'} fileSystem={projectFileSystem} projectName={project?.name ?? 'Workspace'} /><AIWorkspace config={config} /></section><div className="bottom-panel"><div className="bottom-tabs">{bottomItems.map((item) => <button key={item} className={bottomPanel === item ? 'active' : ''} onClick={() => setBottomPanel(item)}>{item}</button>)}</div><div className="bottom-content"><Terminal size={16} /><span>{bottomPanel === 'Terminal' ? 'Terminal ist in dieser Foundation bewusst deaktiviert.' : `${bottomPanel} panel ist vorbereitet.`}</span><span className="safe-label"><ShieldCheck size={14} /> sicherer Modus</span></div></div></main>;
}

function SettingsPage({ config, onConfigChange }: { config: AIConfig; onConfigChange: (patch: Partial<AIConfig>) => void }) { const groups = ['General', 'Appearance', 'AI', 'Editor', 'Security', 'Advanced']; return <main className="settings-view"><div className="settings-header"><span className="eyebrow">CONFIGURATION</span><h1>Settings</h1><p>Workspace-Verhalten und lokale Grenzen verwalten.</p></div><div className="settings-layout"><nav className="settings-nav">{groups.map((group, index) => <button className={index === 0 ? 'active' : ''} key={group}>{group}</button>)}</nav><section className="settings-content"><div className="setting-block"><span className="eyebrow">GENERAL</span><h2>General</h2><p className="setting-description">Grundlegende Einstellungen für Nova Code AI.</p><label className="setting-row"><span><strong>Local first mode</strong><small>Arbeite standardmäßig ohne externe Services.</small></span><input type="checkbox" checked readOnly /></label><label className="setting-row"><span><strong>Confirm file writes</strong><small>Schreibvorgänge werden vorerst immer bestätigt.</small></span><input type="checkbox" checked readOnly /></label></div><AISettings config={config} onChange={onConfigChange} /><div className="setting-block"><span className="eyebrow">SECURITY</span><h2>Security</h2><div className="security-note"><ShieldCheck size={18} /><span><strong>Protected foundation</strong><small>Shell-Ausführung und automatische Änderungen sind deaktiviert.</small></span></div></div></section></div></main>; }
