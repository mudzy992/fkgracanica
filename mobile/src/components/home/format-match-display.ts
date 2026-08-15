export function formatMatchTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatMatchDayLabel(iso: string, locale: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'bs-BA', { weekday: 'short' });
  const date = d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'bs-BA', {
    day: '2-digit',
    month: '2-digit',
  });
  return `${day} · ${date}`;
}
