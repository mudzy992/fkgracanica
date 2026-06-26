import { Link } from 'react-router-dom';
import { Reveal } from '../../lib/motion/Reveal';
import { Button } from '../../components/ui/button';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['cta-band'] };

export function CtaBandWidget({ config }: Props) {
  return (
    <section className="bg-surface/80 py-12 md:py-16">
      <Reveal className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          {config.title && <h2 className="text-2xl font-bold text-text sm:text-3xl">{config.title}</h2>}
          {config.text && <p className="mt-2 max-w-xl text-text-muted">{config.text}</p>}
        </div>
        {config.buttons.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {config.buttons.map((btn, i) => (
              <Link key={i} to={btn.url}>
                <Button variant={btn.variant === 'outline' ? 'outline' : 'default'}>{btn.label}</Button>
              </Link>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}
