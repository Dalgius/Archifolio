
"use client";

import Image from "next/image";
import { Edit, MoreVertical, Trash2, Eye, EyeOff, MapPin } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";


interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const statusColors: { [key in Project["status"]]: string } = {
    "Completato": "bg-green-500 hover:bg-green-600",
    "In Corso": "bg-blue-500 hover:bg-blue-600",
    "Concettuale": "bg-purple-500 hover:bg-purple-600",
    "Da fare": "bg-yellow-500 hover:bg-yellow-600",
  };

  const isPublicView = !onEdit && !onDelete;

  const cardContent = (
      <Card className="overflow-hidden transition-all duration-300 ease-in-out h-full flex flex-col group-hover:shadow-xl">
        <CardHeader className="p-0 relative">
          <Image
            src={project.image}
            alt={project.name}
            width={600}
            height={400}
            className="object-cover w-full h-48 transition-transform duration-300 ease-in-out group-hover:scale-105"
            data-ai-hint="architecture design"
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
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-bold leading-tight font-headline pr-2">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
                {!isPublicView && (
                    <Tooltip>
                        <TooltipTrigger>
                            {project.isPublic ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{project.isPublic ? "Visibile al pubblico" : "Nascosto al pubblico"}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
                <Badge
                    className={`text-white text-xs ${statusColors[project.status]}`}
                >
                    {project.status}
                </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1 mb-2">
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
