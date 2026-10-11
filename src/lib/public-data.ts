// Server-side reads for the public site (server components, sitemap, image route).
// Uses Firestore Lite (plain HTTPS, no streaming connection) and reads anonymously,
// so the Firestore rules only return public projects and their images.
import { cache } from 'react';
import {
  collection, connectFirestoreEmulator, doc, getDoc, getDocs, getFirestore, query, where,
  type DocumentData,
} from 'firebase/firestore/lite';
import type { Project } from '@/types';
import { app } from './firebase';
import { PROJECT_IMAGES_COLLECTION } from './project-images';

const db = getFirestore(app);
if (process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

const toProject = (id: string, data: DocumentData): Project => {
  // Documents not yet migrated may still carry a large base64 `image`: never pass it on.
  const { image: _legacyImage, ...rest } = data;
  return { id, ...rest, imageVersion: rest.imageVersion ?? null } as Project;
};

// During `next build` without Firebase credentials, render an empty page instead of failing;
// at runtime the error propagates so Next keeps serving the previously generated page.
const handleReadError = <T,>(error: unknown, fallback: T): T => {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.warn('Firestore not reachable during build, rendering without data:', (error as Error).message);
    return fallback;
  }
  throw error;
};

export const getPublicProjects = cache(async (): Promise<Project[]> => {
  try {
    const snapshot = await getDocs(query(collection(db, 'projects'), where('isPublic', '==', true)));
    return snapshot.docs
      .map((d) => toProject(d.id, d.data()))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  } catch (error) {
    return handleReadError(error, []);
  }
});

export const getPublicProject = cache(async (id: string): Promise<Project | null> => {
  try {
    const snapshot = await getDoc(doc(db, 'projects', id));
    const data = snapshot.data();
    return data?.isPublic === true ? toProject(snapshot.id, data) : null;
  } catch (error) {
    // Private projects are denied by the rules: treat them as missing.
    if ((error as { code?: string }).code === 'permission-denied') return null;
    return handleReadError(error, null);
  }
});

// Returns the image data URL of a public project, or null.
export async function getPublicProjectImage(id: string): Promise<string | null> {
  try {
    const snapshot = await getDoc(doc(db, PROJECT_IMAGES_COLLECTION, id));
    const data = snapshot.data()?.data;
    return typeof data === 'string' ? data : null;
  } catch (error) {
    if ((error as { code?: string }).code !== 'permission-denied') {
      console.error(`Error loading image for project ${id}:`, error);
    }
    return null;
  }
}
