import { buildMeta, parsePagination } from './pagination.util';

describe('pagination.util', () => {
  it('parsePagination defaults', () => {
    const p = parsePagination({});
    expect(p.page).toBe(1);
    expect(p.limit).toBe(20);
    expect(p.skip).toBe(0);
    expect(p.order).toBe('desc');
  });

  it('parsePagination caps limit at 100', () => {
    const p = parsePagination({ page: 2, limit: 500 });
    expect(p.limit).toBe(100);
    expect(p.skip).toBe(100);
  });

  it('buildMeta calculates totalPages', () => {
    expect(buildMeta(45, 2, 20)).toEqual({
      total: 45,
      page: 2,
      limit: 20,
      totalPages: 3,
    });
  });
});
