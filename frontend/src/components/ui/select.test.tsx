import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './select';

describe('Select (FE-01)', () => {
  it('renderuje opcije i poštuje value', () => {
    render(
      <Select aria-label="kategorija" defaultValue="a">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    const el = screen.getByLabelText('kategorija');
    expect(el).toHaveValue('a');
    expect(el).toHaveClass('bg-background', 'border-[var(--border-subtle)]');
  });

  it('poziva onChange pri promjeni', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select aria-label="odabir" onChange={onChange}>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    const el = screen.getByLabelText('odabir');
    await user.selectOptions(el, 'b');
    expect(onChange).toHaveBeenCalled();
  });

  it('spaja custom className i poštuje disabled', () => {
    render(<Select className="w-auto" disabled aria-label="polje" />);
    const el = screen.getByLabelText('polje');
    expect(el).toBeDisabled();
    expect(el).toHaveClass('w-auto');
  });

  it('prosljeđuje ref na DOM element', () => {
    let node: HTMLSelectElement | null = null;
    render(
      <Select
        ref={(el) => {
          node = el;
        }}
        aria-label="ref-test"
      >
        <option value="a">A</option>
      </Select>,
    );
    expect(node).toBeInstanceOf(HTMLSelectElement);
  });
});
