
"use client";

import * as React from "react";
import {
  Plus,
  Download,
  FileText,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import type { Project, ProjectStatus } from "@/types";
import { useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { ProjectCard } from "@/components/project-card";
import { ProjectForm } from "@/components/project-form";
import { PdfExportDialog } from "@/components/pdf-export-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const { projects, addProject, updateProject, deleteProject, isInitialized } = useProjects();
  const { toast } = useToast();
  const [projectFormOpen, setProjectFormOpen] = React.useState(false);
  const [pdfExportOpen, setPdfExportOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);

  const handleAddProject = async (project: Omit<Project, 'id'>) => {
    await addProject(project);
    setProjectFormOpen(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectFormOpen(true);
  };
  
  const handleUpdateProject = async (updatedProject: Project) => {
    await updateProject(updatedProject);
    setEditingProject(null);
    setProjectFormOpen(false);
  }

  const handleDeleteInitiated = (project: Project) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      toast({ title: "Progetto eliminato." });
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    }
  };

  const projectStatuses: ProjectStatus[] = [
    "Completato",
    "In Corso",
    "Concettuale",
    "Da fare",
  ];

  const filteredProjects = (status: ProjectStatus | "All") => {
    if (status === "All") return projects;
    return projects.filter((project) => project.status === status);
  };

  if (!isInitialized) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b">
           <Skeleton className="h-8 w-64" />
           <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-36" />
           </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

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
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle className="font-headline">{editingProject ? 'Modifica Progetto' : 'Aggiungi Nuovo Progetto'}</DialogTitle>
                <DialogDescription>
                  Compila i dettagli del tuo progetto di architettura.
                </DialogDescription>
              </DialogHeader>
              <ProjectForm
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                projectToEdit={editingProject}
                onClose={() => setProjectFormOpen(false)}
              />
            </DialogContent>
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
            <ProjectGrid projects={filteredProjects("All")} onEdit={handleEditProject} onDelete={handleDeleteInitiated} />
          </TabsContent>

          {projectStatuses.map((status) => (
            <TabsContent key={status} value={status}>
              <ProjectGrid projects={filteredProjects(status)} onEdit={handleEditProject} onDelete={handleDeleteInitiated} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
      
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Il progetto "{projectToDelete?.name}" verrà eliminato definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirmed} 
              className={buttonVariants({ variant: "destructive" })}>
                Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProjectGrid({ projects, onEdit, onDelete }: { projects: Project[], onEdit: (project: Project) => void, onDelete: (project: Project) => void }) {
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
    <div className="grid grid-cols-2 gap-4 mt-6 md:grid-cols-4 lg:grid-cols-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onEdit={onEdit} onDelete={onDelete} variant="default" />
      ))}
    </div>
  );
}
