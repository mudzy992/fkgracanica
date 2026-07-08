import { Link } from 'react-router-dom';
import { Radio, Mic2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { matchStatusLabel, matchStatusTone } from '../../lib/match-status-label';

interface Props {
  matchId: string;
  status: string;
  isLive: boolean;
  canCommentate: boolean;
}

export function MatchCenterToolbar({ matchId, status, isLive, canCommentate }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Badge variant={matchStatusTone(status)}>{matchStatusLabel(status)}</Badge>
      <div className="flex flex-wrap gap-2">
        <Link to={`/live/${matchId}`}>
          <Button size="sm" variant={isLive ? 'default' : 'outline'} className="gap-1.5">
            <Radio size={14} />
            {isLive ? 'Live centar' : 'Live prikaz'}
          </Button>
        </Link>
        {canCommentate && (
          <Link to={`/admin/live/${matchId}`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Mic2 size={14} />
              Komentator
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
