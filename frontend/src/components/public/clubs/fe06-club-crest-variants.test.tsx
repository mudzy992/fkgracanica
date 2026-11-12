import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ClubCrest } from './ClubCrest';

describe('ClubCrest — varijante (2 grane)', () => {
  it('size lg koristi medium, bez imena koristi fallback', () => {
    const { container } = render(<ClubCrest club={{ name: '', crestPath: 'crest.png', logoPath: null } as never} size="lg" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toContain('crest.png');
    expect(img.getAttribute('alt')).toBe('');
  });

  it('bez grba koristi initials fallback, bez kluba koristi FK', () => {
    const { container } = render(<ClubCrest club={null} size="sm" />);
    expect(container.textContent).toContain('FK');
  });

  it('sa imenom prikazuje initials', () => {
    const { container } = render(<ClubCrest club={{ name: 'FK Gračanica', crestPath: null, logoPath: null } as never} size="md" />);
    expect(container.textContent).toContain('FK');
  });
});
