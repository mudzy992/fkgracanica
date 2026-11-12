import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-[17px] font-bold leading-none tracking-[-0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-light hover:text-background',
        outline: 'border border-[var(--border-subtle)] bg-background hover:bg-surface text-text',
        ghost: 'hover:bg-surface text-text',
        danger: 'bg-danger text-white hover:opacity-90',
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4 text-sm font-semibold',
        lg: 'h-12 px-8 text-lg font-bold',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);
