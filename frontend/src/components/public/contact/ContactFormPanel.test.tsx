import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ContactFormPanel } from './ContactFormPanel';

vi.mock('../../../lib/motion/Reveal', () => ({
  Reveal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe('ContactFormPanel accessibility', () => {
  it('povezuje sva četiri vidljiva naziva i klik na labelu fokusira polje', async () => {
    const user = userEvent.setup();
    render(<ContactFormPanel sent={false} pending={false} onSubmit={async () => undefined} />);
    for (const label of ['Ime', 'Email', /Naslov/, 'Poruka']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    await user.click(screen.getByText('Ime', { selector: 'label' }));
    expect(screen.getByLabelText('Ime')).toHaveFocus();
  });
});

describe('ContactFormPanel — slanje', () => {
  it('submit forme zove onSubmit sa unesenim podacima', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (_payload: unknown) => undefined);
    const { container } = render(
      <ContactFormPanel sent={false} pending={false} onSubmit={onSubmit} />,
    );
    await user.type(screen.getByLabelText('Ime'), 'Amar');
    await user.type(screen.getByLabelText('Email'), 'amar@fk.ba');
    await user.type(screen.getByLabelText('Poruka'), 'Pozdrav iz Gračanice');
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      name: 'Amar',
      email: 'amar@fk.ba',
      message: 'Pozdrav iz Gračanice',
    });
  });
});

describe('ContactFormPanel — stanja i validacija (batch 34)', () => {
  it('poslana poruka zamjenjuje formu potvrdom', () => {
    render(<ContactFormPanel sent pending={false} onSubmit={async () => undefined} />);
    expect(screen.getByText('Poruka je uspješno poslana')).toBeInTheDocument();
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.queryByLabelText('Ime')).toBeNull();
  });

  it('dok traje slanje dugme je onemogućeno i mijenja tekst', () => {
    render(<ContactFormPanel sent={false} pending onSubmit={async () => undefined} />);
    const submit = screen.getByRole('button', { name: 'Šaljem…' });
    expect(submit).toBeDisabled();
    expect(screen.queryByText('Pošalji poruku')).toBeNull();
  });

  it('prazna forma prikazuje poruke validacije i ne šalje ništa', async () => {
    const onSubmit = vi.fn(async () => undefined);
    const { container } = render(
      <ContactFormPanel sent={false} pending={false} onSubmit={onSubmit} />,
    );
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(screen.getByText('Unesite ime (min. 2 znaka)')).toBeInTheDocument());
    expect(screen.getByText('Unesite ispravan email')).toBeInTheDocument();
    expect(screen.getByText('Poruka mora imati najmanje 10 znakova')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('kratka poruka i dalje prikazuje grešku za dužinu', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => undefined);
    const { container } = render(
      <ContactFormPanel sent={false} pending={false} onSubmit={onSubmit} />,
    );
    await user.type(screen.getByLabelText('Ime'), 'Amar');
    await user.type(screen.getByLabelText('Email'), 'amar@fk.ba');
    await user.type(screen.getByLabelText('Poruka'), 'kratko');
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() =>
      expect(screen.getByText('Poruka mora imati najmanje 10 znakova')).toBeInTheDocument(),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('defaultValues popunjavaju polja', () => {
    render(
      <ContactFormPanel
        sent={false}
        pending={false}
        defaultValues={{ name: 'Amar', email: 'amar@fk.ba', subject: 'Upit', message: 'Dugačka poruka' }}
        onSubmit={async () => undefined}
      />,
    );
    expect(screen.getByLabelText('Ime')).toHaveValue('Amar');
    expect(screen.getByLabelText(/Naslov/)).toHaveValue('Upit');
  });
});

