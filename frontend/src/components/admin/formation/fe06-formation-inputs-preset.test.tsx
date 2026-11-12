import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormationInputs } from './FormationInputs';

describe('FormationInputs — preset AAA profesjonalni refaktor', () => {
  const props = (over: Record<string, unknown> = {}) => ({
    def: '4',
    mid: '3',
    fwd: '3',
    onDef: vi.fn(),
    onMid: vi.fn(),
    onFwd: vi.fn(),
    onApply: vi.fn(),
    applying: false,
    ...over,
  });

  it('preset 4-3-3 je odabran kada def/mid/fwd odgovaraju', () => {
    render(<FormationInputs {...props({ def: '4', mid: '3', fwd: '3' })} />);
    const sel = screen.getByLabelText('Odaberi formaciju') as HTMLSelectElement;
    expect(sel.value).toBe('4-3-3');
    expect(screen.getByText('Prilagođeno')).toBeTruthy();
  });

  it('prilagođeno kada kombinacija nije preset', () => {
    render(<FormationInputs {...props({ def: '2', mid: '3', fwd: '5' })} />);
    const sel = screen.getByLabelText('Odaberi formaciju') as HTMLSelectElement;
    expect(sel.value).toBe('');
  });

  it('odabir preseta zove onDef/onMid/onFwd', async () => {
    const p = props();
    const user = userEvent.setup();
    render(<FormationInputs {...p} />);
    const sel = screen.getByLabelText('Odaberi formaciju');
    await user.selectOptions(sel, '4-4-2');
    expect(p.onDef).toHaveBeenCalledWith('4');
    expect(p.onMid).toHaveBeenCalledWith('4');
    expect(p.onFwd).toHaveBeenCalledWith('2');
  });

  it('odabir Prilagođeno ne zove settere', async () => {
    const p = props({ def: '4', mid: '4', fwd: '2' });
    const user = userEvent.setup();
    render(<FormationInputs {...p} />);
    const sel = screen.getByLabelText('Odaberi formaciju');
    // sel je trenutno 4-4-2, promijeni na Prilagođeno (prazno)
    await user.selectOptions(sel, '');
    expect(p.onDef).not.toHaveBeenCalled();
  });

  it('Card wrapper i AAA klase su prisutne', () => {
    const { container } = render(<FormationInputs {...props()} />);
    // Card ima rounded-xl border bg-surface
    expect(container.innerHTML).toContain('bg-surface');
    expect(container.innerHTML).toContain('Preset');
  });
});
