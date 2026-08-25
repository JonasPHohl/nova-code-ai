import { describe, expect, it } from 'vitest';
import { detectLanguage } from './language';

describe('detectLanguage', () => {
  it.each([['app.ts', 'typescript'], ['app.js', 'javascript'], ['main.py', 'python'], ['data.json', 'json'], ['index.html', 'html'], ['styles.css', 'css'], ['README.md', 'markdown']])('detects %s', (path, language) => {
    expect(detectLanguage(path)).toBe(language);
  });

  it('uses plaintext for unknown extensions', () => expect(detectLanguage('notes.txt')).toBe('plaintext'));
});
