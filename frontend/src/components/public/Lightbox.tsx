import { useEffect } from 'react';
import { Button } from '../ui/button';

interface LightboxProps {
  images: { src: string; alt?: string }[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
}

export function Lightbox({ images, index, onClose, onChange }: LightboxProps) {
  const current = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onChange(index - 1);
      if (e.key === 'ArrowRight' && hasNext) onChange(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, hasPrev, hasNext, onClose, onChange]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <Button
        variant="ghost"
        className="absolute right-4 top-4 text-white hover:bg-white/10"
        onClick={onClose}
      >
        Zatvori
      </Button>
      {hasPrev && (
        <Button
          variant="ghost"
          className="absolute left-4 text-white hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            onChange(index - 1);
          }}
        >
          ‹
        </Button>
      )}
      <img
        src={current.src}
        alt={current.alt ?? ''}
        className="max-h-[90vh] max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      {hasNext && (
        <Button
          variant="ghost"
          className="absolute right-16 text-white hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            onChange(index + 1);
          }}
        >
          ›
        </Button>
      )}
    </div>
  );
}
