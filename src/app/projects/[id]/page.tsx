import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicLayout from '@/components/public-layout';
import { CONTAINER } from '@/components/container';
import { ProjectImage } from '@/components/project-image';
import { getPublicProject, getPublicProjects } from '@/lib/public-data';
import { formatAmount, formatPeriod, projectNumber } from '@/lib/project-format';
import { cn } from '@/lib/utils';
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

const label = 'text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground';

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await getPublicProject(id);

  if (!project) {
    notFound();
  }

  // Number and previous/next follow the order of the public index.
  const projects = await getPublicProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  const previous = index > 0 ? projects[index - 1] : null;
  const next = index >= 0 && index < projects.length - 1 ? projects[index + 1] : null;

  const details = [
    { label: 'Committente', value: project.client },
    { label: 'Luogo', value: project.location },
    { label: 'Periodo', value: formatPeriod(project) },
    { label: 'Stato', value: project.status },
    { label: 'Prestazione', value: project.service },
    { label: 'Categoria opere', value: project.category },
    { label: 'Tipologia', value: project.typology },
    { label: 'Intervento', value: project.intervention },
    { label: 'Classificazione', value: project.classification },
    { label: 'Importo lavori', value: project.amount ? formatAmount(project.amount) : '' },
  ].filter((detail) => detail.value);

  return (
    <PublicLayout>
      <article className={cn(CONTAINER, 'pb-20 pt-10 md:pt-14')}>
        <div className={cn(label, 'flex items-center justify-between')}>
          <Link href="/#progetti" className="transition-colors hover:text-foreground">← Indice</Link>
          {index >= 0 && <span className="tabular-nums">N. {projectNumber(index)}</span>}
        </div>

        <h1 className="mt-10 max-w-5xl animate-fade-up font-display text-4xl font-medium leading-[1.05] tracking-[-0.01em] md:text-6xl">
          {project.name}
        </h1>
        <p className="mt-4 text-muted-foreground">{project.location} · {formatPeriod(project)}</p>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="relative aspect-[3/2] overflow-hidden bg-muted lg:order-2 lg:col-span-8">
            <ProjectImage project={project} sizes="(max-width: 1024px) 100vw, 66vw" priority />
          </div>
          <dl className="border-t lg:order-1 lg:col-span-4">
            {details.map((detail) => (
              <div key={detail.label} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-4 border-b py-3 text-sm">
                <dt className={cn(label, 'pt-0.5')}>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {project.works && project.works.length > 0 && (
          <section className="mt-20 grid gap-6 lg:grid-cols-12">
            <h2 className={cn(label, 'lg:col-span-4')}>Lavori principali</h2>
            <ol className="border-t lg:col-span-8">
              {project.works.map((work, workIndex) => (
                <li key={workIndex} className="flex gap-6 border-b py-3">
                  <span className="font-display text-sm tabular-nums text-muted-foreground">{projectNumber(workIndex)}</span>
                  <span>{work}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {project.description && (
          <section className="mt-20 grid gap-6 lg:grid-cols-12">
            <h2 className={cn(label, 'lg:col-span-4')}>Descrizione</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed lg:col-span-8">{project.description}</p>
          </section>
        )}

        {(previous || next) && (
          <nav aria-label="Altri progetti" className="mt-24 grid border-t md:grid-cols-2">
            {previous ? (
              <Link href={`/projects/${previous.id}`} className="group block border-b py-6 md:border-b-0 md:border-r md:pr-6">
                <span className={label}>← Precedente</span>
                <span className="mt-2 block font-display text-lg font-medium leading-snug transition-transform duration-300 group-hover:-translate-x-1">{previous.name}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/projects/${next.id}`} className="group block py-6 text-right md:pl-6">
                <span className={label}>Successivo →</span>
                <span className="mt-2 block font-display text-lg font-medium leading-snug transition-transform duration-300 group-hover:translate-x-1">{next.name}</span>
              </Link>
            )}
          </nav>
        )}
      </article>
    </PublicLayout>
  );
}
