import { useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { slugify } from '../../lib/slug';

interface Props {
  title: string;
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
}

export function SlugField({ title, value, onChange, disabled }: Props) {
  const manual = useRef(false);

  useEffect(() => {
    if (manual.current || disabled) return;
    onChange(slugify(title));
  }, [title, onChange, disabled]);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Slug</label>
      <Input
        value={value}
        disabled={disabled}
        onChange={(e) => {
          manual.current = true;
          onChange(e.target.value);
        }}
        placeholder="url-slug"
      />
    </div>
  );
}
