import { useEffect } from 'react';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
}

export function Seo({ title, description, image }: SeoProps) {
  useEffect(() => {
    const base = 'FK Gračanica';
    document.title = title ? `${title} | ${base}` : base;
    const setMeta = (name: string, content?: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('description', description);
    if (image) setMeta('og:image', image);
  }, [title, description, image]);
  return null;
}
