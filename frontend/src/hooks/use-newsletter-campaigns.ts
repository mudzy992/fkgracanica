import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export type NewsletterCampaignStatus = 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED';

export interface NewsletterCampaign {
  id: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  status: NewsletterCampaignStatus;
  sentAt: string | null;
  sentCount: number;
  failCount: number;
  targetCount: number;
  createdAt: string;
  createdBy?: { email: string } | null;
}

export function useNewsletterCampaigns() {
  return useQuery({
    queryKey: ['newsletter', 'campaigns'],
    queryFn: async () => (await api.get<NewsletterCampaign[]>('/newsletter/campaigns')).data,
  });
}

export function useCreateNewsletterCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { subject: string; htmlBody: string; textBody?: string }) =>
      (await api.post<NewsletterCampaign>('/newsletter/campaigns', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['newsletter', 'campaigns'] }),
  });
}

export function useSendNewsletterCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.post<NewsletterCampaign>(`/newsletter/campaigns/${id}/send`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['newsletter', 'campaigns'] }),
  });
}
