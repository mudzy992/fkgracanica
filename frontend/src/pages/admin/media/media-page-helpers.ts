import { mediaUrl } from '../../../lib/media';

export function emptyMediaMessage(globalSearch: boolean, debouncedSearch: string) {
  if (globalSearch) return `Nema rezultata za „${debouncedSearch}".`;
  return 'Nema medija u ovoj mapi.';
}

export function copyMediaOriginalUrl(
  path: string,
  setCopied: (path: string | null) => void,
) {
  void navigator.clipboard.writeText(mediaUrl(path, 'original') ?? path).then(() => {
    setCopied(path);
    setTimeout(() => setCopied(null), 2000);
  });
}
