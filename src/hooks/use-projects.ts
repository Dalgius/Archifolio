
'use client';

import * as React from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import type { Project } from '@/types';
import { db, storage } from '@/lib/firebase';
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
    const { image, ...restOfProjectData } = projectData;

    try {
      // Create a new document reference with a unique ID
      const newProjectRef = doc(collection(db, 'projects'));
      const projectId = newProjectRef.id;

      let imageUrl = 'https://placehold.co/600x400.png'; // A default placeholder

      // If a new image (as data URI) is provided, upload it to Firebase Storage
      if (image && image.startsWith('data:')) {
        const storageRef = ref(storage, `projects/${projectId}/image.jpg`);
        const uploadResult = await uploadString(storageRef, image, 'data_url');
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      // Create the final project data with the new image URL
      const finalProjectData = {
        ...restOfProjectData,
        image: imageUrl,
      };

      // Set the document data in Firestore
      await setDoc(newProjectRef, finalProjectData);

      // Update the local state
      const newProject = { id: projectId, ...finalProjectData } as Project;
      setProjects(prevProjects => [...prevProjects, newProject]);
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
          variant: "destructive",
          title: "Errore di salvataggio",
          description: "Impossibile aggiungere il nuovo progetto. L'immagine potrebbe essere troppo grande.",
        });
    }
  };

  const updateProject = async (updatedProject: Project) => {
    const { id, image, ...projectData } = updatedProject;
    const projectRef = doc(db, 'projects', id);

    try {
        let imageUrl = image;

        // If the image has been changed, it will be a data URI. Upload the new one.
        if (image && image.startsWith('data:')) {
            const storageRef = ref(storage, `projects/${id}/image.jpg`);
            const uploadResult = await uploadString(storageRef, image, 'data_url');
            imageUrl = await getDownloadURL(uploadResult.ref);
        }
        
        const dataToUpdate = {
            ...projectData,
            image: imageUrl,
        };

      await updateDoc(projectRef, dataToUpdate);

      setProjects(prevProjects =>
        prevProjects.map(p => (p.id === id ? { ...updatedProject, image: imageUrl } : p))
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
      
      // Delete the associated image from Firebase Storage
      const storageRef = ref(storage, `projects/${projectId}/image.jpg`);
      try {
        await deleteObject(storageRef);
      } catch (storageError: any) {
        // It's okay if the object doesn't exist. We can ignore that error.
        if (storageError.code !== 'storage/object-not-found') {
          console.error("Error deleting project image:", storageError);
        }
      }

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
