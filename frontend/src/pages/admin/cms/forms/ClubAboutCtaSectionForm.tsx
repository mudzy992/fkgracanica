import { useEffect } from 'react';

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function ClubAboutCtaSectionForm({ config, onChange }: Props) {
  useEffect(() => {
    if (Object.keys(config).length > 0) onChange({});
  }, [config, onChange]);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      Ovaj widget je potpuno automatizovan. Sam preuzima slike i tekst iz `O klubu`, `Hall of Fame` i osnovnih
      klupskih podataka, bez ručnog CMS unosa.
    </div>
  );
}
