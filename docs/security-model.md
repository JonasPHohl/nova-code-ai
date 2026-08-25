# Sicherheitsmodell

Nova folgt dem local-first-Prinzip. In der Foundation gilt:

- UI-Komponenten schreiben nicht direkt ins Dateisystem.
- Dateipfade werden vor Adapterzugriffen gegen die Projektwurzel geprüft.
- Shell-Ausführung, Docker, Git-Agent und automatische Codeänderungen sind deaktiviert.
- Schreibbestätigungen sind als Einstellung vorgesehen und standardmäßig aktiv.
- Tauri erhält nur minimale Core-Berechtigungen.
- Backend-Schemas verbieten unbekannte Manifest-Felder.

Spätere Tools benötigen explizite Permissions, sichtbare Vorschauen und eine Prüfung der Projektgrenzen.
