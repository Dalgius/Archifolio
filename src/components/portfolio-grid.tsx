'use client';

import * as React from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import type { Project } from '@/types';
import { ProjectCard } from '@/components/project-card';
import PublicLayout from '@/components/public-layout';

// Public portfolio grid with the typology filter. The projects are loaded on the server.
export function PortfolioGrid({ projects }: { projects: Project[] }) {
  const [selectedTypology, setSelectedTypology] = React.useState<string>("All");

  const typologies = ["All", ...Array.from(new Set(projects.map(p => p.typology).filter(Boolean)))];

  const filteredProjects = selectedTypology === "All"
    ? projects
    : projects.filter(p => p.typology === selectedTypology);

  return (
    <PublicLayout
      typologies={typologies}
      selectedTypology={selectedTypology}
      setSelectedTypology={setSelectedTypology}
    >
      <div className="container mx-auto py-12">
        <div id="projects" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="block h-full">
                <ProjectCard project={project} priority={index < 4} variant="compact" />
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
    </PublicLayout>
  );
}
