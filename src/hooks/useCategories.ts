import { useCallback, useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';
import type { Category, CategoryInput } from '../types/category';

export function useCategories(householdId: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!householdId) {
      setCategories([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      // Management page shows archived categories too (with badges) so they can be restored
      const data = await categoryService.listCategories(householdId, true);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  const createCategory = async (input: CategoryInput) => {
    if (!householdId) throw new Error('No household selected');
    await categoryService.createCategory(householdId, input);
    await reload();
  };

  const updateCategory = async (
    categoryId: string,
    updates: Parameters<typeof categoryService.updateCategory>[1]
  ) => {
    await categoryService.updateCategory(categoryId, updates);
    await reload();
  };

  const setCategoryArchived = async (categoryId: string, archived: boolean) => {
    await categoryService.setCategoryArchived(categoryId, archived);
    await reload();
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    setCategoryArchived,
    reload,
  };
}
