import { format, isValid, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Project } from '@/types';

// Index numbers on the public site: 01, 02, ... (by position in the public list).
export const projectNumber = (index: number) => String(index + 1).padStart(2, '0');

const year = (date: string) => date.slice(0, 4);

// Compact year range for the index: "2019–2021", "2024–" while in progress, single year otherwise.
export function formatYears(project: Project) {
  const start = year(project.startDate);
  if (project.status === 'In Corso') return `${start}–`;
  if (project.status !== 'Completato') return start;
  const end = year(project.endDate);
  return !end || end === start ? start : `${start}–${end}`;
}

const formatLongDate = (date: string) => {
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, 'MMMM yyyy', { locale: it }) : '';
};

// "Concettuale" and "Da fare" projects have no real end date yet.
export function formatPeriod(project: Project) {
  const start = formatLongDate(project.startDate);
  switch (project.status) {
    case 'In Corso':
      return `${start} – in corso`;
    case 'Completato': {
      const end = formatLongDate(project.endDate);
      return end && end !== start ? `${start} – ${end}` : start;
    }
    default:
      return start;
  }
}

export const formatAmount = (amount: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
