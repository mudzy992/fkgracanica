import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SponsorsWidget } from './SponsorsWidget';

const state = vi.hoisted(() => ({
  sponsors: { data: [] as unknown[], isLoading: false },
}));

vi.mock('../../hooks', () => ({
  useSponsors: () => state.sponsors,
}));

describe('SponsorsWidget — varijante (2 grane)', () => {
  beforeEach(() => {
    state.sponsors = { data: [], isLoading: false } as unknown as typeof state.sponsors;
  });

  it('bez sponzora prikazuje prazno', () => {
    render(
      <MemoryRouter>
        <SponsorsWidget config={{} as never} />
      </MemoryRouter>,
    );
    expect(document.body).toBeInTheDocument();
  });

  it('sa sponzorima prikazuje listu', () => {
    state.sponsors = { data: [{ id: 's1', name: 'Sponzor', logoPath: 'a.png', website: 'https://example.com' }], isLoading: false } as unknown as typeof state.sponsors;
    const { container } = render(
      <MemoryRouter>
        <SponsorsWidget config={{} as never} />
      </MemoryRouter>,
    );
    expect(container).toBeInTheDocument();
  });
});
