import { describe, it, expect, beforeEach, vi } from 'vitest';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

type QueryResult = { data?: unknown; error?: { message: string } | null };

// Minimal thenable query-builder mock: every chained method returns itself,
// awaiting resolves to the configured result, and all calls are recorded so
// tests can assert filters (e.g. household scoping) were applied.
function chain(result: QueryResult, calls: unknown[][] = []) {
  const target: Record<string, unknown> = { calls };
  return new Proxy(target, {
    get(_t, prop) {
      if (prop === 'then') {
        return (resolve: (value: QueryResult) => void) => resolve(result);
      }
      if (prop === 'calls') {
        return calls;
      }
      return (...args: unknown[]) => {
        calls.push([prop, ...args]);
        return chain(result, calls);
      };
    },
  });
}

function queueResults(...results: QueryResult[]) {
  const queue = [...results];
  mockFrom.mockImplementation(() => chain(queue.shift() ?? { data: [], error: null }));
}

// Returns the recorded chained calls of the most recent from() query
function lastQueryCalls(): unknown[][] {
  const results = mockFrom.mock.results;
  const last = results[results.length - 1];
  return ((last?.value as { calls?: unknown[][] })?.calls ?? []) as unknown[][];
}

const accountRow = {
  id: 'acc-1',
  household_id: 'hh-1',
  name: 'Checking',
  account_type: 'checking',
  description: null,
  icon: null,
  color: null,
  currency: 'COP',
  opening_balance: 1000,
  archived_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const categoryRow = {
  id: 'cat-1',
  household_id: 'hh-1',
  name: 'Mercado',
  category_type: 'expense',
  icon: null,
  color: null,
  is_default: true,
  archived_at: null,
  created_at: '2024-01-01T00:00:00Z',
};

describe('accountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists accounts scoped to the household and excludes archived by default', async () => {
    queueResults({ data: [accountRow], error: null });

    const accounts = await accountService.listAccounts('hh-1');

    expect(accounts).toHaveLength(1);
    expect(accounts[0].name).toBe('Checking');
    expect(mockFrom).toHaveBeenCalledWith('accounts');
    expect(lastQueryCalls()).toContainEqual(['eq', 'household_id', 'hh-1']);
    expect(lastQueryCalls()).toContainEqual(['is', 'archived_at', null]);
  });

  it('includes archived accounts when requested', async () => {
    queueResults({ data: [accountRow], error: null });

    await accountService.listAccounts('hh-1', true);

    expect(lastQueryCalls()).toContainEqual(['eq', 'household_id', 'hh-1']);
    expect(lastQueryCalls().some((c) => c[0] === 'is')).toBe(false);
  });

  it('creates an account with household scope', async () => {
    queueResults({ data: accountRow, error: null });

    const account = await accountService.createAccount('hh-1', {
      name: 'Checking',
      account_type: 'checking',
      currency: 'COP',
      opening_balance: '1000.50',
    });

    expect(account.id).toBe('acc-1');
    expect(mockFrom).toHaveBeenCalledWith('accounts');
    const insertCall = lastQueryCalls().find((c) => c[0] === 'insert');
    expect(insertCall?.[1]).toMatchObject({ household_id: 'hh-1', name: 'Checking' });
  });

  it('updates and archives accounts by id', async () => {
    queueResults({ data: null, error: null }, { data: null, error: null });

    await accountService.updateAccount('acc-1', { name: 'New name' });
    await accountService.setAccountArchived('acc-1', true);

    const calls = mockFrom.mock.results.flatMap(
      (r) => ((r.value as { calls?: unknown[][] })?.calls ?? []) as unknown[][]
    );
    expect(calls).toContainEqual(['eq', 'id', 'acc-1']);
    expect(calls.some((c) => c[0] === 'update')).toBe(true);
  });

  it('throws on query error', async () => {
    queueResults({ data: null, error: { message: 'permission denied' } });

    await expect(accountService.listAccounts('hh-1')).rejects.toMatchObject({
      message: 'permission denied',
    });
  });
});

describe('categoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists categories scoped to the household', async () => {
    queueResults({ data: [categoryRow], error: null });

    const categories = await categoryService.listCategories('hh-1');

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe('Mercado');
    expect(mockFrom).toHaveBeenCalledWith('categories');
    expect(lastQueryCalls()).toContainEqual(['eq', 'household_id', 'hh-1']);
    expect(lastQueryCalls()).toContainEqual(['is', 'archived_at', null]);
  });

  it('creates a custom category within the household', async () => {
    queueResults({ data: { ...categoryRow, is_default: false }, error: null });

    const category = await categoryService.createCategory('hh-1', {
      name: 'Mascotas',
      category_type: 'expense',
    });

    expect(category.is_default).toBe(false);
    expect(mockFrom).toHaveBeenCalledWith('categories');
    const insertCall = lastQueryCalls().find((c) => c[0] === 'insert');
    expect(insertCall?.[1]).toMatchObject({ household_id: 'hh-1', name: 'Mascotas' });
  });

  it('archives a category via archived_at', async () => {
    queueResults({ data: null, error: null });

    await categoryService.setCategoryArchived('cat-1', true);

    expect(mockFrom).toHaveBeenCalledWith('categories');
  });

  it('throws on query error', async () => {
    queueResults({ data: null, error: { message: 'rls violation' } });

    await expect(categoryService.listCategories('hh-1')).rejects.toMatchObject({
      message: 'rls violation',
    });
  });
});
