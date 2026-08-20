import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../../lib/utils';
import { RichContent } from '../RichContent';

interface Props {
  html: string;
  className?: string;
}

export function ExpandableRichContent({ html, className }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(html.length > 300);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    setOverflows(el.scrollHeight > el.clientHeight + 1 || html.length > 300);
  }, [html, expanded]);

  const showToggle = expanded || overflows;

  return (
    <div>
      <div ref={ref} className={cn(!expanded && 'line-clamp-5', className)}>
        <RichContent html={html} className="[&_p]:text-inherit" />
      </div>
      {showToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-sm font-semibold text-primary-light transition hover:text-white"
        >
          {expanded ? 'Prikaži manje' : 'Pročitaj više'}
        </button>
      ) : null}
    </div>
  );
}
