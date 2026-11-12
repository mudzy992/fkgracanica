import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useActiveChapter } from './use-active-chapter';

class FakeObserver {
  static instances: FakeObserver[] = [];
  callback: (entries: { isIntersecting: boolean; intersectionRatio: number; target: Element }[]) => void;
  observed: Element[] = [];
  disconnected = false;
  constructor(callback: FakeObserver['callback']) {
    this.callback = callback;
    FakeObserver.instances.push(this);
  }
  observe(element: Element) {
    this.observed.push(element);
  }
  disconnect() {
    this.disconnected = true;
  }
}

function makeRoot(ids: string[]) {
  const root = document.createElement('div');
  ids.forEach((id) => {
    const node = document.createElement('section');
    node.setAttribute('data-chapter-id', id);
    root.appendChild(node);
  });
  document.body.appendChild(root);
  return { root, ref: { current: root } };
}

const entry = (target: Element, ratio: number, isIntersecting = true) => ({
  target,
  isIntersecting,
  intersectionRatio: ratio,
});

describe('useActiveChapter', () => {
  beforeEach(() => {
    FakeObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('na početku je aktivno prvo poglavlje', () => {
    const { ref } = makeRoot(['a', 'b']);
    const { result } = renderHook(() => useActiveChapter(ref, ['a', 'b']));
    expect(result.current.activeId).toBe('a');
  });

  it('posmatra svako poglavlje i odvaja observer pri demontaži', () => {
    const { ref } = makeRoot(['a', 'b']);
    const { unmount } = renderHook(() => useActiveChapter(ref, ['a', 'b']));
    const observer = FakeObserver.instances[0];
    expect(observer.observed).toHaveLength(2);
    unmount();
    expect(observer.disconnected).toBe(true);
  });

  it('bira poglavlje sa najvećim udjelom vidljivosti iznad praga', () => {
    const { root, ref } = makeRoot(['a', 'b', 'c']);
    const { result } = renderHook(() => useActiveChapter(ref, ['a', 'b', 'c']));
    const [a, b, c] = Array.from(root.children);
    act(() => {
      FakeObserver.instances[0].callback([
        entry(a, 0.5),
        entry(b, 0.8),
        entry(c, 0.2),
      ]);
    });
    expect(result.current.activeId).toBe('b');
  });

  it('zanemaruje elemente ispod praga i one koji nisu vidljivi', () => {
    const { root, ref } = makeRoot(['a', 'b']);
    const { result } = renderHook(() => useActiveChapter(ref, ['a', 'b']));
    const [a, b] = Array.from(root.children);
    act(() => {
      FakeObserver.instances[0].callback([entry(a, 0.3), entry(b, 0.9, false)]);
    });
    expect(result.current.activeId).toBe('a');
  });

  it('zadržava aktivno poglavlje dok postoji, inače se vraća na prvo', () => {
    const { ref } = makeRoot(['a', 'b']);
    const { result, rerender } = renderHook(
      ({ ids }) => useActiveChapter(ref, ids),
      { initialProps: { ids: ['a', 'b'] } },
    );
    act(() => result.current.setActiveId('b'));
    expect(result.current.activeId).toBe('b');
    rerender({ ids: ['x', 'b'] });
    expect(result.current.activeId).toBe('b');
    rerender({ ids: ['x', 'c'] });
    expect(result.current.activeId).toBe('x');
  });

  it('bez korijena ili bez poglavlja ne pravi observer', () => {
    const { result } = renderHook(() => useActiveChapter({ current: null }, ['a']));
    expect(result.current.activeId).toBe('a');
    renderHook(() => useActiveChapter({ current: document.createElement('div') }, []));
    expect(FakeObserver.instances).toHaveLength(0);
  });
});
