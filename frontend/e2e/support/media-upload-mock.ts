import type { Page } from '@playwright/test';

type Gate = { wait: Promise<void>; release: () => void };
function gate(): Gate {
  let release = () => {};
  const wait = new Promise<void>((resolve) => { release = resolve; });
  return { wait, release };
}
interface Options {
  holdUploads?: number[];
  holdRefresh?: boolean;
  failUploads?: Record<number, number>;
  failAssetReads?: number;
}

/** Sva stanja i svi uploadi su sintetički; nema pristupa produkciji. */
export async function setupMediaUploadMock(page: Page, options: Options = {}) {
  const posts: { name: string; folder: string }[] = [];
  const uploadGates = new Map((options.holdUploads ?? []).map((index) => [index, gate()]));
  const refreshGate = gate();
  let completed = 0;
  let reads = 0;
  let heldRefresh = false;
  let failures = options.failAssetReads ?? 0;

  await page.route('**/api/v1/media/folders', (route) => route.fulfill({ json: [
    { id: 'folder-a', name: 'Fotografije', parentId: null, _count: { assets: 0 } },
    { id: 'folder-b', name: 'Arhiva', parentId: null, _count: { assets: 0 } },
  ] }));
  await page.route('**/api/v1/media/assets*', async (route) => {
    reads += 1;
    if (completed && options.holdRefresh && !heldRefresh) {
      heldRefresh = true;
      await refreshGate.wait;
    }
    if (completed && failures > 0) {
      failures -= 1;
      return route.fulfill({ status: 503, json: { message: 'synthetic read failure' } }).catch(() => {});
    }
    return route.fulfill({ json: { data: [], meta: { total: 0, page: 1, totalPages: 1, limit: 20 } } }).catch(() => {});
  });
  await page.route('**/api/v1/media/upload', async (route) => {
    const body = route.request().postDataBuffer()?.toString('latin1') ?? '';
    const name = /name="file"; filename="([^"]+)"/.exec(body)?.[1] ?? '';
    const folder = /name="folderId"\r\n\r\n([^\r\n]+)/.exec(body)?.[1] ?? '';
    posts.push({ name, folder });
    const number = posts.length;
    const held = uploadGates.get(number);
    if (held) await held.wait;
    completed += 1;
    const status = options.failUploads?.[number] ?? 200;
    return route.fulfill({ status, json: status === 200 ? { id: `mock-${number}` } : { message: 'synthetic failure' } });
  });
  return {
    posts,
    reads: () => reads,
    heldRefresh: () => heldRefresh,
    releaseUpload: (number: number) => uploadGates.get(number)?.release(),
    releaseRefresh: () => refreshGate.release(),
  };
}
