import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  // Kompaktan UI + WCAG 2.2 AA globalno (kontrast ≥4.5:1, target ≥24×24), AAA za primarne gdje gustoća dozvoljava.
  // B-UI01 responsive (2026-11-13): 360 i 1440 su preveliki sa fiksnim 16px/h-11 — AAA veliki (4.5:1) ostaje na md/lg (768-1280),
  // a na ekstremima je kompaktno: 360 → 15px/h-9, 1440 (xl) → 15px/h-10. iOS auto-zoom za inpute i dalje 16px (input.tsx), button smije 15px.
  // Sekundarne/kompaktne & desktop tabele/paneli (FormationInputs/SlotPanel/BenchDropRow): size sm → text-[14px] h-8 (32px≥24 AA), xl kompaktnije h-7.
  // Fokus: ring-2 + ring-offset osigurava vidljiv fokus za tastaturu (WCAG 2.4.7).
  'inline-flex items-center justify-center gap-2 rounded-lg text-[15px] sm:text-[16px] lg:text-[16px] xl:text-[15px] font-bold leading-none tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-light hover:text-background',
        outline: 'border border-[var(--border-subtle)] bg-background hover:bg-surface text-text',
        ghost: 'hover:bg-surface text-text',
        danger: 'bg-danger text-white hover:opacity-90',
      },
      size: {
        default: 'h-9 px-4 sm:h-10 sm:px-5 lg:h-11 lg:px-6 xl:h-10 xl:px-5',
        sm: 'h-8 px-3 text-[14px] font-semibold xl:h-7 xl:px-2.5 xl:text-[13px]',
        lg: 'h-10 px-5 text-[15px] sm:h-11 sm:px-6 sm:text-[16px] lg:h-12 lg:px-8 lg:text-lg xl:h-11 xl:px-6 xl:text-[16px]',
        icon: 'h-9 w-9 sm:h-10 sm:w-10 md:h-8 md:w-8 lg:h-11 lg:w-11 xl:h-10 xl:w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);
