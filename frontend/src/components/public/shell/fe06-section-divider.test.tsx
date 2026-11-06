import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionDivider } from './SectionDivider';

describe('SectionDivider', () => {
  it('renderuje dekorativnu liniju skrivenu od čitača ekrana', () => {
    const { container } = render(<SectionDivider />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('aria-hidden');
    expect(root.className).toContain('max-w-6xl');
    expect(root.firstElementChild?.className).toContain('h-px');
  });
});
