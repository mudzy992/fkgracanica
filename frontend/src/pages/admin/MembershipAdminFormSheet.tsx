import { useState } from 'react';
import { useCreateMembershipAdmin } from '../../hooks/use-membership';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MembershipAdminFormSheet({ open, onOpenChange }: Props) {
  const create = useCreateMembershipAdmin();
  const [email, setEmail] = useState('');
  const [activate, setActivate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEmail('');
    setActivate(false);
    setError(null);
  };

  const onSubmit = async () => {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Unesite email korisnika.');
      return;
    }
    try {
      await create.mutateAsync({ email: trimmed, activate });
      reset();
      onOpenChange(false);
    } catch {
      setError('Dodavanje nije uspjelo. Provjerite email i postojeće članstvo.');
    }
  };

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
      title="Novi član"
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-text-muted">Email korisnika</label>
          <Input
            type="email"
            placeholder="korisnik@email.ba"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mt-1 text-xs text-text-muted">Korisnik mora imati registrirani račun.</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={activate}
            onChange={(e) => setActivate(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border-subtle)]"
          />
          Aktiviraj odmah (nakon uplate na blagajni)
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button className="w-full" disabled={create.isPending} onClick={() => void onSubmit()}>
          {create.isPending ? 'Dodavanje...' : 'Dodaj člana'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
