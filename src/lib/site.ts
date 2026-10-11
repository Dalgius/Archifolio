// Absolute site URL for metadata, sitemap and robots. Netlify sets URL automatically;
// NEXT_PUBLIC_SITE_URL overrides it (e.g. with a custom domain).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || 'http://localhost:9002').replace(/\/$/, '');

export const SITE_NAME = 'GDAStudio';
