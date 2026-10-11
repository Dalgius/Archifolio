// Absolute site URL for metadata, sitemap and robots. Netlify sets URL automatically;
// NEXT_PUBLIC_SITE_URL overrides it (e.g. with a custom domain).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || 'http://localhost:9002').replace(/\/$/, '');

export const SITE_NAME = 'GDAStudio';

// Studio details shown on the public site (Contatti section and footer).
// DA SOSTITUIRE: these are placeholders. Set a field to '' (or remove a link) to hide it.
export const STUDIO = {
  name: 'GDA Studio',
  // Shown next to the logo in the header.
  owner: 'Giuseppe D’Alessio',
  profession: 'Architetto',
  email: 'info@esempio.it',
  phone: '+39 000 000 0000',
  address: 'Via Esempio 1',
  city: '86170 Isernia (IS)',
  links: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
  ],
};
