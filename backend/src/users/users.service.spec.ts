import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EXISTING, setup } from './users-service.mock';

describe('UsersService.update (BE-09 / P-B09-2, P-B09-8)', () => {
  it('409 kad je novi email zauzet (prije: 500)', async () => {
    const { prisma, svc } = setup();
    prisma.user.findUnique.mockResolvedValue({ id: 'u2' });
    await expect(
      svc.update('actor', 'u1', { email: 'zauzet@fk.ba' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('propušta nepromijenjen email bez provjere konflikta', async () => {
    const { prisma, svc } = setup();
    prisma.user.update.mockResolvedValue(EXISTING);
    await svc.update('actor', 'u1', { email: 'stari@fk.ba' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('400 kad roleIds sadrži nepoznatu ulogu', async () => {
    const { prisma, svc } = setup();
    prisma.role.findMany.mockResolvedValue([{ id: 'r1' }]);
    await expect(
      svc.update('actor', 'u1', { roleIds: ['r1', 'nepostojeca'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('mijenja role i korisnika unutar jedne transakcije', async () => {
    const { prisma, audit, svc } = setup();
    prisma.role.findMany.mockResolvedValue([{ id: 'r2' }]);
    prisma.user.update.mockResolvedValue(EXISTING);

    await svc.update('actor', 'u1', { firstName: 'Novo', roleIds: ['r2'] });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.userRole.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
    });
    expect(prisma.userRole.createMany).toHaveBeenCalledWith({
      data: [{ userId: 'u1', roleId: 'r2' }],
    });
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'u1' } }),
    );
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'users.update', entityId: 'u1' }),
    );
  });

  it('prazan roleIds briše sve role bez createMany', async () => {
    const { prisma, svc } = setup();
    prisma.user.update.mockResolvedValue(EXISTING);

    await svc.update('actor', 'u1', { roleIds: [] });

    expect(prisma.userRole.deleteMany).toHaveBeenCalled();
    expect(prisma.userRole.createMany).not.toHaveBeenCalled();
  });

  it('blokira samodeaktivaciju', async () => {
    const { prisma, svc } = setup();
    await expect(
      svc.update('u1', 'u1', { isActive: false }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('404 za nepoznatog korisnika', async () => {
    const { prisma, svc } = setup();
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(
      svc.update('actor', 'nema', { firstName: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
