import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button (FE-02)', () => {
  it('renderuje labelu i podrazumijevanu varijantu', () => {
    render(<Button>Sačuvaj</Button>);
    const el = screen.getByRole('button', { name: 'Sačuvaj' });
    expect(el).toHaveClass('bg-primary', 'hover:text-background');
    expect(el).toBeEnabled();
  });

  it('primjenjuje varijantu i spaja custom klase', () => {
    render(
      <Button variant="danger" size="sm" className="w-full">
        Obriši
      </Button>,
    );
    const el = screen.getByRole('button', { name: 'Obriši' });
    // Kompakt WCAG 2.2 AA: sm je fiksno h-8 (32≥24) text-[14px] (AA normal 4.5)
    expect(el).toHaveClass('bg-danger', 'h-8', 'w-full', 'text-[14px]');
    expect(el).not.toHaveClass('bg-primary');
  });

  it('poziva onClick i može biti onemogućen', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Pošalji</Button>);
    await user.click(screen.getByRole('button', { name: 'Pošalji' }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button onClick={onClick} disabled>
        Pošalji
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Pošalji' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('prosljeđuje ref na DOM element', () => {
    let node: HTMLButtonElement | null = null;
    render(
      <Button
        ref={(el) => {
          node = el;
        }}
      >
        Ref
      </Button>,
    );
    expect(node).toBeInstanceOf(HTMLButtonElement);
  });
});
