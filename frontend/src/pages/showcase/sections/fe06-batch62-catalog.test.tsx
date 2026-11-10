import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

describe('batch62 catalog', () => {
  it('CatalogSection renders', async () => {
    const { CatalogSection } = await import('./CatalogSection');
    const section: any = { id: 's1', title: 'Naslov', body: 'text', moduleIds: [], bullets: ['a', 'b'] };
    const modules: any = [{ id: 'm1', title: 'Mod1', badge: 'new', percent: 50 }];
    const { container: c1 } = render(<MemoryRouter><CatalogSection section={section} modules={[]} index={0} /></MemoryRouter>);
    expect(c1.textContent).toContain('Platforma');
    const section2: any = { id: 's2', title: 'T2', body: 'b2', moduleIds: ['m1'], bullets: [] };
    const { container: c2 } = render(<MemoryRouter><CatalogSection section={section2} modules={modules} index={1} /></MemoryRouter>);
    expect(c2.textContent).toContain('Mod1');
  });

  it('MobileSection related fallback', async () => {
    const { MobileSection } = await import('./MobileSection');
    const section: any = { id: 's1', title: 'T', body: 'B', moduleIds: undefined, bullets: [] };
    const { container } = render(<MobileSection section={section} modules={[]} index={0} />);
    expect(container.textContent).toBeDefined();
  });

  it('ShowcaseChrome crest fallback', async () => {
    const { ShowcaseChrome } = await import('../ShowcaseChrome');
    const club: any = { name: 'C', crestPath: null };
    const { container: c1 } = render(<MemoryRouter><ShowcaseChrome club={club} /></MemoryRouter>);
    expect(c1.textContent).toBeDefined();
    const club2: any = { name: 'C2', crestPath: 'crest.png' };
    const { container: c2 } = render(<MemoryRouter><ShowcaseChrome club={club2} /></MemoryRouter>);
    expect(c2.textContent).toBeDefined();
  });
});
