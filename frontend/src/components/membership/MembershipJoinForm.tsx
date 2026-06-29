import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useJoinMembershipOnline } from '../../hooks/use-membership-join';
import { useAuth } from '../../lib/auth';
import { getApiErrorMessage } from '../../lib/api-error';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const schema = z.object({
  email: z.string().email('Unesite ispravan email'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 znakova'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  annualPrice: number;
  onJoined: (membershipId: string) => void | Promise<void>;
}

export function MembershipJoinForm({ annualPrice, onJoined }: Props) {
  const join = useJoinMembershipOnline();
  const { applySession } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const res = await join.mutateAsync(data);
    applySession(res.user, res.accessToken, res.refreshToken);
    await onJoined(res.membership.id);
  };

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
      <p className="text-sm text-text-muted">
        Godišnja članarina: <strong>{annualPrice} KM</strong> — nakon registracije preusmjeravamo na
        sigurnu online uplatu.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Input placeholder="Ime" {...register('firstName')} />
        </div>
        <div>
          <Input placeholder="Prezime" {...register('lastName')} />
        </div>
      </div>
      <div>
        <Input type="email" placeholder="Email" {...register('email')} />
        {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
      </div>
      <div>
        <Input type="password" placeholder="Lozinka (min. 6 znakova)" {...register('password')} />
        {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
      </div>
      <p className="text-xs text-text-muted">
        Već imate račun?{' '}
        <Link to="/prijava" className="text-primary underline">
          Prijavite se
        </Link>
      </p>
      {join.isError && (
        <p className="text-sm text-danger">
          {getApiErrorMessage(join.error, 'Registracija nije uspjela.')}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={join.isPending}>
        {join.isPending ? 'Obrada...' : `Nastavi na plaćanje · ${annualPrice} KM`}
      </Button>
    </form>
  );
}
