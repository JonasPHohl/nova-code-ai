import { useState } from 'react';
import { Activity, Bot, ChevronRight, Circle, Code2, FolderOpen, GitBranch, Layers3, Menu, PanelRight, Play, Plus, Search, Settings, ShieldCheck, Terminal, TestTube2, X } from 'lucide-react';
import type { AppView, SidebarSection } from '../core/types/project';
import type { RecentProject } from '../core/types/project';
import { ProjectService } from '../services/projectService';
import { MockFileSystem } from '../adapters/filesystem/mockFileSystem';
import '../styles/index.css';

const projectService = new ProjectService(new MockFileSystem('C:/NovaProjects'));
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
  const [projects, setProjects] = useState<RecentProject[]>(projectService.getRecentProjects());
  const [bottomPanel, setBottomPanel] = useState('Terminal');

  function createProject() {
    const name = window.prompt('Projektname', 'Nova Project');
    if (!name?.trim()) return;
    const path = `C:/NovaProjects/${name.trim().replaceAll(' ', '-')}`;
    projectService.createProject(path, name.trim()).then((created) => {
      projectService.rememberProject(created); setProjects(projectService.getRecentProjects()); setProject(created); setView('workspace');
    });
  }

  function openProject(selected: RecentProject) { projectService.rememberProject(selected); setProject(selected); setView('workspace'); }

  return <div className="app-shell">
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
      {view === 'home' ? <Home projects={projects} onCreate={createProject} onOpen={openProject} /> : view === 'settings' ? <SettingsPage /> : <Workspace project={project} bottomPanel={bottomPanel} setBottomPanel={setBottomPanel} />}
    </div>
  </div>;
}

function Home({ projects, onCreate, onOpen }: { projects: RecentProject[]; onCreate: () => void; onOpen: (project: RecentProject) => void }) {
  return <main className="home-view"><div className="home-hero"><div className="eyebrow"><span className="spark">✦</span> FOUNDATION / 01</div><h1>Build with intent.</h1><p>Eine ruhige, lokale Entwicklungsumgebung für den nächsten Gedanken.</p><div className="home-actions"><button className="primary-button" onClick={onCreate}><Plus size={17} /> Neues Projekt</button><button className="secondary-button" onClick={() => window.alert('Der native Dateidialog folgt mit dem Tauri-Adapter.')}><FolderOpen size={17} /> Projekt öffnen</button></div></div><section className="recent-section"><div className="section-heading"><div><span className="eyebrow">WORKSPACE</span><h2>Letzte Projekte</h2></div><span className="count-badge">{projects.length.toString().padStart(2, '0')}</span></div>{projects.length === 0 ? <div className="empty-projects"><Layers3 size={30} /><strong>Noch kein Projekt geöffnet</strong><span>Erstelle deinen ersten lokalen Workspace, um loszulegen.</span><button className="text-button" onClick={onCreate}>Projekt erstellen <ChevronRight size={15} /></button></div> : <div className="project-grid">{projects.map((item) => <button className="project-card" key={item.path} onClick={() => onOpen(item)}><div className="card-icon"><Code2 size={18} /></div><div><strong>{item.name}</strong><span>{item.path}</span></div><ChevronRight size={16} /></button>)}</div>}</section></main>;
}

function Workspace({ project, bottomPanel, setBottomPanel }: { project: RecentProject | null; bottomPanel: string; setBottomPanel: (value: string) => void }) {
  return <main className="workspace-view"><section className="workspace-main"><div className="explorer-panel"><div className="panel-title"><span>EXPLORER</span><button className="icon-button"><Plus size={15} /></button></div><div className="tree-root"><ChevronRight size={14} /><strong>{project?.name ?? 'Workspace'}</strong></div><div className="tree-empty">Projektdateien erscheinen hier.</div></div><section className="editor-panel"><div className="editor-tabs"><div className="editor-tab active"><Code2 size={14} /> Welcome <X size={13} /></div></div><div className="editor-empty"><div className="editor-glyph">✦</div><strong>Workspace bereit</strong><span>Öffne eine Datei aus dem Explorer, um mit dem Bauen zu beginnen.</span><div className="editor-hint"><kbd>Ctrl</kbd><span>+</span><kbd>P</kbd><span>Quick Open</span></div></div></section><AIWorkspace /></section><div className="bottom-panel"><div className="bottom-tabs">{bottomItems.map((item) => <button key={item} className={bottomPanel === item ? 'active' : ''} onClick={() => setBottomPanel(item)}>{item}</button>)}</div><div className="bottom-content"><Terminal size={16} /><span>{bottomPanel === 'Terminal' ? 'Terminal ist in dieser Foundation bewusst deaktiviert.' : `${bottomPanel} panel ist vorbereitet.`}</span><span className="safe-label"><ShieldCheck size={14} /> sicherer Modus</span></div></div></main>;
}

function AIWorkspace() { const [tab, setTab] = useState('Chat'); return <aside className="ai-panel"><div className="ai-heading"><div><span className="eyebrow">✦ NOVA</span><h2>AI Workspace</h2></div><PanelRight size={16} /></div><div className="ai-tabs">{['Chat', 'Agent', 'Debug', 'Explain', 'Tests'].map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div><div className="ai-content">{tab === 'Agent' ? <><div className="agent-icon"><Bot size={22} /></div><span className="eyebrow">AGENT</span><h3>No active task.</h3><p>Agent workflows werden hier sichtbar, sobald die Engine aktiviert ist.</p><button className="secondary-button full" disabled><Play size={15} /> Start an agent task</button></> : <><div className="chat-orbit"><Bot size={24} /></div><h3>{tab} workspace</h3><p>Dieser Bereich ist für die Foundation vorbereitet.</p></>}</div><div className="ai-footer"><span><Circle size={7} fill="currentColor" /> Waiting for AI</span><span>Local</span></div></aside>; }

function SettingsPage() { const groups = ['General', 'Appearance', 'AI', 'Editor', 'Security', 'Advanced']; return <main className="settings-view"><div className="settings-header"><span className="eyebrow">CONFIGURATION</span><h1>Settings</h1><p>Workspace-Verhalten und lokale Grenzen verwalten.</p></div><div className="settings-layout"><nav className="settings-nav">{groups.map((group, index) => <button className={index === 0 ? 'active' : ''} key={group}>{group}</button>)}</nav><section className="settings-content"><div className="setting-block"><span className="eyebrow">GENERAL</span><h2>General</h2><p className="setting-description">Grundlegende Einstellungen für Nova Code AI.</p><label className="setting-row"><span><strong>Local first mode</strong><small>Arbeite standardmäßig ohne externe Services.</small></span><input type="checkbox" checked readOnly /></label><label className="setting-row"><span><strong>Confirm file writes</strong><small>Schreibvorgänge werden vorerst immer bestätigt.</small></span><input type="checkbox" checked readOnly /></label></div><div className="setting-block"><span className="eyebrow">AI PROVIDER</span><h2>AI</h2><div className="select-row"><span>AI Provider</span><strong>Local / Not configured</strong></div><div className="select-row"><span>Model</span><strong>Not configured</strong></div></div><div className="setting-block"><span className="eyebrow">SECURITY</span><h2>Security</h2><div className="security-note"><ShieldCheck size={18} /><span><strong>Protected foundation</strong><small>Shell-Ausführung und automatische Änderungen sind deaktiviert.</small></span></div></div></section></div></main>; }
