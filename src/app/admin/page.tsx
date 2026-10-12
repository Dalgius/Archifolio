
"use client";

import * as React from "react";
import {
  Plus,
  Download,
  FileText,
  Search,
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Project, ProjectFields, ProjectStatus } from "@/types";
import { useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { ProjectCard } from "@/components/project-card";
import { ProjectForm } from "@/components/project-form";
import { PdfExportDialog } from "@/components/pdf-export-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { seedProjects } from "@/lib/seed";
import {
  PROJECT_SORT_LABELS, PROJECT_STATUSES, matchesSearch, sortProjects, type ProjectSort,
} from "@/lib/project-filters";

const ADMIN_SORTS: ProjectSort[] = ['date-desc', 'date-asc', 'amount-desc', 'name-asc'];

export default function AdminPage() {
  const { projects, addProject, updateProject, setProjectVisibility, deleteProject, isInitialized } = useProjects();
  const { toast } = useToast();
  const [projectFormOpen, setProjectFormOpen] = React.useState(false);
  const [pdfExportOpen, setPdfExportOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<ProjectSort>('date-desc');

  const handleAddProject = async (fields: ProjectFields, newImage: string | null) => {
    await addProject(fields, newImage);
    setProjectFormOpen(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectFormOpen(true);
  };
  
  const handleUpdateProject = async (id: string, fields: ProjectFields, newImage: string | null) => {
    await updateProject(id, fields, newImage);
    setEditingProject(null);
    setProjectFormOpen(false);
  }

  const handleDeleteInitiated = (project: Project) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!projectToDelete) return;
    setDeleteConfirmOpen(false);
    setProjectToDelete(null);
    try {
      await deleteProject(projectToDelete.id);
      toast({ title: "Progetto eliminato." });
    } catch {
      // Error toast is shown by the useProjects hook
    }
  };

  const handleToggleVisibility = async (project: Project) => {
    try {
      await setProjectVisibility(project.id, !project.isPublic);
      toast({ title: project.isPublic ? "Progetto reso privato." : "Progetto reso pubblico." });
    } catch {
      // Error toast is shown by the useProjects hook
    }
  };

  const [isSeeding, setIsSeeding] = React.useState(false);
  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedProjects();
      toast({ title: "Progetti di esempio caricati." });
    } catch {
      toast({ variant: "destructive", title: "Errore", description: "Impossibile caricare i progetti di esempio." });
    } finally {
      setIsSeeding(false);
    }
  };

  const typologySuggestions = React.useMemo(
    () => Array.from(new Set(projects.map((p) => p.typology).filter(Boolean))).sort(),
    [projects]
  );

  const visibleProjects = React.useMemo(
    () => sortProjects(projects.filter((project) => matchesSearch(project, search)), sort),
    [projects, search, sort]
  );

  const filteredProjects = (status: ProjectStatus | "All") => {
    if (status === "All") return visibleProjects;
    return visibleProjects.filter((project) => project.status === status);
  };

  const gridProps = {
    onEdit: handleEditProject,
    onDelete: handleDeleteInitiated,
    onToggleVisibility: handleToggleVisibility,
    emptyMessage: search ? "Nessun progetto corrisponde alla ricerca." : "Inizia aggiungendo un nuovo progetto.",
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
                typologySuggestions={typologySuggestions}
                onClose={() => setProjectFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto md:p-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca per nome, località, committente, categoria..."
              className="pl-9"
              aria-label="Cerca progetti"
            />
          </div>
          <Select value={sort} onValueChange={(value) => setSort(value as ProjectSort)}>
            <SelectTrigger className="sm:w-56" aria-label="Ordina progetti">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADMIN_SORTS.map((option) => (
                <SelectItem key={option} value={option}>{PROJECT_SORT_LABELS[option]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="All" className="w-full">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="All">Tutti ({filteredProjects("All").length})</TabsTrigger>
            {PROJECT_STATUSES.map((status) => (
              <TabsTrigger key={status} value={status}>
                {status} ({filteredProjects(status).length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="All">
            <ProjectGrid projects={filteredProjects("All")} {...gridProps} />
            {projects.length === 0 && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={handleSeed} disabled={isSeeding}>
                  {isSeeding ? "Caricamento..." : "Carica progetti di esempio"}
                </Button>
              </div>
            )}
          </TabsContent>

          {PROJECT_STATUSES.map((status) => (
            <TabsContent key={status} value={status}>
              <ProjectGrid projects={filteredProjects(status)} {...gridProps} />
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

interface ProjectGridProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onToggleVisibility: (project: Project) => void;
  emptyMessage: string;
}

function ProjectGrid({ projects, onEdit, onDelete, onToggleVisibility, emptyMessage }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center border-2 border-dashed rounded-lg">
        <FileText className="w-12 h-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold font-headline">Nessun Progetto Trovato</h3>
        <p className="text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 mt-6 md:grid-cols-4 lg:grid-cols-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onEdit={onEdit} onDelete={onDelete} onToggleVisibility={onToggleVisibility} />
      ))}
    </div>
  );
}
