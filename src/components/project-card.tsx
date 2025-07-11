
"use client";

import Image from "next/image";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import type { Project } from "@/types";
import { format, parseISO } from 'date-fns';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";


interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  priority?: boolean;
  variant?: 'default' | 'compact';
}

export function ProjectCard({ project, onEdit, onDelete, priority = false, variant = 'default' }: ProjectCardProps) {

  const isPublicView = !onEdit && !onDelete;

  if (variant === 'compact') {
      const statusColors: { [key in Project["status"]]: string } = {
        "Completato": "bg-green-100 text-green-800 border-green-200",
        "In Corso": "bg-blue-100 text-blue-800 border-blue-200",
        "Concettuale": "bg-purple-100 text-purple-800 border-purple-200",
        "Da fare": "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
      
      const cardContent = (
         <Card className="overflow-hidden transition-all duration-300 ease-in-out h-full flex flex-col group">
            <div className="relative">
                 <Image
                    src={project.image}
                    alt={project.name}
                    width={600}
                    height={400}
                    className="object-cover w-full h-32"
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
            <CardContent className="p-3 flex-grow flex flex-col">
                 <h3 className="text-xs font-bold uppercase flex-1 pr-2 leading-tight">{project.name}</h3>
                 <Badge
                    variant="outline"
                    className={`text-xs whitespace-nowrap mt-2 self-start ${statusColors[project.status]}`}
                >
                    {project.status}
                </Badge>
            </CardContent>
         </Card>
      );

       return <TooltipProvider>{cardContent}</TooltipProvider>;
  }

  const startDateFormatted = format(parseISO(project.startDate), 'dd/MM/yyyy');
  const amountFormatted = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(project.amount);

  return (
      <Card className="overflow-hidden transition-all duration-300 ease-in-out h-full flex flex-col group relative text-white">
        <Image
            src={project.image}
            alt={project.name}
            width={600}
            height={400}
            className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
            data-ai-hint="architecture design"
            priority={priority}
        />
        <div className="absolute inset-0 bg-black/50 opacity-100 group-hover:opacity-90 transition-opacity duration-300 p-4 flex flex-col">
            <div className="flex-grow">
              <h3 className="text-lg font-bold uppercase leading-tight">{project.name}</h3>
            </div>
            <div className="space-y-1 text-sm text-neutral-200">
                <p>{project.client}</p>
                <p>{startDateFormatted}</p>
                <p>{amountFormatted}</p>
                <p>{project.location}</p>
                <p>{project.service}</p>
            </div>
            {project.classification && (
                <Badge variant="secondary" className="mt-3 self-start bg-neutral-700 text-white border-neutral-600">
                    {project.classification}
                </Badge>
            )}
        </div>
      </Card>
  );
}
