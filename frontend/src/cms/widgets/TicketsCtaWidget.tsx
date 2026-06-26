import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Reveal } from '../../lib/motion/Reveal';
import { Button } from '../../components/ui/button';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['tickets-cta'] };

export function TicketsCtaWidget({ config }: Props) {
  const { t } = useTranslation();
  const title = config.title ?? t('home.tickets');
  const text = config.text ?? t('home.ticketsDesc');
  const btnLabel = config.buttonLabel ?? t('home.tickets');
  const btnUrl = config.buttonUrl ?? '/ulaznice';

  return (
    <section className="bg-surface/80 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="glass-card flex flex-col items-start gap-6 rounded-2xl border border-slate-200/80 p-8 shadow-premium sm:p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text sm:text-3xl">{title}</h2>
              <p className="mt-2 max-w-lg text-text-muted">{text}</p>
            </div>
            <Link to={btnUrl}>
              <Button size="lg">{btnLabel}</Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
