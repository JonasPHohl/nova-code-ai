import { describe, expect, it } from 'vitest';
import { applyCodeSuggestion, createCodeDiff } from './diffService';

describe('diffService', () => {
  it('creates a diff and applies only the selected range', () => {
    expect(createCodeDiff('const x = 1;', 'const x = 2;')).toEqual({ original: 'const x = 1;', proposed: 'const x = 2;' });
    expect(applyCodeSuggestion('before\nconst x = 1;\nafter', 'const x = 1;', 'const x = 2;')).toBe('before\nconst x = 2;\nafter');
  });

  it('rejects a stale selection instead of changing content', () => {
    expect(() => applyCodeSuggestion('changed', 'old', 'new')).toThrow('nicht mehr');
  });
});