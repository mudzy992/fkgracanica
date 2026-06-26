import { useEffect } from 'react';
import { mediaUrl } from '../lib/media';

export function useDynamicFavicon(crestPath?: string) {
  useEffect(() => {
    if (!crestPath) return;
    const href = mediaUrl(crestPath, 'thumb');
    if (!href) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
    link.type = 'image/png';
  }, [crestPath]);
}
