import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['membership-cta'] };

export function MembershipCtaWidget({ config }: Props) {
  const { t } = useTranslation();
  const title = config.title ?? t('home.membership');
  const text = config.text ?? t('home.membershipDesc');
  const btnLabel = config.buttonLabel ?? t('actions.readMore');
  const btnUrl = config.buttonUrl ?? '/clanstvo';

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Card className="bg-primary text-white">
        <CardContent className="flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="mt-2 text-white/80">{text}</p>
          </div>
          <Link to={btnUrl}>
            <Button className="bg-white text-primary hover:bg-white/90">{btnLabel}</Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
