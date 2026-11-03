import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { adminLinkClass } from '../../../lib/admin-styles';

export type HomeKpi = {
  key: string;
  label: string;
  value: string | number;
  href?: string;
  hint?: string;
};

export function HomeKpiGrid({ items }: { items: HomeKpi[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const inner = (
          <Card className="h-full border-[var(--border-subtle)] bg-surface/50 transition-colors hover:border-primary/25 hover:bg-surface/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums text-primary-light">{item.value}</p>
              {item.hint ? <p className="mt-1 text-xs text-text-muted">{item.hint}</p> : null}
              {item.href ? (
                <p className={`mt-3 text-xs ${adminLinkClass}`}>{t('admin.home.open')}</p>
              ) : null}
            </CardContent>
          </Card>
        );
        return item.href ? (
          <Link
            key={item.key}
            to={item.href}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
          >
            {inner}
          </Link>
        ) : (
          <div key={item.key}>{inner}</div>
        );
      })}
    </div>
  );
}
