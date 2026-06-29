import { useState } from 'react';
import { useValidateTicket } from '../../hooks/use-ticketing-admin';
import { matchLabel, ticketStatusLabel } from '../../lib/ticketing-status';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function TicketingValidatePanel() {
  const validate = useValidateTicket();
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onValidate = async () => {
    setError(null);
    const code = qrCode.trim();
    if (!code) return;
    try {
      await validate.mutateAsync(code);
      setQrCode('');
    } catch {
      setError('Validacija nije uspjela. Provjerite QR kod i status ulaznice.');
    }
  };

  const result = validate.data;

  return (
    <div className="mb-6 rounded-xl border border-[var(--border-subtle)] bg-background p-4">
      <h2 className="text-sm font-semibold text-text">Validacija na ulazu</h2>
      <p className="mt-1 text-xs text-text-muted">Skenirajte ili unesite QR kod ulaznice.</p>
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
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      {result && (
        <div className="mt-3 rounded-lg bg-success/10 p-3 text-sm text-success">
          Ulaznica validirana — {ticketStatusLabel(result.status)} · {result.category} ·{' '}
          {matchLabel(result.match)}
        </div>
      )}
    </div>
  );
}
