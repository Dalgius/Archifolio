import PublicLayout from '@/components/public-layout';
import { ProjectIndex } from '@/components/project-index';
import { ContactSection } from '@/components/contact-section';
import { getPublicProjects } from '@/lib/public-data';

// Regenerated at most every 60 seconds: admin changes show up within a minute.
export const revalidate = 60;

export default async function PortfolioPage() {
  const projects = await getPublicProjects();
  return (
    <PublicLayout>
      <ProjectIndex projects={projects} />
      <ContactSection />
    </PublicLayout>
  );
}
