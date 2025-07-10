
"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
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
import { generatePortfolioPDF, type PdfLayout } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

interface PdfExportDialogProps {
  projects: Project[];
}

export function PdfExportDialog({ projects }: PdfExportDialogProps) {
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);
  const [layout, setLayout] = React.useState<PdfLayout>("Completo");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();

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
    setLayout("Completo");
  }

  const handleExport = async () => {
    if (selectedProjects.length === 0) return;
    setIsGenerating(true);
    toast({ title: "Generazione PDF in corso...", description: "Potrebbe richiedere qualche momento." });
    try {
        const projectsToExport = projects.filter(p => selectedProjects.includes(p.id));
        await generatePortfolioPDF(projectsToExport, layout);
    } catch (error) {
        console.error("Failed to generate PDF", error);
        toast({ variant: "destructive", title: "Errore", description: "Impossibile generare il PDF." });
    } finally {
        setIsGenerating(false);
    }
};

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="font-headline">Esporta Portfolio in PDF</DialogTitle>
        <DialogDescription>
          Seleziona i progetti e il layout da includere nell'esportazione PDF.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
         <div>
          <h3 className="font-semibold mb-2">Seleziona Layout</h3>
           <RadioGroup
            value={layout}
            onValueChange={(value: string) => setLayout(value as PdfLayout)}
            className="grid grid-cols-3 gap-2"
          >
            <div>
              <RadioGroupItem value="Completo" id="layout-completo" className="peer sr-only" />
              <Label
                htmlFor="layout-completo"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                Completo
              </Label>
            </div>
            <div>
              <RadioGroupItem value="Compatto" id="layout-compatto" className="peer sr-only" />
              <Label
                htmlFor="layout-compatto"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                Compatto
              </Label>
            </div>
             <div>
              <RadioGroupItem value="Solo Testo" id="layout-solo-testo" className="peer sr-only" />
              <Label
                htmlFor="layout-solo-testo"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                Solo Testo
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
            <h3 className="font-semibold">Seleziona Progetti</h3>
            <div className="flex items-center space-x-2 mt-2">
            <Checkbox
                id="select-all"
                onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                checked={projects.length > 0 && selectedProjects.length === projects.length}
                />
            <label htmlFor="select-all" className="text-sm font-medium leading-none">
                Seleziona Tutto
            </label>
            </div>
            <ScrollArea className="h-48 p-4 border rounded-md mt-2">
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
      </div>
       <DialogFooter>
        <Button variant="outline" onClick={handleReset}>Resetta</Button>
        <Button onClick={handleExport} disabled={selectedProjects.length === 0 || isGenerating}>
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                </>
            ) : (
                "Scarica PDF"
            )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
