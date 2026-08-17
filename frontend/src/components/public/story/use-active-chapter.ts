import { type RefObject, useEffect, useState } from 'react';

export function useActiveChapter(rootRef: RefObject<HTMLElement | null>, ids: string[]) {
  const idsKey = ids.join('|');
  const [activeId, setActiveId] = useState(ids[0] ?? '');

  useEffect(() => {
    const first = idsKey.split('|')[0];
    if (first && !idsKey.split('|').includes(activeId)) setActiveId(first);
  }, [idsKey, activeId]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !idsKey) return;

    const nodes = root.querySelectorAll<HTMLElement>('[data-chapter-id]');
    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.45)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = best?.target.getAttribute('data-chapter-id');
        if (id) setActiveId(id);
      },
      { threshold: [0.25, 0.45, 0.6] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [rootRef, idsKey]);

  return { activeId, setActiveId };
}
