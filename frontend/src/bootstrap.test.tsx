import { act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bootstrap, queryClientDefaults, registerServiceWorker } from './bootstrap';

const state = vi.hoisted(() => ({ register: vi.fn() }));

vi.mock('./i18n', () => ({}));
vi.mock('./lib/auth', () => ({ AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('./lib/theme', () => ({ ThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('./App', () => ({ default: () => <p>aplikacija</p> }));

const withServiceWorker = (register: () => Promise<unknown>) => {
  Object.defineProperty(navigator, 'serviceWorker', { value: { register }, configurable: true });
};

beforeEach(() => {
  state.register.mockReset();
  state.register.mockResolvedValue(undefined);
  document.body.innerHTML = '';
  vi.unstubAllEnvs();
});

describe('bootstrap', () => {
  it('montira aplikaciju u zadati kontejner sa podrazumijevanim kešom', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const { queryClient } = await act(async () => bootstrap(container));
    expect(container.textContent).toBe('aplikacija');
    expect(queryClient.getDefaultOptions().queries).toMatchObject(queryClientDefaults.defaultOptions.queries);
  });

  it('bez argumenta koristi #root iz dokumenta', async () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
    await act(async () => bootstrap());
    expect(root.textContent).toBe('aplikacija');
  });
});

describe('registerServiceWorker', () => {
  it('van produkcije ne dodaje listener', () => {
    withServiceWorker(state.register);
    const addEventListener = vi.spyOn(window, 'addEventListener');
    registerServiceWorker();
    expect(addEventListener).not.toHaveBeenCalledWith('load', expect.anything());
    addEventListener.mockRestore();
  });

  it('u produkciji registruje /sw.js na load', async () => {
    vi.stubEnv('PROD', true);
    withServiceWorker(state.register);
    registerServiceWorker();
    await act(async () => {
      window.dispatchEvent(new Event('load'));
    });
    expect(state.register).toHaveBeenCalledWith('/sw.js');
  });

  it('bez podrške za service worker ne dodaje listener', () => {
    vi.stubEnv('PROD', true);
    delete (navigator as unknown as Record<string, unknown>).serviceWorker;
    const addEventListener = vi.spyOn(window, 'addEventListener');
    registerServiceWorker();
    expect(addEventListener).not.toHaveBeenCalledWith('load', expect.anything());
    addEventListener.mockRestore();
  });
});
