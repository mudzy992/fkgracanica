import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';

export function TicketsCTA() {
  const { t } = useTranslation();
  return (
    <section className="bg-surface py-12">
      <div className="mx-auto max-w-6xl px-4">
        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text">{t('home.tickets')}</h2>
              <p className="mt-2 text-text-muted">{t('home.ticketsDesc')}</p>
            </div>
            <Button>{t('home.tickets')}</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
