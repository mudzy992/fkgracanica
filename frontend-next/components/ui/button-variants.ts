import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-[15px] font-semibold leading-none tracking-[-0.01em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white shadow-[var(--shadow-premium)] hover:bg-primary-light hover:text-background',
        premium:
          'bg-brand text-white shadow-[var(--shadow-premium)] hover:brightness-110 border border-white/10',
        outline:
          'border border-[var(--border-subtle)] bg-background hover:bg-surface text-text',
        ghost: 'hover:bg-surface text-text',
        danger: 'bg-danger text-white hover:opacity-90 shadow-sm',
      },
      size: {
        default: 'h-11 px-6 py-2.5 text-[15px]',
        sm: 'h-8 px-3 text-[13px] rounded-lg',
        lg: 'h-12 px-8 text-base rounded-xl',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);
