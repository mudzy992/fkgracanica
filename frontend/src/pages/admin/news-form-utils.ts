import { z } from 'zod';
import { stripHtml } from '../../lib/html-content';
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';

export const newsFormSchema = z.object({
  title: z.string().min(3, 'Naslov je obavezan'),
  slug: z.string().min(2, 'Slug je obavezan'),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Sadržaj je obavezan'),
  coverPath: z.string().optional(),
  videoUrl: z.string().optional(),
  categoryId: z.string().optional(),
  tagsCsv: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  galleryId: z.string().optional(),
  scheduledAt: z.string().optional(),
  relatedMatchIds: z.array(z.string()).optional(),
  relatedPlayerIds: z.array(z.string()).optional(),
});

export type NewsFormData = z.infer<typeof newsFormSchema>;

export type NewsEditorFieldsProps = {
  register: UseFormRegister<NewsFormData>;
  control: Control<NewsFormData>;
  watch: UseFormWatch<NewsFormData>;
  setValue: UseFormSetValue<NewsFormData>;
  errors: FieldErrors<NewsFormData>;
};

export const emptyNewsForm: NewsFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverPath: '',
  videoUrl: '',
  categoryId: '',
  tagsCsv: '',
  seoTitle: '',
  seoDesc: '',
  galleryId: '',
  scheduledAt: '',
  relatedMatchIds: [],
  relatedPlayerIds: [],
};

export function newsItemToForm(item: import('../../types').NewsItem): NewsFormData {
  return {
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt ?? '',
    content: item.content,
    coverPath: item.coverPath ?? '',
    videoUrl: item.videoUrl ?? '',
    categoryId: item.categoryId ?? item.category?.id ?? '',
    tagsCsv: item.tags?.map((t) => t.name).join(', ') ?? '',
    seoTitle: item.seoTitle ?? '',
    seoDesc: item.seoDesc ?? '',
    galleryId: item.galleryId ?? '',
    scheduledAt: item.scheduledAt ? item.scheduledAt.slice(0, 16) : '',
    relatedMatchIds: item.relatedMatches?.map((r) => r.match?.id ?? r.matchId ?? '').filter(Boolean) ?? [],
    relatedPlayerIds: item.relatedPlayers?.map((r) => r.player.id) ?? [],
  };
}

export function formToNewsBody(data: NewsFormData) {
  const tags = data.tagsCsv
    ?.split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const excerpt = data.excerpt?.trim() || stripHtml(data.content).slice(0, 280) || undefined;
  return {
    title: data.title,
    slug: data.slug,
    excerpt,
    content: data.content,
    coverPath: data.coverPath || undefined,
    videoUrl: data.videoUrl || undefined,
    categoryId: data.categoryId || undefined,
    seoTitle: data.seoTitle || undefined,
    seoDesc: data.seoDesc || undefined,
    galleryId: data.galleryId || undefined,
    scheduledAt: data.scheduledAt || null,
    tags,
    relatedMatchIds: data.relatedMatchIds,
    relatedPlayerIds: data.relatedPlayerIds,
  };
}
