# Nova Code AI

Nova Code AI ist eine local-first, AI-native Coding-IDE in Foundation-Phase.

## Starten

```powershell
cd frontend
npm run dev
```

Das Backend läuft separat:

```powershell
cd backend
python -m pip install -e ".[test]"
python -m uvicorn app.main:app --reload --port 8000
```

Health Check: `http://localhost:8000/health`

## Foundation

Die aktuelle Version enthält eine React/Vite/TypeScript-App-Shell, lokale Projektverwaltung mit `.nova`-Manifest, sichere Pfadprüfung, einen Mock-Filesystem-Adapter, einen Backend-Client-Vertrag und eine vorbereitete Tauri-Struktur. AI-Provider, Agenten, Shell, Git, Docker und Plugins sind bewusst noch nicht aktiv.

## Tests

```powershell
cd frontend; npm test
cd ..\backend; pytest
```

Weitere Entscheidungen stehen in [docs/architecture.md](docs/architecture.md), [docs/project-format.md](docs/project-format.md) und [docs/security-model.md](docs/security-model.md).
