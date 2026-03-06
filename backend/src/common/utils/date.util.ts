const DATE_FIELDS = [
  'startedAt',
  'deadlineAt',
  'depositPaidAt',
  'balancePaidAt',
  'deliveredAt',
  'paidAt',
];

export function normalizeDates<T extends Record<string, any>>(dto: T): T {
  const result: Record<string, any> = { ...dto };
  for (const field of DATE_FIELDS) {
    if (result[field]) result[field] = new Date(result[field]).toISOString();
  }
  return result as T;
}
