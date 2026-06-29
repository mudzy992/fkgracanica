import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { User } from '../types';
import type { MembershipRow } from '../types/membership';

export interface JoinMembershipPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface JoinMembershipResponse {
  membership: MembershipRow;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export function useJoinMembershipOnline() {
  return useMutation({
    mutationFn: async (body: JoinMembershipPayload) =>
      (await api.post<JoinMembershipResponse>('/membership/public/join', body)).data,
  });
}
