import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMediaSelection } from './use-media-selection';

describe('useMediaSelection', () => {
  it('uključuje i isključuje selekciju pojedinačnih stavki', () => {
    const { result } = renderHook(() => useMediaSelection());
    expect(result.current.selectionMode).toBe(false);
    expect(result.current.selectedCount).toBe(0);
    act(() => result.current.enterSelectionMode());
    act(() => result.current.toggle('a'));
    act(() => result.current.toggle('b'));
    expect(result.current.selectionMode).toBe(true);
    expect(result.current.selectedCount).toBe(2);
    expect(result.current.isSelected('a')).toBe(true);
    act(() => result.current.toggle('a'));
    expect(result.current.isSelected('a')).toBe(false);
    expect(result.current.selectedCount).toBe(1);
  });

  it('bira sve, čisti izbor i izlazi iz režima selekcije', () => {
    const { result } = renderHook(() => useMediaSelection());
    act(() => result.current.enterSelectionMode());
    act(() => result.current.selectAll(['a', 'b', 'c']));
    expect([...result.current.selectedIds]).toEqual(['a', 'b', 'c']);
    act(() => result.current.clear());
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.selectionMode).toBe(true);
    act(() => result.current.toggle('a'));
    act(() => result.current.exitSelectionMode());
    expect(result.current.selectionMode).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it('dozvoljava direktno postavljanje režima bez izmjene izbora', () => {
    const { result } = renderHook(() => useMediaSelection());
    act(() => result.current.toggle('x'));
    act(() => result.current.enterSelectionMode());
    act(() => result.current.setSelectionMode(false));
    expect(result.current.selectionMode).toBe(false);
    expect(result.current.isSelected('x')).toBe(true);
  });
});
