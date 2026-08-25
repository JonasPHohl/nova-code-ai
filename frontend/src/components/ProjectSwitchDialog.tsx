import type { OpenFile } from '../features/editor/types';

export function ProjectSwitchDialog({ files, onSave, onDiscard, onCancel, saving }: { files: OpenFile[]; onSave: () => void; onDiscard: () => void; onCancel: () => void; saving: boolean }) {
  return <div className="dialog-backdrop" role="presentation"><section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-switch-title"><h2 id="project-switch-title">Ungespeicherte Änderungen</h2><p>Diese Dateien werden beim Projektwechsel geschlossen:</p><ul>{files.map((file) => <li key={file.path}>{file.name}</li>)}</ul><div className="dialog-actions"><button className="secondary-button" onClick={onCancel} disabled={saving}>Abbrechen</button><button className="secondary-button" onClick={onDiscard} disabled={saving}>Verwerfen</button><button className="primary-button" onClick={onSave} disabled={saving}>{saving ? 'Speichern ...' : 'Speichern'}</button></div></section></div>;
}
