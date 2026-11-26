import { describe, it, expect } from 'vitest';
import { householdSchema } from '../validation/household';

describe('householdSchema', () => {
  it('accepts a valid household name', () => {
    const result = householdSchema.safeParse({ name: 'Smith Family' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Smith Family');
    }
  });

  it('trims surrounding whitespace', () => {
    const result = householdSchema.safeParse({ name: '  Smith Family  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Smith Family');
    }
  });

  it('rejects an empty name', () => {
    const result = householdSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a whitespace-only name', () => {
    const result = householdSchema.safeParse({ name: '   ' });
    expect(result.success).toBe(false);
  });

  it('rejects a name longer than 100 characters', () => {
    const result = householdSchema.safeParse({ name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('accepts a name of exactly 100 characters', () => {
    const result = householdSchema.safeParse({ name: 'a'.repeat(100) });
    expect(result.success).toBe(true);
  });
});
