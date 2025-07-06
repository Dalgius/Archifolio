"use client";

import * as React from "react";
import {
  Plus,
  Download,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import type { Project, ProjectStatus } from "@/types";
import { projects as initialProjects } from "@/lib/data";
import { ProjectCard } from "@/components/project-card";
import { ProjectForm } from "@/components/project-form";
import { PdfExportDialog } from "@/components/pdf-export-dialog";

export default function AdminPage() {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects);
  const [projectFormOpen, setProjectFormOpen] = React.useState(false);
  const [pdfExportOpen, setPdfExportOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);

  const handleAddProject = (project: Project) => {
    setProjects((prev) => [...prev, project]);
    setProjectFormOpen(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectFormOpen(true);
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setEditingProject(null);
    setProjectFormOpen(false);
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const projectStatuses: ProjectStatus[] = [
    "Completato",
    "In Corso",
    "Concettuale",
  ];

  const filteredProjects = (status: ProjectStatus | "All") => {
    if (status === "All") return projects;
    return projects.filter((project) => project.status === status);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <h2 className="text-2xl font-bold font-headline">Gestisci Portfolio</h2>
        <div className="flex gap-2">
          <Dialog open={pdfExportOpen} onOpenChange={setPdfExportOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="w-4 h-4" />
                    <span className="sr-only">Esporta PDF</span>
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Esporta in PDF</TooltipContent>
            </Tooltip>
            <PdfExportDialog projects={projects} />
          </Dialog>

          <Dialog open={projectFormOpen} onOpenChange={(isOpen) => {
            setProjectFormOpen(isOpen);
            if (!isOpen) setEditingProject(null);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Progetto
              </Button>
            </DialogTrigger>
            <ProjectForm
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              projectToEdit={editingProject}
              onClose={() => setProjectFormOpen(false)}
            />
          </Dialog>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto md:p-6">
        <Tabs defaultValue="All" className="w-full">
          <TabsList>
            <TabsTrigger value="All">Tutti</TabsTrigger>
            {projectStatuses.map((status) => (
              <TabsTrigger key={status} value={status}>
                {status}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="All">
            <ProjectGrid projects={filteredProjects("All")} onEdit={handleEditProject} onDelete={handleDeleteProject} />
          </TabsContent>

          {projectStatuses.map((status) => (
            <TabsContent key={status} value={status}>
              <ProjectGrid projects={filteredProjects(status)} onEdit={handleEditProject} onDelete={handleDeleteProject} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}

function ProjectGrid({ projects, onEdit, onDelete }: { projects: Project[], onEdit: (project: Project) => void, onDelete: (id: string) => void }) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center border-2 border-dashed rounded-lg">
        <FileText className="w-12 h-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold font-headline">Nessun Progetto Trovato</h3>
        <p className="text-muted-foreground">
          Inizia aggiungendo un nuovo progetto.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
