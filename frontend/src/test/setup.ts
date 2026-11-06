import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom ne implementira matchMedia — koriste ga framer-motion i responsive hookovi.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

// jsdom ne implementira IntersectionObserver — koristi ga framer-motion `whileInView`.
// Stub odmah javi „nije u vidnom polju“; animacije nisu predmet unit testova.
if (!('IntersectionObserver' in window)) {
  class IntersectionObserverStub {
    readonly root = null;
    readonly rootMargin = '0px';
    readonly thresholds: readonly number[] = [0];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  (window as unknown as Record<string, unknown>).IntersectionObserver = IntersectionObserverStub;
}

// jsdom ne implementira getClientRects na Range-u — ProseMirror ga zove pri
// `scrollIntoView` nakon fokusiranja selekcije. Prazan spisak je dovoljan.
if (typeof Range !== 'undefined') {
  const emptyRectList = () => {
    const list = [] as unknown as DOMRectList;
    return Object.assign(list, { item: () => null });
  };
  if (!Range.prototype.getClientRects) {
    Range.prototype.getClientRects = emptyRectList;
  }
  if (!Range.prototype.getBoundingClientRect) {
    Range.prototype.getBoundingClientRect = () => new DOMRect();
  }
}

afterEach(() => cleanup());
