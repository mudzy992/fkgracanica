import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CtaBandWidget } from './CtaBandWidget';
import { CustomHtmlWidget } from './CustomHtmlWidget';
import { LastResultWidget } from './LastResultWidget';
import { NextMatchWidget } from './NextMatchWidget';
import { RichTextWidget } from './RichTextWidget';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('deprecated widgeti', () => {
  it('next-match i last-result ne renderuju ništa', () => {
    const first = wrap(<NextMatchWidget config={{ title: 'x' } as never} />);
    expect(first.container).toBeEmptyDOMElement();
    first.unmount();
    const second = wrap(<LastResultWidget config={{ title: 'x' } as never} />);
    expect(second.container).toBeEmptyDOMElement();
  });
});

describe('CustomHtmlWidget', () => {
  it('bez HTML-a ne renderuje ništa', () => {
    const { container } = wrap(<CustomHtmlWidget config={{ html: '   ' } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderuje proslijeđeni HTML kroz RichContent', () => {
    wrap(<CustomHtmlWidget config={{ html: '<p>Građanski tekst</p>' } as never} />);
    expect(screen.getByText('Građanski tekst')).toBeInTheDocument();
  });
});

describe('RichTextWidget', () => {
  it('bez HTML-a ne renderuje ništa', () => {
    const { container } = wrap(<RichTextWidget config={{ html: '' } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderuje tekst sa PremiumCard ljuskom', () => {
    const { container } = wrap(<RichTextWidget config={{ html: '<h2>O klubu</h2>' } as never} />);
    expect(screen.getByRole('heading', { name: 'O klubu' })).toBeInTheDocument();
    expect(container.querySelector('.rich-content')).not.toBeNull();
  });
});

describe('CtaBandWidget', () => {
  it('prikazuje naslov, tekst i dvije vrste dugmadi', () => {
    wrap(
      <CtaBandWidget
        config={{
          title: 'Pridruži se klubu',
          text: 'Postani član',
          buttons: [
            { label: 'Članstvo', url: '/clanstvo' },
            { label: 'Kontakt', url: '/kontakt', variant: 'outline' },
          ],
        } as never}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Pridruži se klubu' })).toBeInTheDocument();
    expect(screen.getByText('Postani član')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Članstvo/ })).toHaveAttribute('href', '/clanstvo');
    expect(screen.getByRole('link', { name: /Kontakt/ })).toHaveAttribute('href', '/kontakt');
  });

  it('bez naslova, teksta i dugmadi prikazuje prazan okvir', () => {
    wrap(<CtaBandWidget config={{ buttons: [] } as never} />);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
