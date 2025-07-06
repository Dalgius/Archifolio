
'use client';

import * as React from 'react';
import type { Project } from '@/types';
import { projects as initialProjects } from '@/lib/data';

const PROJECTS_STORAGE_KEY = 'archifolio-projects';

// This hook manages project state and syncs it with localStorage.
export function useProjects() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load projects from localStorage on initial render
  React.useEffect(() => {
    try {
      const storedItem = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedItem) {
        setProjects(JSON.parse(storedItem));
      } else {
        // If nothing in storage, use initial data and set it
        setProjects(initialProjects);
        window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(initialProjects));
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
      setProjects(initialProjects);
    }
    setIsInitialized(true);
  }, []);

  const updateAndPersistProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    try {
      window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(newProjects));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  };

  const addProject = (project: Project) => {
    updateAndPersistProjects([...projects, project]);
  };

  const updateProject = (updatedProject: Project) => {
    updateAndPersistProjects(
      projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  const deleteProject = (projectId: string) => {
    updateAndPersistProjects(projects.filter((p) => p.id !== projectId));
  };

  return {
    projects,
    isInitialized,
    addProject,
    updateProject,
    deleteProject,
  };
}
