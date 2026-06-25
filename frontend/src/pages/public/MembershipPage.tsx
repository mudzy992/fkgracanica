import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRegisterMembership } from '../../hooks';
import { useAuth } from '../../lib/auth';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

export function MembershipPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const register = useRegisterMembership();
  const [done, setDone] = useState(false);

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-64 max-w-xl" />;

  const onRegister = async () => {
    await register.mutateAsync();
    setDone(true);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Seo title="Članstvo" description="Postanite član FK Gračanica" />
      <h1 className="mb-8 text-3xl font-bold">Članstvo</h1>
      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="text-text-muted">
            Pridružite se klubu i podržite FK Gračanica kao registrirani član.
          </p>
          {!isAuthenticated ? (
            <div className="space-y-3">
              <p className="text-sm text-text-muted">Za prijavu članstva potrebna je prijava na račun.</p>
              <Link to="/admin/login" state={{ from: location }}>
                <Button className="w-full">Prijavite se</Button>
              </Link>
            </div>
          ) : done ? (
            <p className="text-success">Zahtjev za članstvo je uspješno poslan.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">
                Prijavljeni ste kao <strong>{user?.email}</strong>
              </p>
              <Button className="w-full" disabled={register.isPending} onClick={() => void onRegister()}>
                {register.isPending ? 'Slanje...' : 'Prijavi se za članstvo'}
              </Button>
              {register.isError && (
                <p className="text-sm text-danger">Registracija nije uspjela. Možda već imate aktivno članstvo.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
