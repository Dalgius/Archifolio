"use client";

import Image from "next/image";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
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

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const statusColors: { [key in Project["status"]]: string } = {
    Completed: "bg-green-500 hover:bg-green-600",
    "In Progress": "bg-blue-500 hover:bg-blue-600",
    Conceptual: "bg-purple-500 hover:bg-purple-600",
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 ease-in-out group hover:shadow-xl">
      <CardHeader className="p-0 relative">
        <Image
          src={project.image}
          alt={project.name}
          width={600}
          height={400}
          className="object-cover w-full h-48 transition-transform duration-300 ease-in-out group-hover:scale-105"
          data-ai-hint="architecture design"
        />
        <div className="absolute top-2 right-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/75 text-white">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(project)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <CardTitle className="mb-2 text-lg font-bold leading-tight font-headline">
            {project.name}
          </CardTitle>
          <Badge
            className={`text-white text-xs ${statusColors[project.status]}`}
          >
            {project.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
      </CardContent>
    </Card>
  );
}
