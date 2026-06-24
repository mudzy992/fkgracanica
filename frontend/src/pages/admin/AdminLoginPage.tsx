import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../lib/auth';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export function AdminLoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (isLoading) return <Skeleton className="mx-auto mt-24 h-64 max-w-md" />;
  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await login(data.email, data.password);
    } catch {
      setError('Neispravni podaci za prijavu');
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface p-4">
      <Seo title="Admin prijava" />
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h1 className="mb-6 text-2xl font-bold text-primary">FK Admin</h1>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
            <Input type="email" placeholder="Email" {...register('email')} />
            <Input type="password" placeholder="Lozinka" {...register('password')} />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Prijava
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
