import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { categorySchema } from '../../validation/category';
import { CATEGORY_TYPES } from '../../types/category';
import type { Category, CategoryInput, CategoryType } from '../../types/category';

const inputClass =
  'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700';

interface CategoriesTabProps {
  householdId: string;
  canManage: boolean;
}

interface FormState {
  name: string;
  category_type: CategoryType;
  icon: string;
  color: string;
}

const emptyForm = (type: CategoryType = 'expense'): FormState => ({
  name: '',
  category_type: type,
  icon: '',
  color: '',
});

export function CategoriesTab({ householdId, canManage }: CategoriesTabProps) {
  const { categories, loading, error, createCategory, updateCategory, setCategoryArchived } =
    useCategories(householdId);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openCreate = (type: CategoryType) => {
    setEditing(null);
    setForm(emptyForm(type));
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      category_type: category.category_type,
      icon: category.icon ?? '',
      color: category.color ?? '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const result = categorySchema.safeParse(form);
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? 'Invalid category data');
      return;
    }

    setSubmitting(true);
    try {
      const input: CategoryInput = {
        name: result.data.name,
        category_type: result.data.category_type,
        icon: result.data.icon || null,
        color: result.data.color || null,
      };

      if (editing) {
        // category_type is immutable after creation
        await updateCategory(editing.id, {
          name: input.name,
          icon: input.icon,
          color: input.color,
        });
      } else {
        await createCategory(input);
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (category: Category) => {
    setActionError('');
    try {
      await setCategoryArchived(category.id, !category.archived_at);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading categories...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
    );
  }

  const renderCategoryList = (type: CategoryType) => {
    const items = categories
      .filter((c) => c.category_type === type)
      .sort(
        (a, b) => Number(!!a.archived_at) - Number(!!b.archived_at) || a.name.localeCompare(b.name)
      );

    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {type === 'expense' ? 'Expenses' : 'Income'}
          </h4>
          {canManage && !showForm && (
            <button
              onClick={() => openCreate(type)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add {type}
            </button>
          )}
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No {type} categories.</p>
        ) : (
          <div className="bg-white shadow rounded-lg divide-y">
            {items.map((category) => (
              <div key={category.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  {category.is_default && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      default
                    </span>
                  )}
                  {category.archived_at && (
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                      archived
                    </span>
                  )}
                </div>
                {canManage && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEdit(category)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(category)}
                      className="text-sm text-yellow-600 hover:text-yellow-800"
                    >
                      {category.archived_at ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {actionError}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-lg p-6 space-y-4 border border-gray-200"
        >
          <h3 className="text-lg font-medium text-gray-900">
            {editing ? 'Edit category' : 'New category'}
          </h3>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category-name" className={labelClass}>
                Name
              </label>
              <input
                id="category-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="e.g., Mascotas"
              />
            </div>
            <div>
              <label htmlFor="category-type" className={labelClass}>
                Type
              </label>
              <select
                id="category-type"
                value={form.category_type}
                disabled={!!editing}
                onChange={(e) =>
                  setForm({ ...form, category_type: e.target.value as CategoryType })
                }
                className={`${inputClass} disabled:bg-gray-100`}
              >
                {CATEGORY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {editing && (
                <p className="text-xs text-gray-500 mt-1">Type cannot be changed after creation.</p>
              )}
            </div>
            <div>
              <label htmlFor="category-icon" className={labelClass}>
                Icon (optional)
              </label>
              <input
                id="category-icon"
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="category-color" className={labelClass}>
                Color (optional)
              </label>
              <input
                id="category-color"
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className={inputClass}
                placeholder="#3b82f6"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Create category'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {renderCategoryList('expense')}
      {renderCategoryList('income')}
    </div>
  );
}
