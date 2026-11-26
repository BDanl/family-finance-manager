import { z } from 'zod';

export const householdSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Household name is required')
    .max(100, 'Household name must be 100 characters or less'),
});

export type HouseholdFormData = z.infer<typeof householdSchema>;
