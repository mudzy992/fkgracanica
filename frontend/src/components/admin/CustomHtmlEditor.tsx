import { useRef } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const TAG_ACTIONS = [
  { label: 'H2', open: '<h2>', close: '</h2>' },
  { label: 'H3', open: '<h3>', close: '</h3>' },
  { label: 'P', open: '<p>', close: '</p>' },
  { label: 'Bold', open: '<strong>', close: '</strong>' },
  { label: 'Italic', open: '<em>', close: '</em>' },
  { label: 'Link', open: '<a href="">', close: '</a>' },
  { label: 'UL', open: '<ul><li>', close: '</li></ul>' },
  { label: 'BR', open: '<br />', close: '' },
  { label: 'Div', open: '<div>', close: '</div>' },
] as const;

function applyTag(text: string, start: number, end: number, open: string, close: string) {
  const selected = text.slice(start, end);
  const inner = selected || 'tekst';
  const wrapped = `${open}${inner}${close}`;
  return {
    next: text.slice(0, start) + wrapped + text.slice(end),
    cursor: start + open.length + inner.length,
  };
}

interface Props {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

export function CustomHtmlEditor({ value, onChange, className }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const insert = (open: string, close: string) => {
    const el = ref.current!;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const { next, cursor } = applyTag(value, start, end, open, close);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className={cn('rounded-lg border border-[var(--border-subtle)]', className)}>
      <div className="flex flex-wrap gap-1 border-b border-[var(--border-subtle)] p-2">
        {TAG_ACTIONS.map((tag) => (
          <Button
            key={tag.label}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => insert(tag.open, tag.close)}
          >
            {tag.label}
          </Button>
        ))}
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        spellCheck={false}
        className="w-full resize-y bg-background p-3 font-mono text-xs leading-relaxed"
        placeholder="<div>...</div>"
      />
    </div>
  );
}
