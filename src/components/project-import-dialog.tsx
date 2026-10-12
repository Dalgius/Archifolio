"use client";

import * as React from "react";
import { FileJson, Loader2 } from "lucide-react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Project, ProjectFields } from "@/types";
import { compressDataUrl } from "@/lib/image-compression";
import { parseImportFile, planImport, type ImportPlan } from "@/lib/project-import";

interface ProjectImportDialogProps {
  projects: Project[];
  addProject: (fields: ProjectFields, newImage: string | null) => Promise<void>;
  updateProject: (id: string, fields: ProjectFields, newImage: string | null) => Promise<void>;
}

type Result = { added: number; updated: number; failed: string[] };

const sectionTitle = "text-sm font-semibold";

export function ProjectImportDialog({ projects, addProject, updateProject }: ProjectImportDialogProps) {
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [plan, setPlan] = React.useState<ImportPlan | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = React.useState<Result | null>(null);
  const isRunning = progress !== null && result === null;

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setFileName(file.name);
    setPlan(null);
    setResult(null);
    setProgress(null);
    setError(null);
    try {
      setPlan(planImport(parseImportFile(await file.text()), projects));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // Writes one project at a time, so a failure only affects its own row.
  const handleImport = async () => {
    if (!plan) return;
    const total = plan.toAdd.length + plan.toUpdate.length;
    const outcome: Result = { added: 0, updated: 0, failed: [] };
    setProgress({ done: 0, total });

    const image = async (dataUrl: string | undefined) => (dataUrl ? compressDataUrl(dataUrl) : null);
    let done = 0;
    for (const row of plan.toAdd) {
      try {
        await addProject(row.fields, await image(row.project.image));
        outcome.added++;
      } catch {
        outcome.failed.push(row.project.name);
      }
      setProgress({ done: ++done, total });
    }
    for (const row of plan.toUpdate) {
      try {
        await updateProject(row.existing.id, row.fields, await image(row.project.image));
        outcome.updated++;
      } catch {
        outcome.failed.push(row.project.name);
      }
      setProgress({ done: ++done, total });
    }
    setResult(outcome);
  };

  const pendingCount = plan ? plan.toAdd.length + plan.toUpdate.length : 0;

  return (
    <DialogContent
      className="sm:max-w-3xl"
      onInteractOutside={(e) => isRunning && e.preventDefault()}
      onEscapeKeyDown={(e) => isRunning && e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle className="font-headline">Importa progetti</DialogTitle>
        <DialogDescription>
          Carica un file <code>progetti-import.json</code>. I progetti vengono abbinati per titolo: quelli esistenti
          vengono aggiornati, i nuovi aggiunti come privati. Nessun progetto viene eliminato.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild disabled={isRunning}>
            <label className="cursor-pointer">
              <FileJson className="mr-2 h-4 w-4" />
              Scegli file
              <input type="file" accept="application/json,.json" className="sr-only" onChange={handleFile} disabled={isRunning} />
            </label>
          </Button>
          {fileName && <span className="truncate text-sm text-muted-foreground">{fileName}</span>}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {plan && !result && (
          <ScrollArea className="h-80 rounded-md border p-4">
            <div className="space-y-5">
              <section>
                <h3 className={sectionTitle}>Nuovi ({plan.toAdd.length})</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {plan.toAdd.map((row) => (
                    <li key={row.index}>
                      {row.project.name}
                      <span className="text-muted-foreground">
                        {row.project.image ? " · con immagine" : " · senza immagine"}
                        {row.fields.isPublic ? " · pubblico" : " · privato"}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className={sectionTitle}>Da aggiornare ({plan.toUpdate.length})</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {plan.toUpdate.map((row) => (
                    <li key={row.index}>
                      {row.existing.name}
                      <span className="text-muted-foreground"> · {row.changes.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              </section>
              {plan.unchanged.length > 0 && (
                <section>
                  <h3 className={sectionTitle}>Già aggiornati ({plan.unchanged.length})</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.unchanged.map((row) => row.project.name).join(" · ")}
                  </p>
                </section>
              )}
              {plan.skipped.length > 0 && (
                <section>
                  <h3 className={`${sectionTitle} text-destructive`}>Saltati ({plan.skipped.length})</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {plan.skipped.map((row) => (
                      <li key={row.index}>
                        <span className="text-muted-foreground">#{row.index}</span> {row.name}
                        <span className="text-destructive"> · {row.reason}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </ScrollArea>
        )}

        {progress && (
          <div className="space-y-2">
            <Progress value={progress.total ? (progress.done / progress.total) * 100 : 100} />
            <p className="text-sm text-muted-foreground">
              {result
                ? `Fatto: ${result.added} aggiunti, ${result.updated} aggiornati${result.failed.length ? `, ${result.failed.length} non riusciti (${result.failed.join(", ")})` : ""}.`
                : `Importazione ${progress.done} di ${progress.total}...`}
            </p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={handleImport} disabled={!plan || pendingCount === 0 || isRunning || result !== null}>
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importazione...
            </>
          ) : (
            `Importa (${plan?.toAdd.length ?? 0} nuovi, ${plan?.toUpdate.length ?? 0} aggiornamenti)`
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
