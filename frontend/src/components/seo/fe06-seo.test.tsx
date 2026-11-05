import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Seo } from './Seo';

const state = vi.hoisted(() => ({
  settings: undefined as Record<string, string> | undefined,
  applied: [] as Record<string, unknown>[],
}));

vi.mock('../../hooks', () => ({ usePublicSettings: () => ({ data: state.settings }) }));
vi.mock('./seo-document', () => ({
  applySeoToDocument: (input: Record<string, unknown>) => {
    state.applied.push(input);
  },
}));

const renderSeo = (props: Parameters<typeof Seo>[0], url = '/vijesti/derbi') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Seo {...props} />
    </MemoryRouter>,
  );

const lastApplied = () => state.applied[state.applied.length - 1];

describe('Seo', () => {
  beforeEach(() => {
    state.settings = undefined;
    state.applied = [];
  });

  it('koristi fallback naziv i opis kluba kada podešavanja nisu učitana', () => {
    renderSeo({ title: 'Derbi' });
    expect(lastApplied()).toMatchObject({
      title: 'Derbi',
      siteName: 'FK Gračanica',
      defaultDescription: 'Službena web stranica FK Gračanica — vijesti, utakmice, članstvo i ulaznice.',
      url: '/vijesti/derbi',
      robotsIndex: true,
      jsonLd: undefined,
    });
  });

  it('preuzima naziv, opis, sliku i twitter ručku iz podešavanja', () => {
    state.settings = {
      'club.name': 'FK Gračanica',
      'seo.description': 'Zvanični sajt',
      'club.crestUrl': 'crest.png',
      'seo.twitterHandle': '@fkgracanica',
    };
    renderSeo({ title: 'Vijest' });
    expect(lastApplied()).toMatchObject({
      siteName: 'FK Gračanica',
      defaultDescription: 'Zvanični sajt',
      twitterHandle: '@fkgracanica',
      defaultImage: expect.stringContaining('crest'),
    });
  });

  it('na naslovnici gradi SportsOrganization JSON-LD', () => {
    renderSeo({}, '/');
    const jsonLd = lastApplied().jsonLd as Record<string, unknown>;
    expect(jsonLd['@type']).toBe('SportsOrganization');
    expect(jsonLd.url).toMatch(/\/$/);
  });

  it('za članak gradi Article JSON-LD bez query stringa i sa čistim opisom', () => {
    renderSeo(
      {
        title: 'Pobjeda u derbiju',
        description: '<p>Sjajan <strong>meč</strong></p>',
        type: 'article',
        image: 'https://cdn/x.jpg',
        publishedAt: '2026-10-01T10:00:00.000Z',
      },
      '/vijesti/derbi?utm=1',
    );
    const jsonLd = lastApplied().jsonLd as Record<string, unknown>;
    expect(jsonLd).toMatchObject({
      '@type': 'Article',
      headline: 'Pobjeda u derbiju',
      description: 'Sjajan meč',
      image: 'https://cdn/x.jpg',
      datePublished: '2026-10-01T10:00:00.000Z',
    });
    expect(String(jsonLd.url)).not.toContain('utm=1');
  });

  it('article bez naslova ne gradi JSON-LD', () => {
    renderSeo({ type: 'article' });
    expect(lastApplied().jsonLd).toBeUndefined();
  });

  it('noindex gasi indeksiranje bez obzira na podešavanja', () => {
    state.settings = { 'seo.robotsIndex': 'true' };
    renderSeo({ noindex: true });
    expect(lastApplied().robotsIndex).toBe(false);
  });

  it('podešavanje robotsIndex=false gasi indeksiranje', () => {
    state.settings = { 'seo.robotsIndex': 'false' };
    renderSeo({ title: 'Stranica' });
    expect(lastApplied().robotsIndex).toBe(false);
  });

  it('eksplicitni url ima prednost nad rutom', () => {
    renderSeo({ url: 'https://fkgracanica.ba/p/staticna' }, '/p/staticna');
    expect(lastApplied().url).toBe('https://fkgracanica.ba/p/staticna');
  });

  it('ne renderuje ništa u DOM', () => {
    const { container } = renderSeo({ title: 'X' });
    expect(container.textContent).toBe('');
  });
});
