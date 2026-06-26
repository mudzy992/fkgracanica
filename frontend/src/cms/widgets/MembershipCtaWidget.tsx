import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Reveal } from '../../lib/motion/Reveal';
import { Button } from '../../components/ui/button';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['membership-cta'] };

export function MembershipCtaWidget({ config }: Props) {
  const { t } = useTranslation();
  const title = config.title ?? t('home.membership');
  const text = config.text ?? t('home.membershipDesc');
  const btnLabel = config.buttonLabel ?? t('actions.readMore');
  const btnUrl = config.buttonUrl ?? '/clanstvo';

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <Reveal>
        <div className="glass-card relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-accent p-8 text-white shadow-premium sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
              <p className="mt-2 max-w-lg text-white/85">{text}</p>
            </div>
            <Link to={btnUrl}>
              <Button className="bg-white text-primary shadow-lg hover:bg-white/90">{btnLabel}</Button>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
