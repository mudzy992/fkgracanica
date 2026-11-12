import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

/**
 * BE-01/P6 + Q-13 (odobreno): unit testovi error filtera —
 * pokrivaju ugovor {statusCode, message, timestamp, path} + Prisma mapping.
 * Ne zahtijeva generisan Prisma klijent (structural check).
 */

type JsonPayload = Record<string, unknown>;
type FilterResponse = {
  status: jest.Mock<{ json: jest.Mock<void, [JsonPayload]> }, [number]>;
  json: jest.Mock<void, [JsonPayload]>;
};

function createHost(originalUrl: string): {
  host: ArgumentsHost;
  res: FilterResponse;
} {
  const json = jest.fn<void, [JsonPayload]>();
  const status = jest.fn<{ json: typeof json }, [number]>();
  status.mockReturnValue({ json });
  const res: FilterResponse = { status, json };
  const host = {
    switchToHttp: () => ({
      getResponse: () => res,
      getRequest: () => ({ originalUrl }),
    }),
  } as unknown as ArgumentsHost;
  return { host, res };
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Http greška: status + message + timestamp + path (ugovor)', () => {
    const { host, res } = createHost('/api/v1/clubs?limit=10');
    filter.catch(new HttpException('Neispravan zahtjev', 400), host);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Neispravan zahtjev',
        path: '/api/v1/clubs?limit=10',
      }),
    );
    const payload = res.json.mock.calls[0][0];
    expect(typeof payload.timestamp).toBe('string');
  });

  it('Validation greška: message iz objekta (niz poruka ostaje niz)', () => {
    const { host, res } = createHost('/api/v1/auth/login');
    filter.catch(
      new HttpException(
        {
          message: ['email mora biti ispravan', 'lozinka je obavezna'],
          error: 'Bad Request',
          statusCode: 400,
        },
        400,
      ),
      host,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['email mora biti ispravan', 'lozinka je obavezna'],
        path: '/api/v1/auth/login',
      }),
    );
  });

  it('Nepoznata greška: 500 + generička poruka (bez curenja detalja)', () => {
    const { host, res } = createHost('/api/v1/anything');
    filter.catch(new Error('SQL: SELECT * FROM tajne'), host);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Interna greška servera',
        path: '/api/v1/anything',
      }),
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it('Prisma P2002 → 409 (umjesto 500)', () => {
    const { host, res } = createHost('/api/v1/users');
    filter.catch(
      { code: 'P2002', clientVersion: '6.16.2', meta: { target: ['email'] } },
      host,
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: 'Zapis s istom vrijednošću već postoji',
        path: '/api/v1/users',
      }),
    );
    // 4xx se ne logira kao greška
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('Prisma P2025 → 404', () => {
    const { host, res } = createHost('/api/v1/clubs/xyz');
    filter.catch({ code: 'P2025', clientVersion: '6.16.2' }, host);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Zapis nije pronađen',
      }),
    );
  });

  it('Prisma P2006 → 400', () => {
    const { host, res } = createHost('/api/v1/news');
    filter.catch({ code: 'P2006', clientVersion: '6.16.2' }, host);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Neispravna vrijednost podatka',
      }),
    );
  });

  it('Nepoznat Prisma kod (P9999) → 500 + log', () => {
    const { host, res } = createHost('/api/v1/anything');
    filter.catch({ code: 'P9999', clientVersion: '6.16.2' }, host);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Interna greška servera' }),
    );
    expect(errorSpy).toHaveBeenCalled();
  });
});
