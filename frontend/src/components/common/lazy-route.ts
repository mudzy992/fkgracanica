import { lazy, type ComponentType } from 'react';

/** React.lazy kešira odbijeni import; oporavak zahtijeva novo učitavanje dokumenta. */
export class RouteLoadError extends Error {
  constructor(cause: unknown) {
    super('Route module could not be loaded', { cause });
    this.name = 'RouteLoadError';
  }
}

export function lazyRoute(load: () => Promise<{ default: ComponentType }>) {
  return lazy(() => load().catch((cause: unknown) => { throw new RouteLoadError(cause); }));
}
