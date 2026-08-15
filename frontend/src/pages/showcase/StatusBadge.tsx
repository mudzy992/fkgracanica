import type { ShowcaseBadge } from './types';
import { Badge } from '../../components/ui/badge';

const LABELS: Record<ShowcaseBadge, string> = {
  ready: 'Spremno',
  in_progress: 'U toku',
  after_launch: 'Poslije lansiranja',
  web_only: 'Web admin',
};

const VARIANTS: Record<ShowcaseBadge, 'success' | 'warning' | 'muted' | 'default'> = {
  ready: 'success',
  in_progress: 'warning',
  after_launch: 'muted',
  web_only: 'default',
};

export function StatusBadge({ badge, percent }: { badge: ShowcaseBadge; percent?: number }) {
  const label =
    badge === 'in_progress' && percent != null ? `${LABELS[badge]} · ${percent}%` : LABELS[badge];
  return <Badge variant={VARIANTS[badge]}>{label}</Badge>;
}
