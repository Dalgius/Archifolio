'use client';

import * as React from 'react';
import { fetchProjectImageData } from '@/lib/project-images';

// Loads a project's image data URL straight from Firestore. Used in the admin
// for private projects, whose images the public /images route can't serve.
export function useProjectImageData(projectId: string | null, imageVersion: number | null) {
  const [data, setData] = React.useState<string | null>(null);

  React.useEffect(() => {
    setData(null);
    if (!projectId || !imageVersion) return;

    let cancelled = false;
    fetchProjectImageData(projectId)
      .then((result) => { if (!cancelled) setData(result); })
      .catch((error) => console.error(`Error loading image for project ${projectId}:`, error));
    return () => { cancelled = true; };
  }, [projectId, imageVersion]);

  return data;
}
