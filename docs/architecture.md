# Architektur

## Schichten

- `frontend/src/features`: fachliche UI-Bereiche
- `frontend/src/services`: Anwendungsfälle ohne UI-Abhängigkeit
- `frontend/src/adapters`: austauschbare technische Integrationen
- `frontend/src/state`: bewusst begrenzter globaler Zustand
- `backend/app`: FastAPI-Grenze für REST und spätere WebSockets
- `desktop/src-tauri`: native Hülle mit minimalen Berechtigungen

Die Webversion nutzt zunächst einen In-Memory-Filesystem-Adapter. Tauri kann später denselben Vertrag implementieren. Der `BackendClient` trennt UI und Transport, sodass HTTP/WebSocket ohne Umbau der Features ergänzt werden können.

## Erweiterungspunkte

Monaco gehört in `features/editor`, AI-Provider hinter einem Provider-Interface, Agenten in eine eigene Domain-Schicht und alle Tools hinter Permission- und Sandbox-Grenzen. Die Foundation führt keine Shell-Befehle aus und ändert keinen Code automatisch.
