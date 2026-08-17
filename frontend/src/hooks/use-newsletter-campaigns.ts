import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '../lib/api';
import { getRealtimeSocket } from '../lib/realtime';

export type NewsletterCampaignStatus = 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED';

export interface NewsletterCampaign {
  id: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  status: NewsletterCampaignStatus;
  sentAt: string | null;
  sentCount: number;
  failCount: number;
  targetCount: number;
  createdAt: string;
  createdBy?: { email: string } | null;
}

export type CampaignProgress = {
  id: string;
  status: NewsletterCampaignStatus;
  sentCount: number;
  failCount: number;
  targetCount: number;
};

type CampaignDraft = {
  subject: string;
  textBody: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

const KEY = ['newsletter', 'campaigns'] as const;

export function useNewsletterCampaigns() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await api.get<NewsletterCampaign[]>('/newsletter/campaigns')).data,
  });
}

export function useCreateNewsletterCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CampaignDraft) =>
      (await api.post<NewsletterCampaign>('/newsletter/campaigns', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function usePreviewNewsletterCampaign() {
  return useMutation({
    mutationFn: async (body: CampaignDraft) =>
      (await api.post<{ html: string }>('/newsletter/campaigns/preview', body)).data,
  });
}

export function useSendNewsletterCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.post<NewsletterCampaign>(`/newsletter/campaigns/${id}/send`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useNewsletterCampaignRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const socket = getRealtimeSocket();
    socket.emit('newsletter:join');
    const handler = (row: CampaignProgress) => {
      qc.setQueryData<NewsletterCampaign[]>(KEY, (old) =>
        (old ?? []).map((c) => (c.id === row.id ? { ...c, ...row } : c)),
      );
    };
    socket.on('newsletter:campaign', handler);
    return () => {
      socket.emit('newsletter:leave');
      socket.off('newsletter:campaign', handler);
    };
  }, [qc]);
}
