import { ProjectCard } from '@/components/project-card';
import { projects } from '@/lib/data';
import Link from 'next/link';

export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center font-headline mb-4">Portfolio di Architettura</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Benvenuti nella mia collezione di progetti, che mostra un viaggio attraverso il design, l'innovazione e l'architettura sostenibile.</p>
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
