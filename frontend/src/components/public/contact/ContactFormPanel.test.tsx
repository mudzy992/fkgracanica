import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
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
