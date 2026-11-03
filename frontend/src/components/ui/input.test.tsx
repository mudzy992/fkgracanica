import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input (FE-02)', () => {
  it('prihvata unos i prosljeđuje ref', async () => {
    const user = userEvent.setup();
    let node: HTMLInputElement | null = null;
    render(
      <Input
        placeholder="Email"
        ref={(el) => {
          node = el;
        }}
      />,
    );
    const el = screen.getByPlaceholderText('Email');
    await user.type(el, 'admin@fkgracanica.ba');
    expect(el).toHaveValue('admin@fkgracanica.ba');
    expect(node).toBe(el);
  });

  it('spaja custom className i poštuje disabled', () => {
    render(<Input className="mt-2" disabled aria-label="polje" />);
    const el = screen.getByLabelText('polje');
    expect(el).toBeDisabled();
    expect(el).toHaveClass('mt-2', 'h-10');
  });
});
