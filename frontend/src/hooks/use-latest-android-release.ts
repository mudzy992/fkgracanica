import { isAxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');

export type LatestAndroidRelease = {
  version: string;
  versionCode: number;
  apkUrl: string;
  apkSizeBytes: number;
  releaseNotes: string | null;
  publishedAt: string | null;
};

export function latestApkDownloadUrl(): string {
  return `${API_URL}/public/app-releases/android/latest/download`;
}

export function useLatestAndroidRelease() {
  return useQuery({
    queryKey: ['public', 'app-releases', 'android', 'latest'],
    queryFn: async (): Promise<LatestAndroidRelease | null> => {
      try {
        return (await api.get<LatestAndroidRelease>('/public/app-releases/android/latest')).data;
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) return null;
        throw err;
      }
    },
  });
}
