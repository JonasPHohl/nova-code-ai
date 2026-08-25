const languageByExtension: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript',
  '.py': 'python', '.json': 'json', '.html': 'html', '.htm': 'html', '.css': 'css',
  '.md': 'markdown', '.markdown': 'markdown'
};

export function detectLanguage(path: string): string {
  const fileName = path.replaceAll('\\', '/').split('/').at(-1) ?? path;
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return languageByExtension[extension] ?? 'plaintext';
}
