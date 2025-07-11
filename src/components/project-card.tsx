
"use client";

import Image from "next/image";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
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
import { Button } from "./ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";


interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  priority?: boolean;
  variant?: 'default' | 'compact';
}

export function ProjectCard({ project, onEdit, onDelete, priority = false, variant = 'default' }: ProjectCardProps) {
  
  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden transition-all duration-300 ease-in-out h-full flex flex-col group border-0 rounded-none">
        <Image
            src={project.image}
            alt={project.name}
            width={600}
            height={400}
            className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
            data-ai-hint="architecture design"
            priority={priority}
        />
        <CardContent className="p-4 flex flex-col justify-end h-full absolute bottom-0 w-full text-white bg-gradient-to-t from-black/60 to-transparent">
          <h3 className="text-lg font-bold uppercase leading-tight">{project.name}</h3>
        </CardContent>
      </Card>
    );
  }

  // 'default' variant for admin page
  const startDateFormatted = format(parseISO(project.startDate), 'dd/MM/yyyy');
  const amountFormatted = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(project.amount);

  return (
    <TooltipProvider>
      <Card className="overflow-hidden transition-all duration-300 ease-in-out h-full flex flex-col group">
        <div className="relative">
            <Image
              src={project.image}
              alt={project.name}
              width={600}
              height={400}
              className="object-cover w-full h-48"
              data-ai-hint="architecture design"
              priority={priority}
          />
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
                <DropdownMenuItem onClick={() => onDelete?.(project)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Elimina</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
            <h3 className="text-sm font-bold uppercase leading-tight mb-1">{project.name}</h3>
            <p className="text-sm font-semibold text-muted-foreground mb-2">{project.location}</p>
            <div className="space-y-1 text-xs text-muted-foreground/80 flex-grow mt-auto">
                <p><strong className="font-medium text-muted-foreground">Committente:</strong> {project.client}</p>
                <p><strong className="font-medium text-muted-foreground">Inizio:</strong> {startDateFormatted}</p>
                <p><strong className="font-medium text-muted-foreground">Importo:</strong> {amountFormatted}</p>
                <p><strong className="font-medium text-muted-foreground">Prestazione:</strong> {project.service}</p>
            </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
