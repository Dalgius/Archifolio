
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { useProjects } from '@/hooks/use-projects';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { projects, isInitialized } = useProjects();

  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <article className="max-w-4xl mx-auto">
          <Skeleton className="w-full h-[400px] rounded-lg mb-8" />
          <div className="flex gap-4 items-center mb-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-12 w-3/4 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        </article>
      </div>
    );
  }

  const project = projects.find((p) => p.id === params.id);

  if (!project || !project.isPublic) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" >
          <Button variant="outline" className="inline-flex items-center gap-2">
            <ArrowLeft />
            <span>Torna al Portfolio</span>
          </Button>
        </Link>
      </div>
      <article className="max-w-4xl mx-auto">
        <Image
          src={project.image}
          alt={project.name}
          width={1200}
          height={800}
          className="w-full h-auto rounded-lg object-cover mb-8 shadow-lg"
          data-ai-hint="architecture design"
        />
        <div className="flex flex-wrap gap-4 items-center mb-4 text-muted-foreground">
            <Badge variant="secondary" className="text-base">{project.status}</Badge>
            <span>&bull;</span>
            <span>{project.location}</span>
            <span>&bull;</span>
            <span>Completato il: {format(parseISO(project.completionDate), 'd MMMM yyyy', { locale: it })}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-headline mb-6">{project.name}</h1>
        <div className="prose prose-lg max-w-none text-foreground/80">
          <p>{project.description}</p>
        </div>
      </article>
    </div>
  );
}
