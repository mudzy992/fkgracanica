export const liveBs = {
  matchLive: 'Uživo',
  matchHalftime: 'Pauza',
  matchFinished: 'Završena',
  matchScheduled: 'Zakazana',
  matchPostponed: 'Odgođena',
  matchCancelled: 'Otkazana',
  matchRound: '{{n}}. kolo',
  matchStream: 'Stream',
  matchStreamPaused: 'Prijenos pauziran — poluvrijeme',
  matchEventsCta: 'Događaji',
  matchOpenBroadcast: 'Otvori prijenos',
} as const;

export const liveEn: Record<keyof typeof liveBs, string> = {
  matchLive: 'Live',
  matchHalftime: 'Half-time',
  matchFinished: 'Finished',
  matchScheduled: 'Scheduled',
  matchPostponed: 'Postponed',
  matchCancelled: 'Cancelled',
  matchRound: 'Round {{n}}',
  matchStream: 'Stream',
  matchStreamPaused: 'Stream paused — half-time',
  matchEventsCta: 'Events',
  matchOpenBroadcast: 'Open broadcast',
};
