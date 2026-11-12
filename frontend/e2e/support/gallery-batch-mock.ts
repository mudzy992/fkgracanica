import type { Page } from '@playwright/test';

const assets = [
  { id: 'a', filename: 'a.jpg', originalPath: 'originals/a.jpg', mimeType: 'image/jpeg', size: 1 },
  { id: 'b', filename: 'b.jpg', originalPath: 'originals/b.jpg', mimeType: 'image/jpeg', size: 1 },
];
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/w50AAAAASUVORK5CYII=', 'base64');

interface Options {
  failedPost?: 'before-commit' | 'after-commit' | 'none';
  failedRefreshes?: number;
  failFolderRead?: boolean;
  holdRefresh?: boolean;
  initialReadFailures?: number;
}

export async function setupGalleryBatchMock(page: Page, options: Options = {}) {
  const paths: string[] = [];
  const writes: string[] = [];
  let galleryReads = 0;
  let initialReadFailures = options.initialReadFailures ?? 0;
  let failedRefreshes = options.failedRefreshes ?? 0;
  let postFailed = false;
  let holdRefresh = options.holdRefresh ?? false;
  let releaseRefresh = () => {};
  const refreshGate = new Promise<void>((resolve) => { releaseRefresh = resolve; });
  await page.route('**/api/v1/uploads/files/**', (route) => route.fulfill({ contentType: 'image/png', body: png }));
  await page.route('**/api/v1/media/assets*', (route) => {
    const url = new URL(route.request().url());
    if (options.failFolderRead && url.searchParams.get('limit') === '100') {
      return route.fulfill({ status: 500, json: { message: 'folder unavailable' } });
    }
    return route.fulfill({ json: { data: assets, meta: { total: 2, page: 1, totalPages: 1, limit: 100 } } });
  });
  await page.route('**/api/v1/gallery/g1/photos', async (route) => {
    if (route.request().method() !== 'POST') throw new Error('Unexpected gallery photo request');
    const { path } = route.request().postDataJSON() as { path: string };
    writes.push(path);
    if (path === assets[1].originalPath && !postFailed && options.failedPost !== 'none') {
      postFailed = true;
      if (options.failedPost === 'after-commit') paths.push(path);
      return route.fulfill({ status: 500, json: { message: 'synthetic failure' } });
    }
    paths.push(path);
    return route.fulfill({ json: { id: `p${paths.length}`, path } });
  });
  await page.route('**/api/v1/gallery/g1', async (route) => {
    if (route.request().method() !== 'GET') throw new Error('Unexpected gallery update');
    galleryReads += 1;
    if (!writes.length && initialReadFailures > 0) {
      initialReadFailures -= 1;
      return route.fulfill({ status: 503, json: { message: 'gallery unavailable' } });
    }
    if (writes.length && holdRefresh) {
      holdRefresh = false;
      await refreshGate;
    }
    if (writes.length && failedRefreshes > 0) {
      failedRefreshes -= 1;
      return route.fulfill({ status: 503, json: { message: 'gallery unavailable' } });
    }
    return route.fulfill({ json: {
      id: 'g1', title: 'Testni album', description: 'Izvorni opis', status: 'DRAFT',
      photos: paths.map((path, index) => ({ id: `p${index + 1}`, path, sortOrder: index })),
    } });
  });
  return { paths, writes, reads: () => galleryReads, releaseRefresh };
}
