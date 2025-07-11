
'use client';

import * as React from 'react';
import { ProjectCard } from '@/components/project-card';
import { useProjects } from '@/hooks/use-projects';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

export default function PortfolioPage() {
  const { projects, isInitialized } = useProjects();
  const publicProjects = projects.filter(project => project.isPublic);
  
  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center font-headline mb-4">Il Mio Portfolio</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Una breve descrizione del tuo lavoro e della tua filosofia.</p>
      </div>
      <div id="projects" className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {publicProjects.length > 0 ? (
          publicProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
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
