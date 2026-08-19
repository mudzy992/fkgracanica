import { useEffect } from 'react';
import { api } from '../lib/api';
import { getOrCreateVisitorId, markVisitSent, wasVisitSentThisSession } from '../lib/visitor-identity';

export function useTrackPublicVisit() {
  useEffect(() => {
    if (wasVisitSentThisSession()) return;
    const visitorId = getOrCreateVisitorId();
    markVisitSent();
    api
      .post('/public-analytics/visit', { platform: 'web', visitorId })
      .catch(() => undefined);
  }, []);
}
