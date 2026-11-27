'use client';

import { useAuth } from '../../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function ProfilPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Moj profil</h1>
        <p className="mt-1 text-sm text-text-muted">Član 0 · bez dozvola · javni CTA /clanstvo ostaje na Next-u</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Korisnik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-text-muted">Email: </span>
            {user?.email ?? '—'}
          </p>
          <p>
            <span className="text-text-muted">Ime: </span>
            {(user?.firstName ?? '') + ' ' + (user?.lastName ?? '') || '—'}
          </p>
          <p className="text-xs text-text-muted">Dozvole: {user?.permissions?.length ? user.permissions.join(', ') : '0 (Član)'}</p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => (window.location.href = '/clanstvo')}>
              Članstvo
            </Button>
            <Button variant="outline" size="sm" onClick={() => (window.location.href = '/ulaznice')}>
              Ulaznice
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="p-4">
        <p className="text-xs text-text-muted">
          Član nema admin dozvola — koristi javne rute `/clanstvo` i `/ulaznice` (P-NEXT-02e) za rezervaciju. Admin `scan` je za Redar
          1, `live` za Komentatora 2, `mediji/vijesti` za Writer/Moderator.
        </p>
      </Card>
    </div>
  );
}
