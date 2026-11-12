import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormationPlayerPool } from './FormationPlayerPool';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('@dnd-kit/core', () => ({
  useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, isDragging: false }),
}));
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Translate: { toString: () => '' } } }));

describe('FormationPlayerPool — branch44 (2 grane)', () => {
  it('prazan niz prikazuje poruku', () => {
    render(<FormationPlayerPool players={[]} />);
    expect(screen.getByText('admin.formation.allAssigned')).toBeInTheDocument();
  });

  it('igrač bez broja ne prikazuje broj', () => {
    render(
      <FormationPlayerPool
        players={[{ id: 'p1', firstName: 'Amar', lastName: 'Hodžić' } as never]}
      />,
    );
    expect(screen.getByText('Amar Hodžić')).toBeInTheDocument();
    expect(screen.queryByText(/1 Amar/)).not.toBeInTheDocument();
  });

  it('igrač sa brojem prikazuje broj', () => {
    render(
      <FormationPlayerPool
        players={[{ id: 'p1', firstName: 'Amar', lastName: 'Hodžić', number: 9 } as never]}
      />,
    );
    expect(screen.getByText(/9 Amar Hodžić/)).toBeInTheDocument();
  });
});
