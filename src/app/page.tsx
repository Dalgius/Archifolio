import { ProjectCard } from '@/components/project-card';
import { projects } from '@/lib/data';
import Link from 'next/link';

export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center font-headline mb-4">Architectural Portfolio</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Welcome to my curated collection of projects, showcasing a journey through design, innovation, and sustainable architecture.</p>
      </div>
      <div id="projects" className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`} className="group">
            <ProjectCard project={project} />
          </Link>
        ))}
      </div>
    </div>
  );
}
