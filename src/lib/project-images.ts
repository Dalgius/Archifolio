import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Project } from '@/types';

// Project images live in projectImages/{projectId} as { data: "data:image/...;base64,..." },
// so the project documents (and the public project list) stay small.
export const PROJECT_IMAGES_COLLECTION = 'projectImages';

// Public URL served by src/app/images/[id]/[version]/route.ts. The version changes
// whenever a new image is uploaded, so the URL can be cached forever.
export const projectImageUrl = (project: Pick<Project, 'id' | 'imageVersion'>) =>
  project.imageVersion ? `/images/${project.id}/${project.imageVersion}` : null;

export async function fetchProjectImageData(projectId: string): Promise<string | null> {
  const snapshot = await getDoc(doc(db, PROJECT_IMAGES_COLLECTION, projectId));
  const data = snapshot.data()?.data;
  return typeof data === 'string' ? data : null;
}
