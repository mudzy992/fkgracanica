import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Lightbox } from './Lightbox';
import { PhotoGridWithLightbox } from './PhotoGridWithLightbox';
import { PremiumPhotoBento } from './PremiumPhotoBento';

const images = [
  { src: 'https://cdn/a.jpg', alt: 'Prva' },
  { src: 'https://cdn/b.jpg', alt: 'Druga' },
  { src: 'https://cdn/c.jpg' },
];

describe('Lightbox', () => {
  it('bez trenutne slike ne renderuje ništa', () => {
    const { container } = render(
      <Lightbox images={[]} index={0} onClose={() => {}} onChange={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('prikazuje dijalog sa trenutnom slikom i dugmetom Zatvori', () => {
    render(<Lightbox images={images} index={1} onClose={() => {}} onChange={() => {}} />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByAltText('Druga').getAttribute('src')).toBe('https://cdn/b.jpg');
    expect(screen.getByRole('button', { name: 'Zatvori' })).toBeTruthy();
  });

  it('na prvoj slici nema „prethodna“, na zadnjoj nema „sljedeća“', () => {
    const { rerender } = render(
      <Lightbox images={images} index={0} onClose={() => {}} onChange={() => {}} />,
    );
    expect(screen.queryByRole('button', { name: '‹' })).toBeNull();
    expect(screen.getByRole('button', { name: '›' })).toBeTruthy();
    rerender(<Lightbox images={images} index={2} onClose={() => {}} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: '‹' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '›' })).toBeNull();
  });

  it('strelice mijenjaju indeks i ne zatvaraju dijalog', async () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(<Lightbox images={images} index={0} onClose={onClose} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '›' }));
    expect(onChange).toHaveBeenCalledWith(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('klik na pozadinu zatvara, klik na sliku ne', async () => {
    const onClose = vi.fn();
    render(<Lightbox images={images} index={0} onClose={onClose} onChange={() => {}} />);
    await userEvent.click(screen.getByAltText('Prva'));
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape zatvara, strelice mijenjaju sliku', async () => {
    const onClose = vi.fn();
    const onChange = vi.fn();
    render(<Lightbox images={images} index={1} onClose={onClose} onChange={onChange} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenCalledWith(0);
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('strelice ne rade na granicama niza', async () => {
    const onChange = vi.fn();
    render(<Lightbox images={images} index={0} onClose={() => {}} onChange={onChange} />);
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('slika bez alt teksta dobija prazan alt', () => {
    render(<Lightbox images={images} index={2} onClose={() => {}} onChange={() => {}} />);
    expect(screen.getByRole('dialog').querySelector('img')?.getAttribute('alt')).toBe('');
  });
});

const photos = [
  { id: 'p1', path: 'originals/galerija/slika1.jpg', caption: 'Prva slika' },
  { id: 'p2', path: 'originals/galerija/slika2.jpg', caption: null },
];

describe('PhotoGridWithLightbox', () => {
  it('prikazuje sve fotografije i potpise', () => {
    const { container } = render(<PhotoGridWithLightbox photos={photos} />);
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(2);
    expect(imgs[0].getAttribute('src')).toContain('medium/galerija/slika1.webp');
    expect(screen.getByText('Prva slika')).toBeTruthy();
    expect(screen.getByText('Prva slika').tagName).toBe('FIGCAPTION');
  });

  it('bez potpisa nema figcaptiona', () => {
    const { container } = render(<PhotoGridWithLightbox photos={[photos[1]]} />);
    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('columns three mijenja grid klase', () => {
    const { container } = render(<PhotoGridWithLightbox photos={photos} columns="three" />);
    expect(container.querySelector('.grid')?.className).toContain('md:grid-cols-3');
  });

  it('klik na sličicu otvara lightbox, zatvaranje ga uklanja', async () => {
    const { container } = render(<PhotoGridWithLightbox photos={photos} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(container.querySelectorAll('button')[1]);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(
      screen.getByRole('dialog').querySelector('img')?.getAttribute('src'),
    ).toContain('originals/galerija/slika2.jpg');
    await userEvent.click(screen.getByRole('button', { name: 'Zatvori' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('prazna lista prikazuje prazan grid bez slika', () => {
    const { container } = render(<PhotoGridWithLightbox photos={[]} />);
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});

describe('PremiumPhotoBento', () => {
  it('prikazuje dugmad sa pristupačnim imenom iz potpisa', () => {
    render(<PremiumPhotoBento photos={photos} />);
    expect(screen.getByRole('button', { name: 'Otvori: Prva slika' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Otvori fotografiju' })).toBeTruthy();
  });

  it('ciklično dodjeljuje span klase', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({
      id: `p${i}`,
      path: `originals/g/${i}.jpg`,
      caption: null,
    }));
    const { container } = render(<PremiumPhotoBento photos={many} />);
    const buttons = Array.from(container.querySelectorAll('button'));
    expect(buttons[0].className).toContain('col-span-2');
    expect(buttons[1].className).toContain('col-span-1');
    expect(buttons[6].className).toContain('col-span-2');
  });

  it('potpis se prikazuje kao natpis, slika koristi alt iz potpisa', () => {
    const { container } = render(<PremiumPhotoBento photos={photos} />);
    expect(screen.getByText('Prva slika')).toBeTruthy();
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('Prva slika');
  });

  it('klik otvara lightbox sa originalnim izvorom', async () => {
    render(<PremiumPhotoBento photos={photos} />);
    await userEvent.click(screen.getByRole('button', { name: 'Otvori fotografiju' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(
      screen.getByRole('dialog').querySelector('img')?.getAttribute('src'),
    ).toContain('originals/galerija/slika2.jpg');
  });

  it('Escape zatvara lightbox', async () => {
    render(<PremiumPhotoBento photos={photos} />);
    await userEvent.click(screen.getByRole('button', { name: 'Otvori: Prva slika' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('klik na strelice mijenja indeks i ne zatvara dijalog', async () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(<Lightbox images={images} index={1} onClose={onClose} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '‹' }));
    expect(onChange).toHaveBeenCalledWith(0);
    await userEvent.click(screen.getByRole('button', { name: '›' }));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(onClose).not.toHaveBeenCalled();
  });
});
