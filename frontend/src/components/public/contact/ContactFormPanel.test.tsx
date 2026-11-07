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
