import { BadRequestException, ConflictException } from '@nestjs/common';
import { EXISTING, makePrisma, service } from './users-service.mock';

describe('UsersService.create/remove (BE-09 / P-B09-8)', () => {
  it('409 kad email već postoji', async () => {
    const prisma = makePrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 'u2' });
    const { svc } = service(prisma);
    await expect(
      svc.create('actor', { email: 'zauzet@fk.ba', password: 'test1234' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('remove radi soft delete i upisuje audit', async () => {
    const prisma = makePrisma();
    const { svc, audit } = service(prisma);
    prisma.user.findFirst.mockResolvedValue(EXISTING);
    prisma.role.findUnique.mockResolvedValue(null);
    prisma.user.update.mockResolvedValue(EXISTING);

    await svc.remove('actor', 'u1');

    const softDelete = expect.objectContaining({
      isActive: false,
    }) as unknown;
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: softDelete,
    });
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'users.delete', entityId: 'u1' }),
    );
  });

  it('remove blokira brisanje vlastitog računa', async () => {
    const prisma = makePrisma();
    const { svc } = service(prisma);
    await expect(svc.remove('u1', 'u1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
