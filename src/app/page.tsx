import { PortfolioGrid } from '@/components/portfolio-grid';
import { getPublicProjects } from '@/lib/public-data';

// Regenerated at most every 60 seconds: admin changes show up within a minute.
export const revalidate = 60;

export default async function PortfolioPage() {
  const projects = await getPublicProjects();
  return <PortfolioGrid projects={projects} />;
}
