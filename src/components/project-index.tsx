'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Project } from '@/types';
import { cn } from '@/lib/utils';
import { formatYears, projectNumber } from '@/lib/project-format';
import { ProjectImage } from './project-image';
import { CONTAINER, INDEX_COLUMNS } from './container';

type View = 'index' | 'grid';
type Entry = { project: Project; number: string };

const ALL = 'Tutti';
// The chosen view is remembered per browser; storage can be unavailable (private mode).
const VIEW_KEY = 'gdastudio.view';

const label = 'text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground';
// Staggered entrance, capped so long lists don't wait.
const delay = (index: number) => ({ animationDelay: `${Math.min(index, 12) * 40}ms` });

export function ProjectIndex({ projects }: { projects: Project[] }) {
  const [typology, setTypology] = React.useState(ALL);
  const [view, setView] = React.useState<View>('index');

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_KEY);
      if (saved === 'index' || saved === 'grid') setView(saved);
    } catch {
      // Keep the default view.
    }
  }, []);

  const changeView = (next: View) => {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Not remembered, still switched.
    }
  };

  // Numbers follow the full public list, so a project keeps its number when filtering.
  const entries = React.useMemo<Entry[]>(
    () => projects.map((project, index) => ({ project, number: projectNumber(index) })),
    [projects]
  );

  const typologies = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const { typology } of projects) {
      if (typology) counts.set(typology, (counts.get(typology) ?? 0) + 1);
    }
    return [[ALL, projects.length] as const, ...[...counts.entries()].sort(([a], [b]) => a.localeCompare(b, 'it'))];
  }, [projects]);

  const visible = typology === ALL ? entries : entries.filter(({ project }) => project.typology === typology);

  return (
    <section id="progetti" className="scroll-mt-16">
      <div className={cn(CONTAINER, 'pt-16 md:pt-24')}>
        <h1 className="animate-fade-up font-display text-6xl font-medium tracking-tight md:text-8xl lg:text-[9rem] lg:leading-[0.9]">
          Progetti
          <sup className="ml-2 align-super font-display text-lg font-normal tracking-normal text-muted-foreground md:text-2xl">
            ({projects.length})
          </sup>
        </h1>

        <div className="mt-10 flex flex-col gap-5 border-b pb-4 md:mt-14 md:flex-row md:items-end md:justify-between">
          {typologies.length > 2 && (
            <div role="group" aria-label="Filtra per tipologia" className="flex flex-wrap gap-x-5 gap-y-2">
              {typologies.map(([name, count]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setTypology(name)}
                  aria-pressed={typology === name}
                  className={cn(
                    'text-sm transition-colors',
                    typology === name
                      ? 'text-foreground underline decoration-1 underline-offset-[6px]'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {name}<sup className="ml-0.5 text-[10px]">{count}</sup>
                </button>
              ))}
            </div>
          )}
          <div role="group" aria-label="Vista" className="flex gap-4 md:ml-auto">
            {(['index', 'grid'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => changeView(option)}
                aria-pressed={view === option}
                className={cn(label, 'transition-colors', view === option ? 'text-foreground' : 'hover:text-foreground')}
              >
                {option === 'index' ? 'Indice' : 'Griglia'}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="py-16 text-muted-foreground">Nessun progetto per questa tipologia.</p>
        ) : view === 'index' ? (
          <IndexList entries={visible} />
        ) : (
          <GridList entries={visible} />
        )}
      </div>
    </section>
  );
}

function IndexList({ entries }: { entries: Entry[] }) {
  // N. · thumbnail slot · project · place · years · category
  const columns = INDEX_COLUMNS;

  return (
    <div>
      <div className={cn('hidden border-b py-3 md:grid', columns, label)}>
        <span>N.</span>
        <span aria-hidden />
        <span>Progetto</span>
        <span>Luogo</span>
        <span>Anno</span>
        <span className="text-right">Cat.</span>
      </div>
      <ul className="group/list">
        {entries.map(({ project, number }, index) => (
          <li key={project.id} className="animate-fade-up border-b" style={delay(index)}>
            <Link
              href={`/projects/${project.id}`}
              className={cn(
                'group grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-x-4 py-4 md:py-5',
                'transition-opacity duration-300 md:group-hover/list:opacity-30 md:hover:!opacity-100',
                columns
              )}
            >
              <span className="hidden font-display text-sm tabular-nums text-muted-foreground md:block">{number}</span>
              {/* Thumbnail: always visible on touch screens; with a mouse its space is reserved
                  and the image fades in on hover/focus, so the text never moves. */}
              <div
                className={cn(
                  'relative aspect-[4/3] w-20 overflow-hidden bg-muted md:w-[4.5rem]',
                  'transition-[opacity,transform] duration-300',
                  '[@media(hover:hover)]:md:scale-95 [@media(hover:hover)]:md:opacity-0',
                  '[@media(hover:hover)]:md:group-hover:scale-100 [@media(hover:hover)]:md:group-hover:opacity-100',
                  '[@media(hover:hover)]:md:group-focus-visible:scale-100 [@media(hover:hover)]:md:group-focus-visible:opacity-100'
                )}
              >
                <ProjectImage project={project} sizes="80px" />
              </div>
              <div className="min-w-0">
                <span className="block font-display text-base font-medium leading-snug md:text-xl">
                  {project.name}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground md:hidden">
                  {number} · {project.location} · {formatYears(project)}
                </span>
              </div>
              <span className="hidden truncate text-sm text-muted-foreground md:block">{project.location}</span>
              <span className="hidden text-sm tabular-nums text-muted-foreground md:block">{formatYears(project)}</span>
              <span className="hidden text-right text-sm tabular-nums text-muted-foreground md:block">{project.category}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GridList({ entries }: { entries: Entry[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-12 py-10 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(({ project, number }, index) => (
        <li key={project.id} className="animate-fade-up" style={delay(index)}>
          <Link href={`/projects/${project.id}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <ProjectImage
                project={project}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                priority={index < 3}
              />
            </div>
            <div className="mt-4 flex gap-4">
              <span className="font-display text-sm tabular-nums text-muted-foreground">{number}</span>
              <div className="min-w-0">
                <h2 className="font-display text-base font-medium leading-snug">{project.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{project.location} · {formatYears(project)}</p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
