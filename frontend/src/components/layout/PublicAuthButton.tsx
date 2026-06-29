import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { Button } from '../ui/button';
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
      <Link to="/prijava" onClick={onNavigate}>
        <Button size={mobile ? 'default' : 'sm'} className={mobile ? 'w-full' : ''}>
          {t('nav.login')}
        </Button>
      </Link>
    );
  }

  return <PublicUserMenu onNavigate={onNavigate} mobile={mobile} />;
}
