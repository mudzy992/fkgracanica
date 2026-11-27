'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getApiUrl } from '../../../lib/media';
import { getAuthHeader } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function ScanPage() {
  const { user } = useAuth();
  const canScan = hasPermission(user?.permissions, 'admissions.scan') || hasPermission(user?.permissions, 'ticketing.manage');
  const [qr, setQr] = useState('');
  const [mode, setMode] = useState<'validate' | 'inspect'>('validate');

  const scan = useMutation({
    mutationFn: async () => {
      const path = mode === 'validate' ? '/ticketing/validate' : '/ticketing/inspect';
      const res = await fetch(`${getApiUrl()}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ qrCode: qr }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((j as { message?: string }).message || 'Greška');
      return j;
    },
  });

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="font-display text-2xl font-bold">Skeniranje ulaznica</h1>
        <p className="mt-1 text-sm text-text-muted">Redar 1 · admissions.scan · QR validacija</p>
        {!canScan ? <p className="mt-2 text-xs text-danger">Nema dozvole admissions.scan</p> : null}
      </div>

      <Card className="p-4">
        <div className="flex gap-2 mb-3">
          <Button variant={mode === 'validate' ? 'premium' : 'outline'} size="sm" onClick={() => setMode('validate')}>
            Validiraj
          </Button>
          <Button variant={mode === 'inspect' ? 'premium' : 'outline'} size="sm" onClick={() => setMode('inspect')}>
            Inspect
          </Button>
        </div>
        <input
          className="w-full rounded-xl border border-[var(--border-subtle)] bg-surface-deep px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
          placeholder="QR kod (ručnik unos)"
          value={qr}
          onChange={(e) => setQr(e.target.value)}
        />
        <Button className="mt-3 w-full" variant="premium" disabled={!canScan || !qr || scan.isPending} onClick={() => scan.mutate()}>
          {scan.isPending ? 'Provjera…' : mode === 'validate' ? 'Validiraj ulaz' : 'Pregledaj'}
        </Button>
      </Card>

      {scan.data ? (
        <Card className="border-primary/20 bg-primary/10 p-4">
          <CardTitle className="text-sm">Rezultat</CardTitle>
          <pre className="mt-2 overflow-auto text-xs text-text-muted">{JSON.stringify(scan.data, null, 2)}</pre>
        </Card>
      ) : null}
      {scan.isError ? (
        <Card className="border-danger/20 bg-danger/10 p-4">
          <p className="text-sm text-danger">{(scan.error as Error).message}</p>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Redar — scan 44px touch</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-text-muted">P-DASH-05 · S-relaxed · premium</CardContent>
      </Card>
    </div>
  );
}
