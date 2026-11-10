import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({ usePublicSettings: () => ({ data: { 'club.name': 'FKG', 'seo.title': 'Test', 'seo.description': 'desc', 'club.crestUrl': '', 'seo.robotsIndex': 'true', 'seo.twitterHandle': '@test' } }) }));

describe('batch61 seo2 48 [1,0]', () => {
  it('Seo url vs fallback', async () => {
    const { Seo } = await import('./Seo');
    const qc = new QueryClient();
    const wrap = (ui: any, path = '/test?p=1') => <QueryClientProvider client={qc}><MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter></QueryClientProvider>;
    const { container: c1 } = render(wrap(<Seo title="T" url="/custom?q=1" />));
    expect(c1.textContent).toBe('');
    const { container: c2 } = render(wrap(<Seo title="T2" />, '/fallback'));
    expect(c2.textContent).toBe('');
  });
});
