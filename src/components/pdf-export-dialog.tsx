
"use client";

import * as React from "react";
import { Loader2, Search } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Project, ProjectStatus } from "@/types";
import { generatePortfolioPDF, type PdfLayout } from "@/lib/pdf-generator";
import { fetchProjectImageData } from "@/lib/project-images";
import {
  PROJECT_SORT_LABELS, PROJECT_STATUSES, matchesSearch, projectYear, sortProjects, type ProjectSort,
} from "@/lib/project-filters";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

interface PdfExportDialogProps {
  projects: Project[];
}

const LAYOUTS: { value: PdfLayout; id: string }[] = [
  { value: "Completo", id: "layout-completo" },
  { value: "Compatto", id: "layout-compatto" },
  { value: "Solo Testo", id: "layout-solo-testo" },
];
const PDF_SORTS: ProjectSort[] = ['date-desc', 'date-asc', 'amount-desc', 'category-asc'];
const ANY = "any";

interface ExportSettings {
  title: string;
  layout: PdfLayout;
  sort: ProjectSort;
  includeHeader: boolean;
  includeSummary: boolean;
  statuses: ProjectStatus[];
  category: string;
  yearFrom: string;
  yearTo: string;
  onlyPublic: boolean;
  selected: string[];
}

const DEFAULT_SETTINGS: ExportSettings = {
  title: "Elenco lavori",
  layout: "Completo",
  sort: 'date-desc',
  includeHeader: true,
  includeSummary: false,
  statuses: [],
  category: ANY,
  yearFrom: ANY,
  yearTo: ANY,
  onlyPublic: false,
  selected: [],
};

// Remembered per browser between exports; storage can be unavailable (private mode).
const STORAGE_KEY = "gdastudio.pdfExport";

const loadSettings = (): ExportSettings => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const loadImageData = (project: Project) =>
  project.imageVersion ? fetchProjectImageData(project.id) : Promise.resolve(null);

