import { useApproveMatchReport } from '../../hooks/use-live-admin';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Props {
  matchId: string;
  reportStatus?: string;
}

export function MatchReportApproval({ matchId, reportStatus }: Props) {
  const approve = useApproveMatchReport();

  if (reportStatus !== 'PENDING_APPROVAL') return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2">
        <Badge variant="default">Čeka odobrenje</Badge>
        <span className="text-sm">Live izvještaj čeka moderatorsko odobrenje.</span>
      </div>
      <Button
        size="sm"
        onClick={() => void approve.mutateAsync(matchId)}
        disabled={approve.isPending}
      >
        Odobri izvještaj
      </Button>
    </div>
  );
}
