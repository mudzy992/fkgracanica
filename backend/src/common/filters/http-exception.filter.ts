import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Strukturna provjera PrismaClientKnownRequestError — NAMJERNO bez importa
 * `@prisma/client` da filter ostanе testivam i lakše čitljiv:
 * Prisma greške nose `code` (oblika P####) + `clientVersion`.
 */
type PrismaLikeError = { code: string; clientVersion: string };

function isPrismaKnownError(error: unknown): error is PrismaLikeError {
  if (typeof error !== 'object' || error === null) return false;
  const e = error as { code?: unknown; clientVersion?: unknown };
  return (
    typeof e.code === 'string' &&
    /^P\d{4}$/.test(e.code) &&
    typeof e.clientVersion === 'string'
  );
}

/**
 * BE-01/Q-13 + P6 (odobreno 2026-11-02): Prisma → HTTP status umjesto 500.
 * FE/MOB prikazuju `message` iz odgovora — ove poruke su ugovor.
 */
const PRISMA_HTTP: Record<string, { status: HttpStatus; message: string }> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Zapis s istom vrijednošću već postoji',
  },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Zapis nije pronađen' },
  P2006: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Neispravna vrijednost podatka',
  },
};

/**
 * Globalni exception filter — oblik odgovora JE API ugovor (docs/BACKEND.md):
 *   { statusCode, message, timestamp, path }
 * - `message` (string | niz kod validacije) čitaju FE (`lib/api-error.ts`)
 *   i MOB (`src/lib/api-error.ts`) — NE SMIJE se mijenjati bez usklađenja.
 * - `path` je additivno polje (BE-01/P5 — odobreno); klijenti ga ignorišu.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (isPrismaKnownError(exception)) {
      const mapped = PRISMA_HTTP[exception.code];
      status = mapped?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      message = mapped?.message ?? 'Interna greška servera';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Interna greška servera';
    }

    if (status >= 500) {
      this.logger.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      message:
        typeof message === 'string'
          ? message
          : ((message as { message?: string | string[] }).message ?? message),
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }
}
