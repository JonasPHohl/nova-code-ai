import { open } from '@tauri-apps/plugin-dialog';

export async function chooseDirectory(): Promise<string | null> {
  const selected = await open({ directory: true, multiple: false, recursive: false });
  return typeof selected === 'string' ? selected : null;
}
