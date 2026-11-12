import { describe, expect, it } from 'vitest';
import { widgetRegistry } from './registry';
import { widgetMeta, widgetSchemas } from './schemas';

describe('widgetRegistry', () => {
  it('svaki tip widgeta iz šeme ima komponentu u registru', () => {
    for (const type of Object.keys(widgetSchemas)) {
      if (type === 'footer-about') continue;
      expect(widgetRegistry[type as keyof typeof widgetRegistry], type).toBeTruthy();
    }
  });

  it('registar sadrži samo poznate tipove widgeta', () => {
    for (const type of Object.keys(widgetRegistry)) {
      expect(Object.keys(widgetMeta)).toContain(type);
    }
  });

  it('deprecated tipovi su mapirani na komponente koje vraćaju null', () => {
    expect(widgetRegistry['next-match']).toBeTypeOf('function');
    expect(widgetRegistry['last-result']).toBeTypeOf('function');
  });

  it('više tipova dijeli istu komponentu (članstvo, ulaznice, newsletter)', () => {
    expect(widgetRegistry['membership-cta']).toBe(widgetRegistry['tickets-cta']);
    expect(widgetRegistry['tickets-cta']).toBe(widgetRegistry['newsletter']);
    expect(widgetRegistry['club-about-cta']).not.toBe(widgetRegistry['cta-band']);
  });
});
