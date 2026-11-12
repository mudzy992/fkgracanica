import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  // AAA veliki (4.5:1) zahtijeva ≥16px bold za dugmad (Stripe 4.63/PayPal 4.98/Brand 4.62) — FULL AAA strategija aaa_veliki.
  // Na 360 i 1440 percepcija je bila prevelika, zato fluid responzivno: 16px na 360→768, 17px tek na lg (1024+).
  // Visina prati font: h-10 na bazi, h-11 tek na lg, da ne “napuhuje” mobile i ultra-wide.
  'inline-flex items-center justify-center gap-2 rounded-lg text-[16px] font-bold leading-none tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 lg:text-[17px]',
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
        sm: 'h-8 px-3 text-[13px] font-semibold lg:h-9 lg:px-4 lg:text-sm',
        lg: 'h-11 px-6 text-[16px] lg:h-12 lg:px-8 lg:text-lg',
        icon: 'h-10 w-10 lg:h-11 lg:w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);
