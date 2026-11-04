import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { hasStaffAccess } from '../../lib/staff-access';
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

function resolveRedirect(pathname: string | undefined, staff: boolean): string {
  if (pathname && !pathname.startsWith('/prijava') && pathname !== '/admin/login') {
    if (staff || !pathname.startsWith('/admin')) return pathname;
  }
  return staff ? '/admin' : '/clanstvo';
}

export function LoginPage() {
  const { t } = useTranslation();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (isLoading) return <Skeleton className="mx-auto mt-24 h-64 max-w-md" />;

  if (isAuthenticated && user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    return <Navigate to={resolveRedirect(from, hasStaffAccess(user.permissions))} replace />;
  }

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const loggedIn = await login(data.email, data.password);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(resolveRedirect(from, hasStaffAccess(loggedIn.permissions)), {
        replace: true,
      });
    } catch {
      setError(t('login.error'));
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface p-4">
      <Seo title={t('login.title')} noindex />
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h1 className="mb-2 text-2xl font-bold text-primary-light">{t('login.title')}</h1>
          <p className="mb-6 text-sm text-text-muted">{t('login.subtitle')}</p>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
            <label className="sr-only" htmlFor="login-email">{t('common.email')}</label>
            <Input id="login-email" type="email" autoComplete="email" placeholder={t('common.email')} {...register('email')} />
            <label className="sr-only" htmlFor="login-password">{t('common.password')}</label>
            <Input id="login-password" type="password" autoComplete="current-password" placeholder={t('common.password')} {...register('password')} />
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {t('nav.login')}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-text-muted">
            <Link to="/" className="text-primary-light hover:underline">
              {t('actions.back')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
