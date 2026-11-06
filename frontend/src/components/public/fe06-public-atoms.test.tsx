import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from './EmptyState';
import { PageContainer } from './PageContainer';
import { PublicPill } from './PublicPill';

describe('EmptyState', () => {
  it('prikazuje poruku i podrazumijevane klase', () => {
    const { container } = render(<EmptyState message="Nema podataka." />);
    const p = container.querySelector('p') as HTMLParagraphElement;
    expect(p.textContent).toBe('Nema podataka.');
    expect(p.className).toContain('py-16');
    expect(p.className).toContain('text-center');
  });

  it('dodaje proslijeđene klase', () => {
    const { container } = render(<EmptyState message="x" className="text-white" />);
    expect(container.querySelector('p')?.className).toContain('text-white');
  });
});

describe('PageContainer', () => {
  it('podrazumijevano koristi širinu lg', () => {
    const { container } = render(
      <PageContainer>
        <span>sadržaj</span>
      </PageContainer>,
    );
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('max-w-6xl');
    expect(div.className).toContain('mx-auto');
    expect(screen.getByText('sadržaj')).toBeTruthy();
  });

  it('size md mijenja širinu i dodaje klase', () => {
    const { container } = render(
      <PageContainer size="md" className="py-4">
        <p>x</p>
      </PageContainer>,
    );
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('max-w-4xl');
    expect(div.className).toContain('py-4');
  });
});

describe('PublicPill', () => {
  it('aktivan pill ima primarne klase i aria nije postavljen', () => {
    const { container } = render(
      <PublicPill active onClick={() => {}}>
        Kola
      </PublicPill>,
    );
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.className).toContain('bg-primary');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.textContent).toBe('Kola');
  });

  it('neaktivan pill koristi staklene klase', () => {
    const { container } = render(
      <PublicPill active={false} onClick={() => {}}>
        Tabela
      </PublicPill>,
    );
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.className).toContain('glass-premium');
    expect(button.className).not.toContain('bg-primary');
  });

  it('klik zove onClick', async () => {
    const onClick = vi.fn();
    render(
      <PublicPill active={false} onClick={onClick}>
        Klik
      </PublicPill>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Klik' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
