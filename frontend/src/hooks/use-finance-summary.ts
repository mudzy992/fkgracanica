import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export type FinanceBucket = { key: string; count: number; sum: number };

export type FinanceSummary = {
  from: string;
  to: string;
  tickets: { count: number; sum: number };
  membership: { count: number; sum: number; estimated: true };
  totalSum: number;
  byProvider: FinanceBucket[];
  byStatus: FinanceBucket[];
};

export type FinanceFilters = {
  from: string;
  to: string;
  provider: string;
  status: string;
};

export function financeParams(filters: FinanceFilters) {
  const params: Record<string, string> = {};
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  if (filters.provider) params.provider = filters.provider;
  if (filters.status) params.status = filters.status;
  return params;
}

export function useFinanceSummary(filters: FinanceFilters) {
  return useQuery({
    queryKey: ['finance', 'summary', filters],
    queryFn: async () =>
      (await api.get<FinanceSummary>('/finance/summary', { params: financeParams(filters) })).data,
  });
}

export async function downloadFinanceExport(kind: 'xlsx' | 'pdf', filters: FinanceFilters) {
  const res = await api.get(`/finance/export.${kind}`, {
    params: financeParams(filters),
    responseType: 'blob',
  });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finansije.${kind}`;
  a.click();
  URL.revokeObjectURL(url);
}
