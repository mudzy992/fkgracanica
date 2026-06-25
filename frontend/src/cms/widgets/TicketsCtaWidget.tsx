import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['tickets-cta'] };

export function TicketsCtaWidget({ config }: Props) {
  const { t } = useTranslation();
  const title = config.title ?? t('home.tickets');
  const text = config.text ?? t('home.ticketsDesc');
  const btnLabel = config.buttonLabel ?? t('home.tickets');
  const btnUrl = config.buttonUrl ?? '/ulaznice';

  return (
    <section className="bg-surface py-12">
      <div className="mx-auto max-w-6xl px-4">
        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text">{title}</h2>
              <p className="mt-2 text-text-muted">{text}</p>
            </div>
            <Link to={btnUrl}>
              <Button>{btnLabel}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
