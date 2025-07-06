import { ProjectCard } from '@/components/project-card';
import { projects } from '@/lib/data';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function PortfolioPage() {
  const publicProjects = projects.filter(project => project.isPublic);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center font-headline mb-4">Portfolio di Architettura</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Benvenuti nella mia collezione di progetti, che mostra un viaggio attraverso il design, l'innovazione e l'architettura sostenibile.</p>
      </div>
      <div id="projects" className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {publicProjects.length > 0 ? (
          publicProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="group">
              <ProjectCard project={project} />
            </Link>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center h-64 gap-4 text-center border-2 border-dashed rounded-lg">
            <FileText className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold font-headline">Nessun Progetto Pubblico</h3>
            <p className="text-muted-foreground">
              Nessun progetto è stato ancora reso pubblico. Controlla più tardi!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
