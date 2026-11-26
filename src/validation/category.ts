import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(60, 'Category name must be 60 characters or less'),
  category_type: z.enum(['income', 'expense']),
  icon: z.string().max(50, 'Icon is too long').optional().or(z.literal('')),
  color: z.string().max(30, 'Color is too long').optional().or(z.literal('')),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