export function PdfExportDialog({ projects }: PdfExportDialogProps) {
  const [settings, setSettings] = React.useState<ExportSettings>(DEFAULT_SETTINGS);
  const [search, setSearch] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => setSettings(loadSettings()), []);
  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Not persisted: the dialog still works with in-memory settings.
    }
  }, [settings]);

  const update = (patch: Partial<ExportSettings>) => setSettings((prev) => ({ ...prev, ...patch }));

  const categories = React.useMemo(
    () => Array.from(new Set(projects.map((p) => p.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'it')),
    [projects]
  );
  const years = React.useMemo(
    () => Array.from(new Set(projects.map(projectYear).filter((y): y is number => y !== null))).sort((a, b) => b - a),
    [projects]
  );

  const visibleProjects = React.useMemo(() => {
    const from = settings.yearFrom === ANY ? -Infinity : Number(settings.yearFrom);
    const to = settings.yearTo === ANY ? Infinity : Number(settings.yearTo);
    return sortProjects(projects.filter((project) => {
      const year = projectYear(project) ?? 0;
      return matchesSearch(project, search)
        && (settings.statuses.length === 0 || settings.statuses.includes(project.status))
        && (settings.category === ANY || project.category === settings.category)
        && year >= from && year <= to
        && (!settings.onlyPublic || project.isPublic);
    }), settings.sort);
  }, [projects, search, settings]);

  const selected = new Set(settings.selected);
  const projectsToExport = visibleProjects.filter((p) => selected.has(p.id));
  const allVisibleSelected = visibleProjects.length > 0 && projectsToExport.length === visibleProjects.length;

  const toggleProject = (projectId: string) => {
    update({
      selected: selected.has(projectId)
        ? settings.selected.filter((id) => id !== projectId)
        : [...settings.selected, projectId],
    });
  };

  // Acts only on the projects matching the current filters.
  const toggleAllVisible = (checked: boolean) => {
    const visibleIds = new Set(visibleProjects.map((p) => p.id));
    const others = settings.selected.filter((id) => !visibleIds.has(id));
    update({ selected: checked ? [...others, ...visibleIds] : others });
  };

  const toggleStatus = (status: ProjectStatus) => {
    update({
      statuses: settings.statuses.includes(status)
        ? settings.statuses.filter((s) => s !== status)
        : [...settings.statuses, status],
    });
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSearch("");
  };

  const handleExport = async () => {
    if (projectsToExport.length === 0) return;
    setIsGenerating(true);
    toast({ title: "Generazione PDF in corso...", description: "Potrebbe richiedere qualche momento." });
    try {
      await generatePortfolioPDF(projectsToExport, settings.layout, {
        title: settings.title,
        includeHeader: settings.includeHeader,
        includeSummary: settings.includeSummary,
        loadImageData,
      });
    } catch (error) {
      console.error("Failed to generate PDF", error);
      toast({ variant: "destructive", title: "Errore", description: "Impossibile generare il PDF." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-headline">Esporta Portfolio in PDF</DialogTitle>
        <DialogDescription>
          Scegli layout, opzioni e progetti da includere nell'esportazione PDF.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pdf-title">Titolo documento</Label>
            <Input id="pdf-title" value={settings.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Ordina per</Label>
            <Select value={settings.sort} onValueChange={(value) => update({ sort: value as ProjectSort })}>
              <SelectTrigger aria-label="Ordina per"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PDF_SORTS.map((option) => (
                  <SelectItem key={option} value={option}>{PROJECT_SORT_LABELS[option]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Layout</h3>
          <RadioGroup
            value={settings.layout}
            onValueChange={(value: string) => update({ layout: value as PdfLayout })}
            className="grid grid-cols-3 gap-2"
          >
            {LAYOUTS.map(({ value, id }) => (
              <div key={value}>
                <RadioGroupItem value={value} id={id} className="peer sr-only" />
                <Label
                  htmlFor={id}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  {value}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={settings.includeHeader} onCheckedChange={(c) => update({ includeHeader: Boolean(c) })} />
              Intestazione con logo e data
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={settings.includeSummary} onCheckedChange={(c) => update({ includeSummary: Boolean(c) })} />
              Riepilogo per categoria (n. lavori e importi)
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Filtri</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {PROJECT_STATUSES.map((status) => (
              <label key={status} className="flex items-center gap-2 text-sm">
                <Checkbox checked={settings.statuses.includes(status)} onCheckedChange={() => toggleStatus(status)} />
                {status}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={settings.onlyPublic} onCheckedChange={(c) => update({ onlyPublic: Boolean(c) })} />
              Solo pubblici
            </label>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Select value={settings.category} onValueChange={(value) => update({ category: value })}>
              <SelectTrigger aria-label="Categoria opere"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Tutte le categorie</SelectItem>
                {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={settings.yearFrom} onValueChange={(value) => update({ yearFrom: value })}>
              <SelectTrigger aria-label="Dall'anno"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Dall'anno: tutti</SelectItem>
                {years.map((year) => <SelectItem key={year} value={String(year)}>Dal {year}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={settings.yearTo} onValueChange={(value) => update({ yearTo: value })}>
              <SelectTrigger aria-label="All'anno"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All'anno: tutti</SelectItem>
                {years.map((year) => <SelectItem key={year} value={String(year)}>Al {year}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca progetto..."
              className="pl-9"
              aria-label="Cerca progetto"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={(checked) => toggleAllVisible(Boolean(checked))}
                disabled={visibleProjects.length === 0}
              />
              Seleziona tutti i progetti filtrati ({visibleProjects.length})
            </label>
            <span className="text-sm text-muted-foreground">{projectsToExport.length} da esportare</span>
          </div>
          <ScrollArea className="h-48 p-4 border rounded-md mt-2">
            <div className="space-y-2">
              {visibleProjects.map((project) => (
                <div key={project.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pdf-${project.id}`}
                    checked={selected.has(project.id)}
                    onCheckedChange={() => toggleProject(project.id)}
                  />
                  <label htmlFor={`pdf-${project.id}`} className="text-sm font-medium leading-none">
                    {project.name}
                    <span className="text-muted-foreground font-normal"> · {projectYear(project)} · {project.status}</span>
                  </label>
                </div>
              ))}
              {visibleProjects.length === 0 && (
                <p className="text-sm text-muted-foreground">Nessun progetto corrisponde ai filtri.</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleReset}>Resetta</Button>
        <Button onClick={handleExport} disabled={projectsToExport.length === 0 || isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            `Scarica PDF (${projectsToExport.length})`
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
