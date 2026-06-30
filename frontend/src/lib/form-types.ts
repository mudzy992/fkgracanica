export type FormResult = 'W' | 'D' | 'L';

export interface FormMatchEntry {
  result: FormResult;
  matchId: string;
  scheduledAt: string;
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
  opponentName: string;
  opponentSlug: string;
}
