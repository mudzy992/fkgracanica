jest.mock('@prisma/client', () => {
  const makeSentinel = (): unknown => {
    const target: Record<string, unknown> = {};
    return new Proxy(target, {
      get: (t, prop) => {
        if (prop === 'PrismaClient') return class PrismaClientMock {};
        if (prop === 'then' || prop === 'toJSON') return undefined;
        if (prop === 'toString') return () => '[prisma-mock]';
        if (prop === Symbol.toPrimitive) return () => '[prisma-mock]';
        if (typeof prop === 'symbol') return Reflect.get(t, prop) as unknown;
        if (!(prop in t)) t[prop] = makeSentinel();
        return t[prop];
      },
      has: () => true,
    });
  };
  return makeSentinel();
});
import { NotFoundException } from '@nestjs/common';
import { GALLERY, makePrisma, service } from './gallery-service.mock';

/**
 * BE-09b/P-B09b-1 + P-B09b-9: `PATCH /gallery/:id` više ne propušta
 * `status`/`slug`/`createdAt` (prije: `gallery.manage` je mogao objaviti
 * galeriju bez `gallery.approve`), a nepostojeći ID-evi daju 404 umjesto
 * Prisma P2025 (500).
 */
describe('GalleryService — allowlist i 404 (BE-09b)', () => {
  it('ignoriše status/slug/createdAt iz payloada (ne zaobilazi gallery.approve)', async () => {
    const prisma = makePrisma();
    prisma.gallery.findUnique.mockResolvedValue(GALLERY);
    prisma.gallery.update.mockResolvedValue(GALLERY);
    await service(prisma).update('g1', {
      description: 'Novi opis',
      status: 'PUBLISHED',
      slug: 'hakovan-slug',
      createdAt: new Date('2000-01-01'),
    } as unknown as { description?: string });

    const calls = prisma.gallery.update.mock.calls as [
      [{ where: { id: string }; data: Record<string, unknown> }],
    ];
    expect(calls[0][0].data).toEqual({ description: 'Novi opis' });
  });

  it('promjena naslova regeneriše slug, ali ne dira status', async () => {
    const prisma = makePrisma();
    prisma.gallery.findUnique.mockImplementation(
      async (args: { where: { id?: string; slug?: string } }) =>
        args.where.id ? GALLERY : null,
    );
    prisma.gallery.update.mockResolvedValue(GALLERY);

    await service(prisma).update('g1', { title: 'Kup utakmica' });

    const calls = prisma.gallery.update.mock.calls as [
      [{ data: Record<string, unknown> }],
    ];
    expect(calls[0][0].data).toEqual({
      title: 'Kup utakmica',
      slug: 'kup-utakmica',
    });
    expect(calls[0][0].data.status).toBeUndefined();
  });

  it('update bez ijednog dozvoljenog polja ne piše u bazu', async () => {
    const prisma = makePrisma();
    prisma.gallery.findUnique.mockResolvedValue(GALLERY);

    await service(prisma).update('g1', { status: 'PUBLISHED' } as unknown as {
      title?: string;
    });

    expect(prisma.gallery.update).not.toHaveBeenCalled();
  });

  it('update nepostojeće galerije → 404', async () => {
    const prisma = makePrisma();
    prisma.gallery.findUnique.mockResolvedValue(null);

    await expect(
      service(prisma).update('nema', { title: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateStatus nepostojeće galerije → 404 (prije 500)', async () => {
    const prisma = makePrisma();
    prisma.gallery.findUnique.mockResolvedValue(null);

    await expect(
      service(prisma).updateStatus('nema', 'PUBLISHED'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.gallery.update).not.toHaveBeenCalled();
  });

  it('remove nepostojeće galerije → 404 (prije 500)', async () => {
    const prisma = makePrisma();
    prisma.gallery.findUnique.mockResolvedValue(null);

    await expect(service(prisma).remove('nema')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('addPhoto na nepostojeću galeriju → 404 (prije P2003 → 500)', async () => {
    const prisma = makePrisma();
    prisma.gallery.findUnique.mockResolvedValue(null);

    await expect(
      service(prisma).addPhoto('nema', { path: 'originals/a.jpg' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.galleryPhoto.create).not.toHaveBeenCalled();
  });

  it('removePhoto odbija fotografiju iz DRUGE galerije', async () => {
    const prisma = makePrisma();
    prisma.galleryPhoto.findUnique.mockResolvedValue({
      id: 'p1',
      galleryId: 'g2',
    });

    await expect(
      service(prisma).removePhoto('g1', 'p1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.galleryPhoto.delete).not.toHaveBeenCalled();
  });

  it('removePhoto briše fotografiju koja pripada galeriji', async () => {
    const prisma = makePrisma();
    prisma.galleryPhoto.findUnique.mockResolvedValue({
      id: 'p1',
      galleryId: 'g1',
    });
    prisma.galleryPhoto.delete.mockResolvedValue({ id: 'p1' });

    await service(prisma).removePhoto('g1', 'p1');

    expect(prisma.galleryPhoto.delete).toHaveBeenCalledWith({
      where: { id: 'p1' },
    });
  });

  it('reorderPhotos ostaje scoped na galeriju', async () => {
    const prisma = makePrisma();
    prisma.galleryPhoto.update.mockResolvedValue({});

    await service(prisma).reorderPhotos('g1', ['p2', 'p1']);

    const calls = prisma.galleryPhoto.update.mock.calls as [
      [
        {
          where: { id: string; galleryId: string };
          data: { sortOrder: number };
        },
      ],
    ];
    expect(calls.map((c) => c[0].where)).toEqual([
      { id: 'p2', galleryId: 'g1' },
      { id: 'p1', galleryId: 'g1' },
    ]);
  });
});
