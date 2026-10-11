
"use client";

import { Edit, Eye, EyeOff, MoreVertical, Trash2 } from "lucide-react";
import type { Project } from "@/types";
import { format, parseISO } from 'date-fns';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { ProjectImage } from "./project-image";


interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onToggleVisibility?: (project: Project) => void;
  priority?: boolean;
}

export function ProjectCard({ project, onEdit, onDelete, onToggleVisibility, priority = false }: ProjectCardProps) {
  const startDateFormatted = format(parseISO(project.startDate), 'dd/MM/yyyy');
  const amountFormatted = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(project.amount);

  return (
    <Card className="overflow-hidden transition-all duration-300 ease-in-out h-full flex flex-col group">
      <div className="relative h-32">
        <ProjectImage
          project={project}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 17vw"
          priority={priority}
          fromFirestore
        />
        {!project.isPublic && (
          <Badge variant="secondary" className="absolute top-2 left-2 gap-1 bg-black/60 text-white hover:bg-black/60">
            <EyeOff className="h-3 w-3" />
            Privato
          </Badge>
        )}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/75 text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(project)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Modifica</span>
              </DropdownMenuItem>
              {onToggleVisibility && (
                <DropdownMenuItem onClick={() => onToggleVisibility(project)}>
                  {project.isPublic ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  <span>{project.isPublic ? "Rendi privato" : "Rendi pubblico"}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete?.(project)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Elimina</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardContent className="p-3 flex-grow flex flex-col">
          <h3 className="text-xs font-bold uppercase leading-tight mb-1 truncate">{project.name}</h3>
          <p className="text-sm font-semibold text-muted-foreground mb-2">{project.location}</p>
          <div className="space-y-1 text-xs text-muted-foreground/80 flex-grow mt-auto">
              <p><strong className="font-medium text-muted-foreground">Committente:</strong> {project.client}</p>
              <p><strong className="font-medium text-muted-foreground">Inizio:</strong> {startDateFormatted}</p>
              <p><strong className="font-medium text-muted-foreground">Importo:</strong> {amountFormatted}</p>
              <p><strong className="font-medium text-muted-foreground">Prestazione:</strong> {project.service}</p>
          </div>
      </CardContent>
    </Card>
  );
}
