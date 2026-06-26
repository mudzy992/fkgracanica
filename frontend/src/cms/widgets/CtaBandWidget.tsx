import { Link } from 'react-router-dom';
import { Reveal } from '../../lib/motion/Reveal';
import { Button } from '../../components/ui/button';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['cta-band'] };

export function CtaBandWidget({ config }: Props) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <Reveal>
        <div className="glass-card relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-accent p-8 text-white shadow-premium sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              {config.title && <h2 className="font-display text-2xl font-bold sm:text-3xl">{config.title}</h2>}
              {config.text && <p className="mt-2 max-w-lg text-white/85">{config.text}</p>}
            </div>
            {config.buttons.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {config.buttons.map((btn, i) => (
                  <Link key={i} to={btn.url}>
                    <Button
                      className={
                        btn.variant === 'outline'
                          ? 'border-white/40 text-white hover:bg-white/15'
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
        </div>
      </Reveal>
    </section>
  );
}
