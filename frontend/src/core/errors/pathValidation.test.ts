import { describe, expect, it } from 'vitest';
import { UnsafePathError, validateProjectPath } from './pathValidation';

describe('validateProjectPath', () => {
  it('rejects paths outside the project root', () => {
    expect(() => validateProjectPath('C:/project', 'C:/other/file.ts')).toThrow(UnsafePathError);
  });
});
