
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
        const storedProjects = JSON.parse(storedItem);
        // Ensure all projects have the new fields to prevent crashes from old data.
        const migratedProjects = storedProjects.map((p: any): Project => ({
          id: p.id!,
          name: p.name!,
          image: p.image!,
          location: p.location!,
          startDate: p.startDate || p.completionDate || '2023-01-01',
          endDate: p.endDate || p.completionDate || '2023-01-01',
          status: p.status!,
          isPublic: p.isPublic ?? false,
          works: p.works || [],
          amount: p.amount ?? 0,
          client: p.client || '',
          classification: p.classification || '',
          category: p.category || '',
          typology: p.typology || '',
          intervention: p.intervention || '',
          service: p.service || '',
          description: p.description || '',
        }));
         // Remove the old completionDate property if it exists
        migratedProjects.forEach(p => delete (p as any).completionDate);

        setProjects(migratedProjects);
        // Re-save the migrated data to prevent running migration every time
        window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(migratedProjects));
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
