import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
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
  // BE-08/P-B08-6: upit je dolazio do ~8 KB kroz URL (`contains` = seq scan).
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsIn(SEARCH_FACETS)
  type?: SearchFacet;
}
