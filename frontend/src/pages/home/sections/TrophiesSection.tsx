import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTrophies } from '../../../hooks';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';

export function TrophiesSection() {
  const { t } = useTranslation();
  const { data, isLoading } = useTrophies();
  const items = data?.slice(0, 4) ?? [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">{t('home.trophies')}</h2>
        <Link to="/trofeji" className="text-sm text-accent hover:underline">
          {t('actions.viewAll')}
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : items.map((tr) => (
              <Card key={tr.id}>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold text-primary">{tr.year}</p>
                  <p className="font-medium">{tr.name}</p>
                  {tr.competition && <p className="text-sm text-text-muted">{tr.competition}</p>}
                </CardContent>
              </Card>
            ))}
      </div>
    </section>
  );
}
