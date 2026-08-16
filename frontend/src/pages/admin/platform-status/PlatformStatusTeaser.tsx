import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../../../components/ui/card';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { usePlatformStatus } from '../../../hooks/use-platform-status';
import { PercentRing } from './PercentRing';

export function PlatformStatusTeaser() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const enabled = hasPermission(user?.permissions, 'dashboard.read');
  const { data } = usePlatformStatus(enabled);

  if (!enabled || !data) return null;

  return (
    <Link
      to="/admin/stanje"
      className="mb-6 block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
    >
      <Card className="transition-colors hover:border-primary/25">
        <CardContent className="flex items-center gap-4 p-4 sm:p-6">
          <PercentRing percent={data.overallPercent} size={72} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text">{t('admin.stanje')}</p>
            <p className="mt-0.5 text-xs text-text-muted">{t('admin.stanjeTeaser')}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
