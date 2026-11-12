import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { FormShell } from './forms/FormShell';
import { PlayerCard } from './players/PlayerCard';
import { OnlinePaymentChoice } from '../payments/OnlinePaymentChoice';

describe('OnlinePaymentChoice', () => {
  it('bez provajdera ne renderira ništa', () => {
    const { container } = render(<OnlinePaymentChoice providers={[]} onSelect={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sa jednim provajderom odmah nudi plaćanje', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<OnlinePaymentChoice providers={['stripe']} fullWidth size="sm" onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Plati online' }));
    expect(onSelect).toHaveBeenCalledWith('stripe');
  });

  it('sa više provajdera odabir šalje tačan provajder', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<OnlinePaymentChoice providers={['stripe', 'paypal']} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Plati putem Stripe' }));
    expect(onSelect).toHaveBeenCalledWith('stripe');
    await user.click(screen.getByRole('button', { name: 'Plati putem PayPal' }));
    expect(onSelect).toHaveBeenLastCalledWith('paypal');
  });

  it('sa više provajdera prikazuje izbor za svakog', () => {
    render(<OnlinePaymentChoice providers={['stripe', 'paypal']} loading onSelect={vi.fn()} />);
    const buttons = screen.getAllByRole('button', { name: /Plati putem/ });
    expect(buttons).toHaveLength(2);
    for (const b of buttons) expect(b).toBeDisabled();
  });
});

describe('FormShell', () => {
  it('full raspored prikazuje naslov, opis i sadržaj bez sporedne kolone', () => {
    const { container } = render(
      <FormShell title="Moj račun" description="Detalji" layout="full">
        <p>tijelo</p>
      </FormShell>,
    );
    expect(screen.getByRole('heading', { name: 'Moj račun' })).toBeInTheDocument();
    expect(screen.getByText('Detalji')).toBeInTheDocument();
    expect(screen.getByText('tijelo')).toBeInTheDocument();
    expect(container.querySelectorAll('.lg\\:grid-cols-2')).toHaveLength(0);
  });
});

describe('FormShell — split raspored', () => {
  it('podrazumijevani raspored prikazuje sporednu kolonu uz sadržaj', () => {
    render(
      <FormShell title="Prijava" aside={<p>sporedno</p>}>
        <p>forma</p>
      </FormShell>,
    );
    expect(screen.getByRole('heading', { name: 'Prijava' })).toBeInTheDocument();
    expect(screen.getByText('sporedno')).toBeInTheDocument();
    expect(screen.getByText('forma')).toBeInTheDocument();
  });
});

describe('PlayerCard', () => {
  const player = {
    id: 'p1',
    firstName: 'Amar',
    lastName: 'Hodžić',
    number: 9,
    position: 'FW',
    photoPath: null,
  } as never;

  it('bez linka renderira običan kontejner sa brojem', () => {
    const { container } = render(<PlayerCard player={player} linkable={false} compact />);
    expect(container.querySelector('a')).toBeNull();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText(/Amar Hodžić/)).toBeInTheDocument();
  });

  it('sa linkom vodi na profil igrača', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerCard player={player} />
      </MemoryRouter>,
    );
    expect(container.querySelector('a')?.getAttribute('href')).toContain('p1');
  });
});
