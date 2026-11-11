import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SectionVisual } from './SectionVisual';

describe('SectionVisual — direktno pokrivanje svih grana', () => {
  it('pokriva svih 5 poznatih id-eva', () => {
    const ids = ['identity', 'competition', 'membership-tickets', 'content', 'admin'] as const;
    for (const id of ids) {
      const { container } = render(<SectionVisual id={id} />);
      expect(container.innerHTML).not.toBe('');
    }
  });

  it('pokriva unknown -> null (linija 14)', () => {
    const { container } = render(<SectionVisual id="unknown" />);
    expect(container.innerHTML).toBe('');
  });
});
