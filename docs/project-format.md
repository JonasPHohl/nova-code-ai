# Projektformat

Ein Nova-Projekt enthält:

```text
.nova/
├── project.json
├── rules.md
├── memory.md
├── context/
└── snapshots/
```

`project.json` hat in Formatversion 1 die Felder `formatVersion`, `name`, `createdAt` und `updatedAt`. Unbekannte Felder werden vom Backend-Schema abgelehnt. Zeitwerte werden als ISO-8601 gespeichert.
