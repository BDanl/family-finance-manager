import { z } from 'zod';

const balancePattern = /^-?\d+(\.\d{1,4})?$/;

export const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be 100 characters or less'),
  account_type: z.enum(['cash', 'checking', 'savings', 'credit', 'other']),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'Currency must be a 3-letter code')
    .transform((v) => v.toUpperCase()),
  opening_balance: z
    .string()
    .trim()
    .regex(balancePattern, 'Balance must be a number with up to 4 decimals')
    .or(z.literal(''))
    .transform((v) => (v === '' ? '0' : v)),
  description: z.string().max(500, 'Description is too long').optional().or(z.literal('')),
  icon: z.string().max(50, 'Icon is too long').optional().or(z.literal('')),
  color: z.string().max(30, 'Color is too long').optional().or(z.literal('')),
});

export type AccountFormData = z.infer<typeof accountSchema>;
