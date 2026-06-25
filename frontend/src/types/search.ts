import type { Club, GalleryItem, Match, NewsItem, Player, Trophy } from './index';
import type { PaginationMeta } from './pagination';

export const SEARCH_FACETS = ['news', 'players', 'clubs', 'matches', 'galleries', 'trophies'] as const;
export type SearchFacet = (typeof SEARCH_FACETS)[number];

export const SEARCH_FACET_LABELS: Record<SearchFacet, string> = {
  news: 'Vijesti',
  players: 'Igrači',
  clubs: 'Klubovi',
  matches: 'Utakmice',
  galleries: 'Galerije',
  trophies: 'Trofeji',
};

export interface SearchFacets {
  news: number;
  players: number;
  clubs: number;
  matches: number;
  galleries: number;
  trophies: number;
}

export interface SearchResponse {
  facets: SearchFacets;
  type?: SearchFacet;
  meta?: PaginationMeta;
  news: NewsItem[];
  players: Player[];
  clubs: Club[];
  matches: Match[];
  galleries: GalleryItem[];
  trophies: Trophy[];
}
