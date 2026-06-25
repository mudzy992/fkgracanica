import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto';
import {
  countSearchFacets,
  emptySearchResponse,
  findSearchFacet,
  previewAllFacets,
} from './search-queries.util';
import { buildMeta, parsePagination } from '../common/utils/pagination.util';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: SearchQueryDto) {
    const q = query.q?.trim() ?? '';
    if (!q) return emptySearchResponse();

    const facets = await countSearchFacets(this.prisma, q);

    if (!query.type) {
      const preview = await previewAllFacets(this.prisma, q);
      return { facets, ...preview };
    }

    const params = parsePagination(query);
    const total = facets[query.type];
    const results = await findSearchFacet(
      this.prisma,
      query.type,
      q,
      params.skip,
      params.limit,
    );

    return {
      facets,
      type: query.type,
      [query.type]: results,
      meta: buildMeta(total, params.page, params.limit),
    };
  }
}
