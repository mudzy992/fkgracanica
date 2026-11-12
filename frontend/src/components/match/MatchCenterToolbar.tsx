import { buttonVariants } from "../ui/button-variants";
import { cn } from "../../lib/utils";
import { Link } from 'react-router-dom';
import { Radio, Mic2 } from 'lucide-react';
import { Badge } from '../ui/badge';
;
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
        <Link to={`/live/${matchId}`} className={cn(buttonVariants({variant: isLive ? 'default' : 'outline', size: "sm"}), "gap-1.5")}><Radio size={14} />
            {isLive ? 'Live centar' : 'Live prikaz'}</Link>
        {canCommentate && (
          <Link to={`/admin/live/${matchId}`} className={cn(buttonVariants({variant: "outline", size: "sm"}), "gap-1.5")}><Mic2 size={14} />
              Komentator</Link>
        )}
      </div>
    </div>
  );
}
