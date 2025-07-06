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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generatePdfContentAction } from "@/lib/actions";
import type { Project } from "@/types";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface PdfExportDialogProps {
  projects: Project[];
}

type PdfContent = Record<string, string | null>;

export function PdfExportDialog({ projects }: PdfExportDialogProps) {
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);
  const [prompt, setPrompt] = React.useState<string>("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedContent, setGeneratedContent] = React.useState<PdfContent[] | null>(null);
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

  const handleGenerate = async () => {
    if (selectedProjects.length === 0) {
      toast({
        variant: "destructive",
        title: "No Projects Selected",
        description: "Please select at least one project to export.",
      });
      return;
    }
    if (!prompt) {
      toast({
        variant: "destructive",
        title: "Prompt is required",
        description: "Please provide a prompt to filter the project details.",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);
    try {
      const projectsToExport = projects.filter((p) =>
        selectedProjects.includes(p.id)
      );
      const result = await generatePdfContentAction(projectsToExport, prompt);
      if (result.success && result.data) {
        setGeneratedContent(result.data);
        toast({ title: "PDF content preview generated!" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: (error as Error).message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle className="font-headline">Export Portfolio to PDF</DialogTitle>
        <DialogDescription>
          Select projects and provide a prompt to tailor the content of your PDF export.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold">1. Select Projects</h3>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              onCheckedChange={handleSelectAll}
              checked={selectedProjects.length > 0 && selectedProjects.length === projects.length}
              />
            <label htmlFor="select-all" className="text-sm font-medium leading-none">
              Select All
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
          
          <h3 className="font-semibold mt-4">2. Set Filtering Prompt</h3>
          <Textarea
            placeholder="e.g., 'Only include residential projects completed in the last 2 years.' The AI will decide which details to show."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />

           <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Preview...
              </>
            ) : (
              "Generate Preview"
            )}
          </Button>

        </div>
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold">3. Preview PDF Content</h3>
          <Card className="flex-1">
            <CardContent className="p-0">
              <ScrollArea className="h-[25.5rem] p-4">
                {generatedContent ? (
                    <div className="space-y-6">
                    {generatedContent.map((content, index) => (
                        <div key={index}>
                        {Object.entries(content).map(([key, value]) => (
                            value && (
                            <div key={key} className="text-sm mb-1">
                                <span className="font-semibold">{key}:</span> {value}
                            </div>
                            )
                        ))}
                        {index < generatedContent.length - 1 && <Separator className="my-4"/>}
                        </div>
                    ))}
                    </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    {isGenerating ? "Generating..." : "Preview will appear here."}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
       <DialogFooter>
        <Button variant="outline" onClick={() => {
            setSelectedProjects([]);
            setPrompt("");
            setGeneratedContent(null);
        }}>Reset</Button>
        <Button disabled={!generatedContent}>Download PDF (coming soon)</Button>
      </DialogFooter>
    </DialogContent>
  );
}
