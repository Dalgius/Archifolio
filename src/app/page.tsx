
'use client';

import * as React from 'react';
import { ProjectCard } from '@/components/project-card';
import { useProjects } from '@/hooks/use-projects';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import PublicLayout from '@/components/public-layout';

export const dynamic = 'force-dynamic';

export default function PortfolioPage() {
  const { projects, isInitialized } = useProjects();
  const [selectedTypology, setSelectedTypology] = React.useState<string>("All");

  const publicProjects = projects.filter(project => project.isPublic);
  
  const typologies = ["All", ...Array.from(new Set(publicProjects.map(p => p.typology).filter(Boolean)))];

  const filteredProjects = selectedTypology === "All" 
    ? publicProjects 
    : publicProjects.filter(p => p.typology === selectedTypology);

  const pageContent = (
     <div className="container px-4 py-12">
      {!isInitialized && (
         <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
          ))}
        </div>
      )}

      {isInitialized && (
        <div id="projects" className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <ProjectCard project={project} priority={index < 3} />
              </Link>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 gap-4 text-center border-2 border-dashed rounded-lg">
              <FileText className="w-12 h-12 text-muted-foreground" />
              <h3 className="text-xl font-semibold font-headline">Nessun Progetto Trovato</h3>
              <p className="text-muted-foreground">
                Non ci sono progetti che corrispondono a questa tipologia.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <PublicLayout 
      typologies={typologies} 
      selectedTypology={selectedTypology} 
      setSelectedTypology={setSelectedTypology}
    >
      {pageContent}
    </PublicLayout>
  )
}
