import { describe, it, expect } from 'vitest';
import { accountSchema } from '../validation/account';
import { categorySchema } from '../validation/category';

describe('accountSchema', () => {
  const valid = {
    name: 'Checking',
    account_type: 'checking',
    currency: 'cop',
    opening_balance: '1000.50',
  };

  it('accepts a valid account', () => {
    const result = accountSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe('COP');
      expect(result.data.opening_balance).toBe('1000.50');
    }
  });

  it('rejects an empty name', () => {
    expect(accountSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
    expect(accountSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false);
  });

  it('rejects a name over 100 characters', () => {
    expect(accountSchema.safeParse({ ...valid, name: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejects an invalid account type', () => {
    expect(accountSchema.safeParse({ ...valid, account_type: 'crypto' }).success).toBe(false);
  });

  it('rejects a malformed currency code', () => {
    expect(accountSchema.safeParse({ ...valid, currency: 'COPX' }).success).toBe(false);
    expect(accountSchema.safeParse({ ...valid, currency: '12' }).success).toBe(false);
  });

  it('rejects balances with more than 4 decimals or invalid format', () => {
    expect(accountSchema.safeParse({ ...valid, opening_balance: '1.23456' }).success).toBe(false);
    expect(accountSchema.safeParse({ ...valid, opening_balance: 'abc' }).success).toBe(false);
    expect(accountSchema.safeParse({ ...valid, opening_balance: '1,000.50' }).success).toBe(false);
  });

  it('accepts negative balances (e.g. credit accounts)', () => {
    const result = accountSchema.safeParse({ ...valid, opening_balance: '-250.75' });
    expect(result.success).toBe(true);
  });

  it('defaults empty balance to 0', () => {
    const result = accountSchema.safeParse({ ...valid, opening_balance: '' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.opening_balance).toBe('0');
    }
  });
});

describe('categorySchema', () => {
  const valid = { name: 'Mascotas', category_type: 'expense' };

  it('accepts a valid category', () => {
    expect(categorySchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an empty or too-long name', () => {
    expect(categorySchema.safeParse({ ...valid, name: '' }).success).toBe(false);
    expect(categorySchema.safeParse({ ...valid, name: 'a'.repeat(61) }).success).toBe(false);
  });

  it('rejects an invalid category type', () => {
    expect(categorySchema.safeParse({ ...valid, category_type: 'transfer' }).success).toBe(false);
  });
});
