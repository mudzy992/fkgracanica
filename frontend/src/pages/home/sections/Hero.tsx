import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/button';
import { useCmsBlock } from '../../../hooks';
import type { HomeHeroContent } from '../../../types';

export function Hero() {
  const { t } = useTranslation();
  const { data: block } = useCmsBlock('home.hero');
  const hero = (block?.content ?? {}) as HomeHeroContent;

  const title = hero.title ?? t('home.heroTitle');
  const subtitle = hero.subtitle ?? t('home.heroSubtitle');
  const foundedYear = hero.foundedYear ?? '1920';
  const primaryPath = hero.primaryCtaPath ?? '/liga';
  const secondaryPath = hero.secondaryCtaPath ?? '/vijesti';

  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 md:py-28">
        <p className="text-sm font-medium uppercase tracking-widest text-white/70">{foundedYear} —</p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>
        <p className="max-w-xl text-lg text-white/80">{subtitle}</p>
        <div className="flex flex-wrap gap-3">
          <Link to={primaryPath}>
            <Button className="bg-white text-primary hover:bg-white/90">{t('home.nextMatch')}</Button>
          </Link>
          <Link to={secondaryPath}>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              {t('nav.news')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
