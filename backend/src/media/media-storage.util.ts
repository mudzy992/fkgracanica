import { Logger } from '@nestjs/common';
import { resolve, sep } from 'path';
import { unlink } from 'fs/promises';

/**
 * BE-09b/P-B09b-12: briše fajlove uz dva pojasa zaštite:
 * - putanja MORa ostati ispod `uploadRoot` (prije: `join` bez provjere),
 * - neuspjelo brisanje se LOGUJE (prije: `.catch(() => undefined)` — fajlovi
 *   su tiho ostajali na disku, bez ijednog traga u logu).
 */
const storageLogger = new Logger('MediaStorage');

export async function deleteStoredFiles(
  uploadRoot: string,
  paths: Array<string | null | undefined>,
  logger: Pick<Logger, 'warn'> = storageLogger,
): Promise<void> {
  const root = resolve(uploadRoot);
  await Promise.all(
    paths
      .filter((p): p is string => !!p)
      .map(async (relative) => {
        const fullPath = resolve(root, relative);
        if (fullPath !== root && !fullPath.startsWith(root + sep)) {
          logger.warn(`Odbijeno brisanje van upload direktorija: ${relative}`);
          return;
        }
        try {
          await unlink(fullPath);
        } catch (error) {
          const code = (error as { code?: string }).code;
          if (code === 'ENOENT') return; // već obrisano — nije greška
          logger.warn(
            `Brisanje fajla nije uspjelo (${relative}): ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }),
  );
}
