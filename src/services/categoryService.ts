import { supabase } from '../lib/supabase';
import type { Category, CategoryInput, CategoryType } from '../types/category';

const CATEGORY_FIELDS =
  'id, household_id, name, category_type, icon, color, is_default, archived_at, created_at';

export const categoryService = {
  /**
   * List categories for a household. Archived categories are excluded unless
   * includeArchived is true.
   */
  async listCategories(householdId: string, includeArchived = false): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select(CATEGORY_FIELDS)
      .eq('household_id', householdId)
      .order('name', { ascending: true });

    if (!includeArchived) {
      query = query.is('archived_at', null);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data || []) as Category[];
  },

  /**
   * Create a custom category. RLS enforces owner/admin role.
   */
  async createCategory(householdId: string, input: CategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        household_id: householdId,
        name: input.name,
        category_type: input.category_type as CategoryType,
        icon: input.icon || null,
        color: input.color || null,
        is_default: false,
      })
      .select(CATEGORY_FIELDS)
      .single();

    if (error) {
      throw error;
    }

    return data as Category;
  },

  /**
   * Update category details. category_type and household_id are not updatable
   * through this service.
   */
  async updateCategory(
    categoryId: string,
    updates: Partial<Pick<Category, 'name' | 'icon' | 'color'>>
  ): Promise<void> {
    const { error } = await supabase.from('categories').update(updates).eq('id', categoryId);

    if (error) {
      throw error;
    }
  },

  /**
   * Archive or restore a category. Archiving preserves historical records.
   */
  async setCategoryArchived(categoryId: string, archived: boolean): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq('id', categoryId);

    if (error) {
      throw error;
    }
  },
};
