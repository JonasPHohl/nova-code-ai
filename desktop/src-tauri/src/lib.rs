use serde::Serialize;
use std::fs;
use std::path::PathBuf;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct FileEntry {
  name: String,
  path: String,
  kind: &'static str,
}

fn safe_path(root: &str, relative: &str) -> Result<PathBuf, String> {
  let root_path = fs::canonicalize(root).map_err(|error| format!("Projekt konnte nicht gefunden werden: {error}"))?;
  let candidate = root_path.join(relative);
  let canonical = if candidate.exists() {
    fs::canonicalize(&candidate).map_err(|error| error.to_string())?
  } else {
    let parent = candidate.parent().ok_or_else(|| "Ungültiger Projektpfad".to_string())?;
    fs::canonicalize(parent).map_err(|error| error.to_string())?.join(candidate.file_name().ok_or_else(|| "Ungültiger Projektpfad".to_string())?)
  };
  if canonical != root_path && !canonical.starts_with(&root_path) { return Err("Pfad liegt außerhalb des geöffneten Projekts".to_string()); }
  Ok(canonical)
}

#[tauri::command]
fn read_project_file(root: String, path: String) -> Result<String, String> { fs::read_to_string(safe_path(&root, &path)?).map_err(|error| error.to_string()) }

#[tauri::command]
fn write_project_file(root: String, path: String, content: String) -> Result<(), String> { fs::write(safe_path(&root, &path)?, content).map_err(|error| error.to_string()) }

#[tauri::command]
fn project_path_exists(root: String, path: String) -> Result<bool, String> { Ok(safe_path(&root, &path)?.exists()) }

#[tauri::command]
fn create_project_directory(root: String, path: String) -> Result<(), String> { fs::create_dir_all(safe_path(&root, &path)?).map_err(|error| error.to_string()) }

#[tauri::command]
fn list_project_directory(root: String, path: String) -> Result<Vec<FileEntry>, String> {
  let mut entries = Vec::new();
  for item in fs::read_dir(safe_path(&root, &path)?).map_err(|error| error.to_string())? {
    let item = item.map_err(|error| error.to_string())?;
    let metadata = item.metadata().map_err(|error| error.to_string())?;
    entries.push(FileEntry { name: item.file_name().to_string_lossy().into_owned(), path: item.path().to_string_lossy().into_owned(), kind: if metadata.is_dir() { "directory" } else { "file" } });
  }
  entries.sort_by(|left, right| left.name.to_lowercase().cmp(&right.name.to_lowercase()));
  Ok(entries)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![read_project_file, write_project_file, project_path_exists, create_project_directory, list_project_directory])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
