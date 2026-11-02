import { join } from 'path';
import { unlink } from 'fs/promises';

export async function deleteStoredFiles(
  uploadRoot: string,
  paths: Array<string | null | undefined>,
): Promise<void> {
  await Promise.all(
    paths
      .filter((p): p is string => !!p)
      .map((relative) =>
        unlink(join(uploadRoot, relative)).catch(() => undefined),
      ),
  );
}
