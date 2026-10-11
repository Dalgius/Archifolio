
'use client';

import * as React from 'react';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import type { Project } from '@/types';
import { db } from '@/lib/firebase';
import { useToast } from './use-toast';

const sortByStartDateDesc = (a: Project, b: Project) =>
  new Date(b.startDate).getTime() - new Date(a.startDate).getTime();

// Admin hook: manages all projects (public and private) and syncs them with Firestore.
// Firestore rules allow this only for the authenticated admin.
export function useProjects() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projectList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Project))
        .sort(sortByStartDateDesc);
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

  // The mutations below show an error toast and re-throw, so callers
  // don't report success or close their dialogs when a write fails.

  const addProject = async (projectData: Omit<Project, 'id'>) => {
    try {
      // The onSnapshot listener will update the UI.
      await setDoc(doc(collection(db, 'projects')), projectData);
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        variant: "destructive",
        title: "Errore di salvataggio",
        description: "Impossibile aggiungere il nuovo progetto.",
      });
      throw error;
    }
  };

  const updateProject = async (updatedProject: Project) => {
    const { id, ...projectData } = updatedProject;
    try {
      await updateDoc(doc(db, 'projects', id), projectData);
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        variant: "destructive",
        title: "Errore di aggiornamento",
        description: "Impossibile aggiornare il progetto.",
      });
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        variant: "destructive",
        title: "Errore di eliminazione",
        description: "Impossibile eliminare il progetto.",
      });
      throw error;
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
