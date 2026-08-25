# Sicherheitsmodell

Nova folgt dem local-first-Prinzip. In der Foundation gilt:

- UI-Komponenten schreiben nicht direkt ins Dateisystem.
- Dateipfade werden vor Adapterzugriffen gegen die Projektwurzel geprüft.
- Shell-Ausführung, Docker, Git-Agent und automatische Codeänderungen sind deaktiviert.
- Schreibbestätigungen sind als Einstellung vorgesehen und standardmäßig aktiv.
- Tauri erhält nur minimale Core-Berechtigungen.
- Backend-Schemas verbieten unbekannte Manifest-Felder.
- Ollama-URLs werden auf `localhost`, `127.0.0.1` und `::1` begrenzt; beliebige externe Ziele werden abgelehnt.
- Der AI-Chat sendet nur explizit eingegebene Nachrichten. Es gibt keinen automatischen Datei- oder Editor-Kontext.
- Ollama wird ausschließlich über HTTP angesprochen; es gibt keine Installation, keine API-Keys und keine Shell-Aufrufe.

Spätere Tools benötigen explizite Permissions, sichtbare Vorschauen und eine Prüfung der Projektgrenzen.
