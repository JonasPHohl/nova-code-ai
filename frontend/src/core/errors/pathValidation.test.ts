import { describe, expect, it } from 'vitest';
import { UnsafePathError, validateProjectName, validateProjectPath } from './pathValidation';

describe('validateProjectPath', () => {
  it('rejects paths outside the project root', () => {
    expect(() => validateProjectPath('C:/project', 'C:/other/file.ts')).toThrow(UnsafePathError);
    expect(() => validateProjectPath('C:/project', 'C:/project/../other')).toThrow(UnsafePathError);
  });

  it('rejects unsafe project names', () => {
    expect(() => validateProjectName('../outside')).toThrow();
  });
});
