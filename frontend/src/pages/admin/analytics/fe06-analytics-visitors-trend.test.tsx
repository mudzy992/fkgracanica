import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnalyticsVisitorsTrendChart } from './AnalyticsVisitorsTrendChart';

const row = (date: string, web: number, mobile: number) => ({
  date,
  web,
  mobile,
  total: web + mobile,
});

const bar = (container: HTMLElement, title: string) =>
  container.querySelector(`[title="${title}"]`) as HTMLElement | null;

describe('AnalyticsVisitorsTrendChart', () => {
  it('prikazuje legendu za sva tri niza', () => {
    render(<AnalyticsVisitorsTrendChart trend={[row('2026-05-01', 10, 5)]} />);
    expect(screen.getByText('Web')).toBeTruthy();
    expect(screen.getByText('Mobile')).toBeTruthy();
    expect(screen.getByText('Ukupno')).toBeTruthy();
  });

  it('prikazuje po tri trake po danu sa tačnim vrijednostima', () => {
    const { container } = render(
      <AnalyticsVisitorsTrendChart trend={[row('2026-05-01', 10, 5), row('2026-05-02', 20, 0)]} />,
    );
    expect(container.querySelectorAll('[title]')).toHaveLength(6);
    expect(bar(container, 'web: 20')).toBeTruthy();
    expect(bar(container, 'mobile: 0')).toBeTruthy();
    expect(bar(container, 'total: 20')).toBeTruthy();
  });

  it('redoslijed dana je od najnovijeg ka starijem', () => {
    const { container } = render(
      <AnalyticsVisitorsTrendChart trend={[row('2026-05-01', 1, 1), row('2026-05-02', 2, 2)]} />,
    );
    const labels = Array.from(container.querySelectorAll('span')).map((s) => s.textContent);
    expect(labels.indexOf('05-02')).toBeLessThan(labels.indexOf('05-01'));
  });

  it('visina trake je proporcionalna najvećem zbroju, sa minimumom 4%', () => {
    const { container } = render(
      <AnalyticsVisitorsTrendChart trend={[row('2026-05-01', 100, 100), row('2026-05-02', 1, 0)]} />,
    );
    expect(bar(container, 'total: 200')?.style.height).toBe('100%');
    expect(bar(container, 'web: 1')?.style.height).toBe('4%');
    expect(bar(container, 'total: 1')?.style.height).toBe('4%');
  });

  it('nula vrijednosti daje visinu 0%', () => {
    const { container } = render(
      <AnalyticsVisitorsTrendChart trend={[row('2026-05-01', 10, 0), row('2026-05-02', 0, 0)]} />,
    );
    expect(bar(container, 'web: 0')?.style.height).toBe('0%');
    expect(bar(container, 'total: 0')?.style.height).toBe('0%');
  });

  it('prazna lista trenda ne pada i nema traka', () => {
    const { container } = render(<AnalyticsVisitorsTrendChart trend={[]} />);
    expect(container.querySelectorAll('[title]')).toHaveLength(0);
    expect(screen.getByText('Web')).toBeTruthy();
  });
});
