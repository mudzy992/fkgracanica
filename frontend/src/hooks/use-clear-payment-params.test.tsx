import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useClearPaymentParams } from './use-clear-payment-params';

function Harness({ done }: { done: boolean }) {
  useClearPaymentParams(done);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  return <>
    <output data-testid="url">{pathname}{search}</output>
    <button type="button" onClick={() => navigate('/ulaznice?paid=1&session_id=second&provider=stripe&view=second')}>Second</button>
  </>;
}

describe('payment return URL cleanup', () => {
  it('čuva parametre dok nije gotovo; uklanja payment polja i čuva ostala i za drugu sesiju', async () => {
    const user = userEvent.setup();
    const initial = '/ulaznice?paid=1&session_id=first&provider=monri&token=x&PayerID=x&digest=x&response_code=1&order_number=x&view=orders';
    const view = render(<MemoryRouter initialEntries={[initial]}><Harness done={false} /></MemoryRouter>);
    expect(screen.getByTestId('url')).toHaveTextContent(initial);
    view.rerender(<MemoryRouter initialEntries={[initial]}><Harness done /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('/ulaznice?view=orders'));
    await user.click(screen.getByRole('button', { name: 'Second' }));
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('/ulaznice?view=second'));
  });
});
