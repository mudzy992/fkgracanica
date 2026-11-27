'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

function PrijavaInner() {
  const { login } = useAuth();
  const router = useRouter();
  const [next, setNext] = useState('/admin');
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('next');
    if (p) setNext(p);
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Greška');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background grid place-items-center p-4">
      <Card className="w-full max-w-md glass-premium">
        <CardHeader>
          <CardTitle className="font-display text-h1">Prijava</CardTitle>
          <CardDescription>FK Gračanica — admin pristup (httpOnly cookie via middleware)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-text-muted">Email</label>
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] bg-surface-deep px-3 py-2.5 text-sm text-text outline-none focus:ring-2 focus:ring-accent"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm text-text-muted">Lozinka</label>
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] bg-surface-deep px-3 py-2.5 text-sm text-text outline-none focus:ring-2 focus:ring-accent"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {err ? (
              <p role="alert" className="text-sm text-danger">
                {err}
              </p>
            ) : null}
            <Button type="submit" variant="premium" size="default" className="w-full" disabled={loading}>
              {loading ? 'Prijava…' : 'Prijavi se'}
            </Button>
          </form>
          <p className="mt-4 text-xs text-text-muted">
            P-DASH-01 · httpOnly `fk_access_token` + middleware `/admin/*`
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function PrijavaPage() {
  return (
    <AuthProvider>
      <PrijavaInner />
    </AuthProvider>
  );
}
