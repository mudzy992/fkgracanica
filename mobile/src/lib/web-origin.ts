const DEFAULT_WEB = 'https://fkgracanica.ba101.top';

export function webOrigin(): string {
  const fromEnv = process.env.EXPO_PUBLIC_WEB_URL?.replace(/\/$/, '');
  return fromEnv || DEFAULT_WEB;
}

export function newsArticleUrl(slug: string): string {
  return `${webOrigin()}/vijesti/${slug}`;
}
