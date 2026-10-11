'use client';

import * as React from 'react';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import type { Project } from '@/types';
import { db } from '@/lib/firebase';
import { useToast } from './use-toast';

// Public portfolio: only projects with isPublic == true are requested,
// so private projects never reach the visitor's browser.
export function usePublicProjects() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const publicQuery = query(collection(db, 'projects'), where('isPublic', '==', true));
    const unsubscribe = onSnapshot(publicQuery, (snapshot) => {
      const projectList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Project))
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      setProjects(projectList);
      setIsInitialized(true);
    }, (error) => {
      console.error("Error fetching public projects:", error);
      toast({
        variant: "destructive",
        title: "Errore di connessione",
        description: "Impossibile caricare i progetti.",
      });
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, [toast]);

  return { projects, isInitialized };
}

// Loads a single public project. Private or missing projects resolve to null.
export function usePublicProject(id: string) {
  const [project, setProject] = React.useState<Project | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setIsInitialized(false);

    getDoc(doc(db, 'projects', id))
      .then((snapshot) => {
        if (cancelled) return;
        const data = snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Project) : null;
        setProject(data && data.isPublic ? data : null);
      })
      .catch((error) => {
        // Reading a private project as a visitor is denied by the Firestore rules.
        if (error?.code !== 'permission-denied') {
          console.error("Error fetching project:", error);
        }
        if (!cancelled) setProject(null);
      })
      .finally(() => {
        if (!cancelled) setIsInitialized(true);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { project, isInitialized };
}
