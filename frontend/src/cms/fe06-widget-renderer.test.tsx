import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WidgetRenderer } from './WidgetRenderer';

const state = vi.hoisted(() => ({
  calls: [] as Array<Record<string, unknown>>,
}));

vi.mock('./widgets/registry', () => ({
  widgetRegistry: {
    hero: (props: { config: Record<string, unknown> }) => {
      state.calls.push(props.config);
      return <div>hero:{String(props.config.title)}</div>;
    },
    'last-result': (props: { config: Record<string, unknown> }) => {
      state.calls.push(props.config);
      return <div>zadnji</div>;
    },
  },
}));

const section = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  widgetType: 'hero',
  enabled: true,
  config: { title: 'Naslov' },
  ...over,
});

beforeEach(() => {
  state.calls = [];
});

describe('WidgetRenderer', () => {
  it('renderuje komponentu iz registra uz config sekcije', () => {
    render(<WidgetRenderer section={section() as never} />);
    expect(screen.getByText('hero:Naslov')).toBeInTheDocument();
    expect(state.calls).toEqual([{ title: 'Naslov' }]);
  });

  it('ne renderuje ništa za onemogućenu sekciju', () => {
    const { container } = render(
      <WidgetRenderer section={section({ enabled: false }) as never} />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(state.calls).toEqual([]);
  });

  it('ne renderuje ništa za nepoznat tip widgeta', () => {
    const { container } = render(
      <WidgetRenderer section={section({ widgetType: 'nepoznato' }) as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderuje deprecated tipove iz registra', () => {
    render(<WidgetRenderer section={section({ widgetType: 'last-result' }) as never} />);
    expect(screen.getByText('zadnji')).toBeInTheDocument();
  });
});
