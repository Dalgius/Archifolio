
'use client';

import * as React from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import type { Project } from '@/types';
import { db } from '@/lib/firebase';
import { useToast } from './use-toast';

// This hook manages project state and syncs it with Firebase Firestore.
export function useProjects() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const { toast } = useToast();

  // Load projects from Firestore on initial render
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsCollection = collection(db, 'projects');
        const projectSnapshot = await getDocs(projectsCollection);
        const projectList = projectSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Project));
        setProjects(projectList);
      } catch (error) {
        console.error("Error fetching projects from Firestore:", error);
        toast({
          variant: "destructive",
          title: "Errore di caricamento",
          description: "Impossibile caricare i progetti dal database.",
        });
      } finally {
        setIsInitialized(true);
      }
    };

    fetchProjects();
  }, [toast]);

  const addProject = async (projectData: Omit<Project, 'id'>) => {
    try {
      // Create a new document reference with a unique ID
      const newProjectRef = doc(collection(db, 'projects'));
      const projectId = newProjectRef.id;

      // Set the document data in Firestore
      await setDoc(newProjectRef, projectData);

      // Update the local state
      const newProject = { id: projectId, ...projectData } as Project;
      setProjects(prevProjects => [...prevProjects, newProject]);
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
          variant: "destructive",
          title: "Errore di salvataggio",
          description: "Impossibile aggiungere il nuovo progetto.",
        });
    }
  };

  const updateProject = async (updatedProject: Project) => {
    const { id, ...projectData } = updatedProject;
    const projectRef = doc(db, 'projects', id);

    try {
      await updateDoc(projectRef, projectData);
      setProjects(prevProjects =>
        prevProjects.map(p => (p.id === id ? updatedProject : p))
      );
    } catch (error) {
       console.error("Error updating project:", error);
       toast({
          variant: "destructive",
          title: "Errore di aggiornamento",
          description: "Impossibile aggiornare il progetto.",
        });
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      // Delete the Firestore document
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
      
      // Update local state
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
    } catch (error) {
        console.error("Error deleting project:", error);
        toast({
          variant: "destructive",
          title: "Errore di eliminazione",
          description: "Impossibile eliminare il progetto.",
        });
    }
  };

  return {
    projects,
    isInitialized,
    addProject,
    updateProject,
    deleteProject,
  };
}
