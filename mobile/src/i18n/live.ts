export const liveBs = {
  matchLive: 'Uživo',
  matchHalftime: 'Pauza',
  matchFinished: 'Završena',
  matchScheduled: 'Zakazana',
  matchPostponed: 'Odgođena',
  matchCancelled: 'Otkazana',
  matchRound: '{{n}}. kolo',
} as const;

export const liveEn: Record<keyof typeof liveBs, string> = {
  matchLive: 'Live',
  matchHalftime: 'Half-time',
  matchFinished: 'Finished',
  matchScheduled: 'Scheduled',
  matchPostponed: 'Postponed',
  matchCancelled: 'Cancelled',
  matchRound: 'Round {{n}}',
};
