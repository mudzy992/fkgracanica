import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { buttonVariants } from '../ui/button-variants';
import { cn } from '../../lib/utils';
import { PublicUserMenu } from './PublicUserMenu';

interface Props {
  onNavigate?: () => void;
  mobile?: boolean;
}

export function PublicAuthButton({ onNavigate, mobile }: Props) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <Link
        to="/prijava"
        onClick={onNavigate}
        className={cn(buttonVariants({ size: mobile ? 'default' : 'sm' }), mobile && 'w-full')}
      >
        {t('nav.login')}
      </Link>
    );
  }

  return <PublicUserMenu onNavigate={onNavigate} mobile={mobile} />;
}
