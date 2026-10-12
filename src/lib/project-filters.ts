import type { Project, ProjectStatus } from '@/types';

export const PROJECT_STATUSES: ProjectStatus[] = ["Completato", "In Corso", "Concettuale", "Da fare"];

export type ProjectSort = 'date-desc' | 'date-asc' | 'amount-desc' | 'name-asc' | 'category-asc';

export const PROJECT_SORT_LABELS: Record<ProjectSort, string> = {
  'date-desc': 'Data (più recenti)',
  'date-asc': 'Data (meno recenti)',
  'amount-desc': 'Importo (decrescente)',
  'name-asc': 'Nome (A-Z)',
  'category-asc': 'Categoria opere',
};

export const normalize = (text: string) => text.toLocaleLowerCase('it').normalize('NFD').replace(/[̀-ͯ]/g, '');

// Case- and accent-insensitive search over the main text fields.
export function matchesSearch(project: Project, query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize([
    project.name, project.location, project.client, project.service,
    project.category, project.typology, project.classification, project.intervention,
  ].join(' '));
  return words.every((word) => haystack.includes(word));
}

const byDateDesc = (a: Project, b: Project) => b.startDate.localeCompare(a.startDate);

export function sortProjects(projects: Project[], sort: ProjectSort) {
  const sorted = [...projects];
  switch (sort) {
    case 'date-desc':
      return sorted.sort(byDateDesc);
    case 'date-asc':
      return sorted.sort((a, b) => a.startDate.localeCompare(b.startDate));
    case 'amount-desc':
      return sorted.sort((a, b) => b.amount - a.amount);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'it'));
    case 'category-asc':
      return sorted.sort((a, b) => a.category.localeCompare(b.category, 'it') || byDateDesc(a, b));
  }
}

export const projectYear = (project: Project) => Number(project.startDate.slice(0, 4)) || null;
