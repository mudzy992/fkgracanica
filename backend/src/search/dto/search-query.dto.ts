import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginatedQueryDto } from '../../common/dto/paginated-query.dto';

export const SEARCH_FACETS = [
  'news',
  'players',
  'clubs',
  'matches',
  'galleries',
  'trophies',
  'timeline',
  'hallOfFame',
] as const;
export type SearchFacet = (typeof SEARCH_FACETS)[number];

export class SearchQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(SEARCH_FACETS)
  type?: SearchFacet;
}
