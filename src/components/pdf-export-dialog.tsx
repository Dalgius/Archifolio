"use client";

import * as React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Project } from "@/types";

interface PdfExportDialogProps {
  projects: Project[];
}

export function PdfExportDialog({ projects }: PdfExportDialogProps) {
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(projects.map(p => p.id));
    } else {
      setSelectedProjects([]);
    }
  }
  
  const handleReset = () => {
    setSelectedProjects([]);
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="font-headline">Esporta Portfolio in PDF</DialogTitle>
        <DialogDescription>
          Seleziona i progetti da includere nell'esportazione PDF.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <h3 className="font-semibold">Seleziona Progetti</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            onCheckedChange={handleSelectAll}
            checked={selectedProjects.length > 0 && selectedProjects.length === projects.length}
            />
          <label htmlFor="select-all" className="text-sm font-medium leading-none">
            Seleziona Tutto
          </label>
        </div>
        <ScrollArea className="h-48 p-4 border rounded-md">
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center space-x-2">
                <Checkbox
                  id={project.id}
                  checked={selectedProjects.includes(project.id)}
                  onCheckedChange={() => handleSelectProject(project.id)}
                />
                <label htmlFor={project.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {project.name}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
       <DialogFooter>
        <Button variant="outline" onClick={handleReset}>Resetta</Button>
        <Button disabled={selectedProjects.length === 0}>Scarica PDF (presto disponibile)</Button>
      </DialogFooter>
    </DialogContent>
  );
}
