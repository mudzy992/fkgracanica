import { useState } from 'react';
import { useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { useValidateTicket } from '../../hooks/use-ticketing-admin';
import { getApiErrorMessage } from '../../lib/api-error';
import { matchLabel, ticketStatusLabel } from '../../lib/ticketing-status';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function TicketingValidatePanel() {
  const validate = useValidateTicket();
  const { data: config } = useTicketingPublicConfig();
  const matchId = config?.activeTicketMatch?.id;
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onValidate = async () => {
    setError(null);
    const code = qrCode.trim();
    if (!code) return;
    try {
      await validate.mutateAsync({ qrCode: code, matchId });
      setQrCode('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Validacija nije uspjela. Provjerite QR kod i status ulaznice.'));
    }
  };

  const result = validate.data;
  const used = Boolean(error && /iskorišten|skeniran|already/i.test(error));

  return (
    <div className="mb-6 rounded-xl border border-[var(--border-subtle)] bg-background p-4">
      <h2 className="text-sm font-semibold text-text">Validacija na ulazu</h2>
      <p className="mt-1 text-xs text-text-muted">
        Skenirajte QR ulaznice ili sezonske karte
        {config?.activeTicketMatch
          ? ` (utakmica: ${config.activeTicketMatch.homeClub?.name ?? '—'} vs ${config.activeTicketMatch.awayClub?.name ?? '—'})`
          : ''}
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Input
          className="min-w-[200px] flex-1"
          placeholder="QR kod ulaznice"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
        />
        <Button disabled={validate.isPending} onClick={() => void onValidate()}>
          {validate.isPending ? 'Provjera...' : 'Validiraj'}
        </Button>
      </div>
      {error ? (
        <div className="mt-3 rounded-lg bg-danger/10 p-3 text-sm text-danger">
          {used ? 'Iskorišteno — ' : 'Nevažeće — '}
          {error}
        </div>
      ) : null}
      {result && !error ? (
        <div className="mt-3 rounded-lg bg-success/10 p-3 text-sm text-success">
          Valjano — {ticketStatusLabel(result.status)} · {result.category} · {matchLabel(result.match)}
        </div>
      ) : null}
    </div>
  );
}
