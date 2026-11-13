import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  // Kompaktan UI + WCAG 2.2 AA globalno (kontrast ≥4.5:1, target ≥24×24), AAA za primarne gdje gustoća dozvoljava.
  // Primarne akcije & mobilni inputi (<md): text-[16px] h-10 (40px+) — sprečava iOS auto-zoom, AAA large-text prag (≥4.5:1) i 40px+ ergonomija.
  // Sekundarne/kompaktne & desktop tabele/paneli (FormationInputs/SlotPanel/BenchDropRow): size sm → text-[14px] h-8 (32px≥24 AA).
  // Fokus: ring-2 + ring-offset osigurava vidljiv fokus za tastaturu (WCAG 2.4.7).
  'inline-flex items-center justify-center gap-2 rounded-lg text-[16px] font-bold leading-none tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-light hover:text-background',
        outline: 'border border-[var(--border-subtle)] bg-background hover:bg-surface text-text',
        ghost: 'hover:bg-surface text-text',
        danger: 'bg-danger text-white hover:opacity-90',
      },
      size: {
        default: 'h-10 px-5 lg:h-11 lg:px-6',
        sm: 'h-8 px-3 text-[14px] font-semibold',
        lg: 'h-11 px-6 text-[16px] lg:h-12 lg:px-8 lg:text-lg',
        icon: 'h-10 w-10 md:h-8 md:w-8 lg:h-11 lg:w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);
