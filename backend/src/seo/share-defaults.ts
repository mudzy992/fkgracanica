export type SiteDefaults = {
  siteName: string;
  description: string;
  crestPath?: string | null;
  crestUrl?: string;
};

export type PackInput = {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article';
};
