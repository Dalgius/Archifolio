
"use client";

import Image from "next/image";
import { Edit, MoreVertical, Trash2, MapPin } from "lucide-react";
import type { Project } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  const statusColors: { [key in Project["status"]]: string } = {
    "Completato": "bg-green-100 text-green-800 border-green-200",
    "In Corso": "bg-blue-100 text-blue-800 border-blue-200",
    "Concettuale": "bg-purple-100 text-purple-800 border-purple-200",
    "Da fare": "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  const isPublicView = !onEdit && !onDelete;

  const cardContent = (
      <Card className="overflow-hidden transition-all duration-300 ease-in-out h-full flex flex-col hover:shadow-xl group">
        <CardHeader className="p-0 relative">
          <Image
            src={project.image}
            alt={project.name}
            width={600}
            height={400}
            className={cn(
              "object-cover w-full transition-transform duration-300 ease-in-out group-hover:scale-105",
              variant === 'compact' ? 'h-32' : 'h-48'
            )}
            data-ai-hint="architecture design"
            priority={priority}
          />
          {!isPublicView && (
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
          )}
        </CardHeader>
        <CardContent className={cn("flex-grow flex flex-col", variant === 'compact' ? 'p-3' : 'p-4')}>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className={cn(
                "leading-tight font-headline uppercase flex-1 pr-2",
                 variant === 'compact' ? 'text-xs' : 'text-sm font-bold'
              )}>
              {project.name}
            </CardTitle>
            <Badge
                variant="outline"
                className={`text-xs whitespace-nowrap ${statusColors[project.status]}`}
            >
                {project.status}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>{project.location}</span>
          </div>
          
        </CardContent>
      </Card>
  );
  
  if (isPublicView) {
    return cardContent;
  }

  return (
    <TooltipProvider>
      {cardContent}
    </TooltipProvider>
  )
}
