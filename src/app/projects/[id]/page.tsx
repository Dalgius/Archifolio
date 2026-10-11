import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectImage } from '@/components/project-image';
import { getPublicProject } from '@/lib/public-data';
import { projectImageUrl } from '@/lib/project-images';
import { SITE_NAME } from '@/lib/site';
import type { Project } from '@/types';

// Regenerated at most every 60 seconds: admin changes show up within a minute.
export const revalidate = 60;

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

// No pages at build time: each project page is generated on its first visit, then cached.
export async function generateStaticParams() {
  return [];
}

const formatDate = (date: string) => {
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, 'd MMMM yyyy', { locale: it }) : '';
};

// "Concettuale" and "Da fare" projects have no real end date yet.
const formatPeriod = (project: Project) => {
  const start = formatDate(project.startDate);
  switch (project.status) {
    case 'In Corso':
      return `${start} - in corso`;
    case 'Completato':
      return `${start} - ${formatDate(project.endDate)}`;
    default:
      return start;
  }
};

const describe = (project: Project) =>
  project.description ||
  [project.typology, project.location, project.client && `Committente: ${project.client}`, project.service]
    .filter(Boolean)
    .join(' · ');

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getPublicProject(id);
  if (!project) {
    return { title: `Progetto non trovato — ${SITE_NAME}` };
  }

  const title = `${project.name} — ${SITE_NAME}`;
  const description = describe(project);
  const image = projectImageUrl(project);
  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: SITE_NAME,
      locale: 'it_IT',
      images: image ? [{ url: image, alt: project.name }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await getPublicProject(id);

  if (!project) {
    notFound();
  }

  const details = [
    { label: 'Committente', value: project.client },
    { label: 'Importo Lavori', value: new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(project.amount) },
    { label: 'Categoria Opere', value: project.category },
    { label: 'Prestazione', value: project.service },
    { label: 'Tipologia', value: project.typology },
    { label: 'Intervento', value: project.intervention },
    { label: 'Classificazione', value: project.classification },
  ].filter((detail) => detail.value);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="outline" asChild>
          <Link href="/" className="inline-flex items-center gap-2">
            <ArrowLeft />
            <span>Torna al Portfolio</span>
          </Link>
        </Button>
      </div>
      <article className="max-w-4xl mx-auto">
        <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden mb-8 shadow-lg">
          <ProjectImage project={project} sizes="(max-width: 896px) 100vw, 896px" priority />
        </div>
        <div className="flex flex-wrap gap-4 items-center mb-4 text-muted-foreground">
            <Badge variant="secondary" className="text-base">{project.status}</Badge>
            <span>&bull;</span>
            <span>{project.location}</span>
            <span>&bull;</span>
            <span>Periodo: {formatPeriod(project)}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-headline mb-6">{project.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 text-sm border-t border-b py-8">
          {details.map((detail) => (
            <div key={detail.label} className="flex flex-col">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider">{detail.label}</span>
              <span className="text-foreground">{detail.value}</span>
            </div>
          ))}
        </div>

        {project.works && project.works.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-headline mb-4">Lavori Principali</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              {project.works.map((work, index) => <li key={index}>{work}</li>)}
            </ul>
          </div>
        )}

        {project.description && (
          <div className="prose prose-lg max-w-none text-foreground/80">
             <h2 className="text-2xl font-bold font-headline mb-4">Note / Descrizione</h2>
            <p>{project.description}</p>
          </div>
        )}
      </article>
    </div>
  );
}
