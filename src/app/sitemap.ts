import type { MetadataRoute } from 'next';
import { getPublicProjects } from '@/lib/public-data';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublicProjects();
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
