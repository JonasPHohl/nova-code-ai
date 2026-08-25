# Nova Code AI

Nova Code AI ist eine local-first, AI-native Coding-IDE in Foundation-Phase.

## Starten

```powershell
cd frontend
npm run dev
```

Aus dem Repository-Root ist derselbe Frontend-Start möglich:

```powershell
npm run dev
```

## Desktop-App

Für die Tauri-Entwicklung werden Rust, Cargo und die Windows-Build-Tools benötigt:

```powershell
npm run tauri:dev
```

Der Windows-Build wird ausschließlich über Tauri erstellt:

```powershell
npm run tauri:build
```

Die erzeugten Windows-Bundles liegen anschließend unter `desktop/src-tauri/target/release/bundle/`, typischerweise in den Unterordnern `msi/` und `nsis/`.

Das Backend läuft separat:

```powershell
cd backend
python -m pip install -e ".[test]"
python -m uvicorn app.main:app --reload --port 8000
```

Health Check: `http://localhost:8000/health`

## Foundation und Local AI

Die aktuelle Version enthält eine React/Vite/TypeScript-App-Shell, lokale Projektverwaltung mit `.nova`-Manifest, sichere Pfadprüfung, einen Mock-Filesystem-Adapter, einen Backend-Client-Vertrag und eine vorbereitete Tauri-Struktur. Phase 3 ergänzt einen konfigurierbaren Ollama-Provider und den lokalen AI-Chat. Agenten, Shell, Git, Docker, automatische Dateiänderungen und Plugins bleiben bewusst deaktiviert.

Für den Chat muss Ollama separat laufen. Die Standard-URL ist `http://localhost:11434`; ein Modell wird in Settings ausgewählt. Das Frontend verwendet die offizielle HTTP-API direkt, das FastAPI-Backend enthält weiterhin keine AI-Logik.

## Tests

```powershell
cd frontend; npm test
cd ..\backend; pytest
```

Weitere Entscheidungen stehen in [docs/architecture.md](docs/architecture.md), [docs/project-format.md](docs/project-format.md) und [docs/security-model.md](docs/security-model.md).
