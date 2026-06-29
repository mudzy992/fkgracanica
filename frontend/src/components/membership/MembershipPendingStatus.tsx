import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface Props {
  onlineAllowed: boolean;
  userEmail?: string;
  showPayButton?: boolean;
  annualPrice?: number;
  onPayOnline?: () => void;
  payLoading?: boolean;
}

export function MembershipPendingStatus({
  onlineAllowed,
  userEmail,
  showPayButton = false,
  annualPrice = 0,
  onPayOnline,
  payLoading,
}: Props) {
  return (
    <div className="space-y-4 rounded-lg border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">Na čekanju</Badge>
        <p className="text-sm font-medium text-text">Prijava za članstvo čeka odobrenje</p>
      </div>

      {onlineAllowed ? (
        <p className="text-sm text-text-muted">
          Vaša uplata je zaprimljena. Klub će potvrditi članstvo u najkraćem roku — tada ćete ovdje vidjeti
          digitalnu člansku karticu s QR kodom.
        </p>
      ) : (
        <p className="text-sm text-text-muted">
          Vaša prijava je zaprimljena. Članstvo se aktivira nakon <strong>uplate na blagajni stadiona</strong>{' '}
          i potvrde od strane kluba. Tada ćete ovdje vidjeti digitalnu člansku karticu s QR kodom.
        </p>
      )}

      {showPayButton && onPayOnline && (
        <Button className="w-full" disabled={payLoading} onClick={onPayOnline}>
          {payLoading ? 'Preusmjeravanje...' : `Plati online · ${annualPrice} KM`}
        </Button>
      )}

      {userEmail && (
        <p className="text-xs text-text-muted">
          Prijavljeni ste kao <strong>{userEmail}</strong>
        </p>
      )}
    </div>
  );
}
