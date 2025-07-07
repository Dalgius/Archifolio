
'use client';

import * as React from 'react';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
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
    const projectsCollection = collection(db, 'projects');
    
    const unsubscribe = onSnapshot(projectsCollection, (snapshot) => {
      const projectList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Project));
      setProjects(projectList);
      setIsInitialized(true);
    }, (error) => {
      console.error("Error fetching projects with listener:", error);
      toast({
        variant: "destructive",
        title: "Errore di connessione",
        description: "Impossibile caricare i progetti in tempo reale.",
      });
      setIsInitialized(true); // Set to true to unblock UI even on error
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [toast]);

  const addProject = async (projectData: Omit<Project, 'id'>) => {
    try {
      // Create a new document reference with a unique ID
      const newProjectRef = doc(collection(db, 'projects'));
      
      // Set the document data in Firestore. The onSnapshot listener will update the UI.
      await setDoc(newProjectRef, projectData);
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
      // The onSnapshot listener will update the UI.
      await updateDoc(projectRef, projectData);
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
      const projectRef = doc(db, 'projects', projectId);
      // The onSnapshot listener will update the UI.
      await deleteDoc(projectRef);
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
