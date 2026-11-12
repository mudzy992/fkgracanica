import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n';
import { LiveYouTubePlayer } from './LiveYouTubePlayer';
import { LivePrematchAudio } from './LivePrematchAudio';

const unsafe = 'https://youtube.com.example.invalid/watch?v=abc123XYZ01';

describe('neispravni stari live YouTube linkovi', () => {
  it('za prijenos objašnjava problem bez playera', () => {
    const { container } = render(<LiveYouTubePlayer url={unsafe} />);
    expect(screen.getByRole('status')).toHaveTextContent('Provjerite YouTube link');
    expect(container.querySelector('iframe')).toBeNull();
  });
  it('skriveni player tokom poluvremena ne prikazuje ni upozorenje', () => {
    render(<LiveYouTubePlayer url={unsafe} hidden />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
  it('ne pokazuje upozorenje za praznu opcionalnu muziku', () => {
    render(<LivePrematchAudio url="" active={false} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
  it('za postavljenu neispravnu muziku objašnjava problem', () => {
    const { container } = render(<LivePrematchAudio url={unsafe} active />);
    expect(screen.getByRole('status')).toHaveTextContent('Provjerite YouTube link');
    expect(container.querySelector('iframe')).toBeNull();
  });
});

describe('ispravni YouTube linkovi', () => {
  const good = 'https://www.youtube.com/watch?v=abc123XYZ01';

  it('prijenos sa ispravnim linkom renderira player bez upozorenja', () => {
    const { container } = render(<LiveYouTubePlayer url={good} />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(container.querySelector('[aria-hidden="false"]')).not.toBeNull();
  });

  it('aktivna muzika sa ispravnim linkom renderira skriveni kontejner', () => {
    const { container } = render(<LivePrematchAudio url={good} active />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(container.querySelector('.fixed')).not.toBeNull();
  });
});
