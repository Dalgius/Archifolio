
'use client';

import * as React from 'react';
import { ProjectCard } from '@/components/project-card';
import { useProjects } from '@/hooks/use-projects';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function PortfolioPage() {
  const { projects, isInitialized } = useProjects();
  const [selectedTypology, setSelectedTypology] = React.useState<string>("All");

  const publicProjects = projects.filter(project => project.isPublic);
  
  const typologies = ["All", ...Array.from(new Set(publicProjects.map(p => p.typology).filter(Boolean)))];

  const filteredProjects = selectedTypology === "All" 
    ? publicProjects 
    : publicProjects.filter(p => p.typology === selectedTypology);

  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
           <Skeleton className="h-10 w-1/4" />
           <Skeleton className="h-10 w-1/2" />
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
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-12 gap-6">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">I Nostri Lavori Recenti</h1>
        <div className="flex flex-wrap gap-2">
            {typologies.map((typology) => (
                <Button 
                    key={typology}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTypology(typology)}
                    className={cn(
                        "rounded-full transition-colors",
                        selectedTypology === typology 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                            : "bg-transparent hover:bg-accent"
                    )}
                >
                    {typology}
                </Button>
            ))}
        </div>
      </div>

      <div id="projects" className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <ProjectCard project={project} />
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
    </div>
  );
}
