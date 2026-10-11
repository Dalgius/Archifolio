
'use client';

import * as React from 'react';
import {
  collection, deleteField, doc, onSnapshot, updateDoc, writeBatch,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { Project, ProjectFields } from '@/types';
import { db } from '@/lib/firebase';
import { PROJECT_IMAGES_COLLECTION } from '@/lib/project-images';
import { useToast } from './use-toast';

const sortByStartDateDesc = (a: Project, b: Project) =>
  new Date(b.startDate).getTime() - new Date(a.startDate).getTime();

// Older documents kept the image (base64 data URL or placeholder URL) in an `image` field.
const toProject = (snapshot: QueryDocumentSnapshot): Project => {
  const { image: _legacyImage, ...data } = snapshot.data();
  return { id: snapshot.id, ...data, imageVersion: data.imageVersion ?? null } as Project;
};

// Moves legacy `image` fields into projectImages/{id}, one batch per project
// (each image can be close to Firestore's 1 MB document limit).
async function migrateLegacyImage(snapshot: QueryDocumentSnapshot) {
  const image = snapshot.data().image as string;
  const batch = writeBatch(db);
  if (image.startsWith('data:image/')) {
    batch.set(doc(db, PROJECT_IMAGES_COLLECTION, snapshot.id), { data: image });
    batch.update(snapshot.ref, { image: deleteField(), imageVersion: Date.now() });
  } else {
    batch.update(snapshot.ref, { image: deleteField(), imageVersion: null });
  }
  await batch.commit();
}

// Admin hook: manages all projects (public and private) and syncs them with Firestore.
// Firestore rules allow this only for the authenticated admin.
export function useProjects() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const { toast } = useToast();
  const migrationStarted = React.useRef(false);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setProjects(snapshot.docs.map(toProject).sort(sortByStartDateDesc));
      setIsInitialized(true);

      const legacyDocs = snapshot.docs.filter((d) => typeof d.data().image === 'string');
      if (legacyDocs.length > 0 && !migrationStarted.current) {
        migrationStarted.current = true;
        toast({ title: "Aggiornamento immagini...", description: `Conversione di ${legacyDocs.length} progetti al nuovo formato.` });
        Promise.all(legacyDocs.map(migrateLegacyImage))
          .then(() => toast({ title: "Immagini aggiornate." }))
          .catch((error) => {
            console.error("Error migrating images:", error);
            toast({ variant: "destructive", title: "Errore", description: "Impossibile aggiornare le immagini. Verifica le regole Firestore." });
          });
      }
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
  const runWrite = async (write: () => Promise<void>, title: string, description: string) => {
    try {
      // The onSnapshot listener will update the UI.
      await write();
    } catch (error) {
      console.error(`${title}:`, error);
      toast({ variant: "destructive", title, description });
      throw error;
    }
  };

  // `newImage` is a data URL when the user uploaded a new image, otherwise null.
  const addProject = (fields: ProjectFields, newImage: string | null) =>
    runWrite(async () => {
      const projectRef = doc(collection(db, 'projects'));
      const batch = writeBatch(db);
      if (newImage) {
        batch.set(doc(db, PROJECT_IMAGES_COLLECTION, projectRef.id), { data: newImage });
      }
      batch.set(projectRef, { ...fields, imageVersion: newImage ? Date.now() : null });
      await batch.commit();
    }, "Errore di salvataggio", "Impossibile aggiungere il nuovo progetto.");

  const updateProject = (id: string, fields: ProjectFields, newImage: string | null) =>
    runWrite(async () => {
      const batch = writeBatch(db);
      if (newImage) {
        batch.set(doc(db, PROJECT_IMAGES_COLLECTION, id), { data: newImage });
        batch.update(doc(db, 'projects', id), { ...fields, imageVersion: Date.now() });
      } else {
        batch.update(doc(db, 'projects', id), { ...fields });
      }
      await batch.commit();
    }, "Errore di aggiornamento", "Impossibile aggiornare il progetto.");

  const setProjectVisibility = (id: string, isPublic: boolean) =>
    runWrite(
      () => updateDoc(doc(db, 'projects', id), { isPublic }),
      "Errore di aggiornamento", "Impossibile cambiare la visibilità del progetto.",
    );

  const deleteProject = (projectId: string) =>
    runWrite(async () => {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'projects', projectId));
      batch.delete(doc(db, PROJECT_IMAGES_COLLECTION, projectId));
      await batch.commit();
    }, "Errore di eliminazione", "Impossibile eliminare il progetto.");

  return {
    projects,
    isInitialized,
    addProject,
    updateProject,
    setProjectVisibility,
    deleteProject,
  };
}
