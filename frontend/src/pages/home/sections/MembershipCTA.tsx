import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';

export function MembershipCTA() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Card className="bg-primary text-white">
        <CardContent className="flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t('home.membership')}</h2>
            <p className="mt-2 text-white/80">{t('home.membershipDesc')}</p>
          </div>
          <Link to="/kontakt">
            <Button className="bg-white text-primary hover:bg-white/90">{t('actions.readMore')}</Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
