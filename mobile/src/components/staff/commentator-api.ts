import { Alert } from 'react-native';
import { api } from '../../lib/api';
import { getApiErrorMessage } from '../../lib/api-error';

export type LiveActionRunner = (fn: () => Promise<unknown>) => Promise<void>;

export function createLiveActionRunner(fallback: string): LiveActionRunner {
  return async (fn) => {
    try {
      await fn();
    } catch (err) {
      Alert.alert(fallback, getApiErrorMessage(err, fallback));
    }
  };
}

export const postLive = (
  matchId: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<unknown> => api.post(`/live/matches/${matchId}/${path}`, body);

export const patchLiveStream = (matchId: string, url: string | null): Promise<unknown> =>
  api.patch(`/live/matches/${matchId}/stream`, { url });

export type AddEventBody = {
  type: string;
  minute?: number;
  playerId?: string;
  relatedPlayerId?: string;
  teamSide?: string;
  description?: string;
};

export const postLiveEvent = (matchId: string, body: AddEventBody): Promise<unknown> =>
  api.post(`/live/matches/${matchId}/events`, body);

export const postReportEvent = (
  matchId: string,
  body: AddEventBody & { minute: number },
): Promise<unknown> => api.post(`/live/matches/${matchId}/report/events`, body);

export const postReportSubmit = (matchId: string): Promise<unknown> =>
  api.post(`/live/matches/${matchId}/report/submit`);
