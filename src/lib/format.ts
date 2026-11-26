/**
 * Format a monetary amount for display. Numeric values come from PostgreSQL
 * numeric(19,4); this is presentation-only formatting — never use floats
 * for money math.
 */
export function formatCurrency(
  amount: number | string,
  currency: string,
  locale = 'es-CO'
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}
