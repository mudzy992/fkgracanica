import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePublicSettings } from '../../hooks';
import { defaultShareImage } from '../../lib/seo-meta';
import { applySeoToDocument } from './seo-document';

export interface SeoInput {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export function Seo({ title, description, image, url, type }: SeoInput) {
  const location = useLocation();
  const { data: settings } = usePublicSettings();

  const siteName = settings?.['club.name']?.trim() || settings?.['seo.title']?.trim() || 'FK Gračanica';
  const defaultDescription =
    settings?.['seo.description']?.trim() ||
    'Službena web stranica FK Gračanica — vijesti, utakmice, članstvo i ulaznice.';
  const defaultImage = defaultShareImage(settings?.['club.crestUrl']);
  const pageUrl = url ?? location.pathname + location.search;

  useEffect(() => {
    applySeoToDocument({
      title,
      description,
      image,
      url: pageUrl,
      type,
      siteName,
      defaultDescription,
      defaultImage,
    });
  }, [title, description, image, pageUrl, type, siteName, defaultDescription, defaultImage]);

  return null;
}
