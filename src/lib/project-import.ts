import { z } from 'zod';
import type { Project, ProjectFields, ProjectStatus } from '@/types';
import { normalize, PROJECT_STATUSES } from './project-filters';

// Import file format (see README, "Importazione progetti"):
// { "version": 1, "projects": [ { "name": "...", ...optional fields, "image": "data:image/..." } ] }

const optionalText = z.string().trim().optional();
const optionalDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'data non valida, usa AAAA-MM-GG').optional();

const importedProjectSchema = z.object({
  name: z.string({ required_error: 'titolo mancante' }).trim().min(1, 'titolo mancante'),
  location: optionalText,
  startDate: optionalDate,
  endDate: optionalDate,
  client: optionalText,
  service: optionalText,
  amount: z.number({ invalid_type_error: 'importo non numerico' }).min(0, 'importo negativo').optional(),
  category: optionalText,
  status: z.enum(PROJECT_STATUSES as [ProjectStatus, ...ProjectStatus[]], {
    errorMap: () => ({ message: `stato non valido (${PROJECT_STATUSES.join(', ')})` }),
  }).optional(),
  typology: optionalText,
  intervention: optionalText,
  classification: optionalText,
  description: optionalText,
  works: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  image: z.string().regex(/^data:image\/[\w.+-]+;base64,/, 'immagine non valida (serve un data URL)').optional(),
  source: optionalText,
});

export type ImportedProject = z.infer<typeof importedProjectSchema>;

const importFileSchema = z.object({
  version: z.literal(1).optional(),
  projects: z.array(z.unknown()),
});

// Fields copied from the file onto the project, with their labels for the preview.
const FIELD_LABELS = {
  name: 'Titolo',
  location: 'Località',
  startDate: 'Data inizio',
  endDate: 'Data fine',
  client: 'Committente',
  service: 'Prestazione',
  amount: 'Importo',
  category: 'Categoria',
  status: 'Stato',
  typology: 'Tipologia',
  intervention: 'Intervento',
  classification: 'Classificazione',
  description: 'Descrizione',
  works: 'Lavori',
} as const satisfies Partial<Record<keyof ProjectFields, string>>;

type ImportedField = keyof typeof FIELD_LABELS;
const FIELDS = Object.keys(FIELD_LABELS) as ImportedField[];

// Titles match ignoring case, accents and punctuation ("S.MARTINO" = "S. Martino").
export const normalizeTitle = (title: string) =>
  normalize(title).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// Empty strings and empty lists count as "not provided", so they never erase existing data.
const providedFields = (project: ImportedProject): Partial<ProjectFields> => {
  const fields: Partial<Record<ImportedField, unknown>> = {};
  for (const key of FIELDS) {
    const value = project[key];
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) continue;
    fields[key] = Array.isArray(value) ? value.map((work) => work.trim()).filter(Boolean) : value;
  }
  return fields as Partial<ProjectFields>;
};

export interface ImportRow {
  index: number; // position in the file, 1-based
  project: ImportedProject;
}

export interface AddRow extends ImportRow {
  fields: ProjectFields;
}

export interface UpdateRow extends ImportRow {
  existing: Project;
  fields: ProjectFields;
  changes: string[]; // labels of the fields that change (plus "Immagine")
}

export interface SkippedRow {
  index: number;
  name: string;
  reason: string;
}

export interface ImportPlan {
  toAdd: AddRow[];
  toUpdate: UpdateRow[];
  unchanged: ImportRow[];
  skipped: SkippedRow[];
}

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function parseImportFile(text: string): unknown[] {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Il file non è un JSON valido.');
  }
  const parsed = importFileSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('Formato non riconosciuto: serve un oggetto con l\'elenco "projects".');
  }
  return parsed.data.projects;
}

// Matches the file against the existing projects. Nothing is written here.
export function planImport(rows: unknown[], existing: Project[]): ImportPlan {
  const plan: ImportPlan = { toAdd: [], toUpdate: [], unchanged: [], skipped: [] };

  const byTitle = new Map<string, Project[]>();
  for (const project of existing) {
    const key = normalizeTitle(project.name);
    byTitle.set(key, [...(byTitle.get(key) ?? []), project]);
  }
  const seenInFile = new Set<string>();

  rows.forEach((raw, position) => {
    const index = position + 1;
    const rawName = typeof (raw as { name?: unknown })?.name === 'string' ? (raw as { name: string }).name : `Riga ${index}`;
    const parsed = importedProjectSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue.path.join('.');
      plan.skipped.push({ index, name: rawName, reason: field ? `${field}: ${issue.message}` : issue.message });
      return;
    }

    const project = parsed.data;
    const key = normalizeTitle(project.name);
    if (seenInFile.has(key)) {
      plan.skipped.push({ index, name: project.name, reason: 'titolo ripetuto nel file' });
      return;
    }
    seenInFile.add(key);

    const fields = providedFields(project);
    const matches = byTitle.get(key) ?? [];

    if (matches.length > 1) {
      plan.skipped.push({ index, name: project.name, reason: `${matches.length} progetti sul sito hanno questo titolo: aggiornalo a mano` });
      return;
    }

    if (matches.length === 1) {
      const match = matches[0];
      const { id: _id, imageVersion: _imageVersion, ...current } = match;
      // The title is only the matching key: the site keeps its own spelling and its visibility.
      const merged: ProjectFields = { ...current, ...fields, name: match.name, isPublic: match.isPublic };
      const changes: string[] = FIELDS
        .filter((field) => field in fields && !sameValue(current[field], merged[field]))
        .map((field) => FIELD_LABELS[field]);
      if (project.image) changes.push('Immagine');
      if (changes.length === 0) {
        plan.unchanged.push({ index, project });
      } else {
        plan.toUpdate.push({ index, project, existing: match, fields: merged, changes });
      }
      return;
    }

    // New project: the site needs a start date to show and sort it.
    if (!fields.startDate) {
      plan.skipped.push({ index, name: project.name, reason: 'nuovo progetto senza data di inizio' });
      return;
    }
    plan.toAdd.push({
      index,
      project,
      fields: {
        name: project.name,
        location: '',
        endDate: fields.startDate,
        client: '',
        service: '',
        amount: 0,
        category: '',
        status: fields.endDate ? 'Completato' : 'In Corso',
        typology: '',
        intervention: '',
        classification: '',
        description: '',
        works: [],
        ...fields,
        startDate: fields.startDate,
        // New projects stay private until reviewed in the admin, unless the file says otherwise.
        isPublic: project.isPublic ?? false,
      },
    });
  });

  return plan;
}
