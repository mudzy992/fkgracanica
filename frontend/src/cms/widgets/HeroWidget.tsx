import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { mediaUrl } from '../../lib/media';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['hero'] };

export function HeroWidget({ config }: Props) {
  const bgUrl = mediaUrl(config.backgroundImage, 'medium');
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      {bgUrl && (
        <>
          <img src={bgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden />
          <div className="absolute inset-0 bg-primary/80" />
        </>
      )}
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 md:py-28">
        {config.foundedYear && (
          <p className="text-sm font-medium uppercase tracking-widest text-white/70">{config.foundedYear} —</p>
        )}
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">{config.title}</h1>
        {config.subtitle && <p className="max-w-xl text-lg text-white/80">{config.subtitle}</p>}
        {config.buttons.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {config.buttons.map((btn, i) => (
              <Link key={i} to={btn.url}>
                <Button
                  className={
                    btn.variant === 'outline'
                      ? 'border-white/30 text-white hover:bg-white/10'
                      : 'bg-white text-primary hover:bg-white/90'
                  }
                  variant={btn.variant === 'outline' ? 'outline' : 'default'}
                >
                  {btn.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
