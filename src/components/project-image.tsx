'use client';

import Image from 'next/image';
import type { Project } from '@/types';
import { cn } from '@/lib/utils';
import { projectImageUrl } from '@/lib/project-images';
import { useProjectImageData } from '@/hooks/use-project-image';
import { GDAStudioLogo } from './icons';

interface ProjectImageProps {
  project: Pick<Project, 'id' | 'name' | 'imageVersion' | 'isPublic'>;
  sizes: string;
  className?: string;
  priority?: boolean;
  // Admin: read the image straight from Firestore (signed in). This also avoids requesting
  // the public URL of a just-saved image before the write has reached the server.
  fromFirestore?: boolean;
}

export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 flex items-center justify-center bg-muted', className)}>
      <GDAStudioLogo className="w-1/4 max-w-16 opacity-20" />
    </div>
  );
}

// Fills its (relatively positioned) parent with the project image.
export function ProjectImage({ project, sizes, className, priority = false, fromFirestore = false }: ProjectImageProps) {
  // Private projects' images are only readable by the signed-in admin, so they always come from Firestore.
  const useFirestore = fromFirestore || !project.isPublic;
  const firestoreData = useProjectImageData(useFirestore ? project.id : null, project.imageVersion);
  const src = useFirestore ? firestoreData : projectImageUrl(project);

  if (!src) {
    return <ImagePlaceholder />;
  }

  return (
    <Image
      src={src}
      alt={project.name}
      fill
      sizes={sizes}
      className={cn('object-cover', className)}
      priority={priority}
      unoptimized={src.startsWith('data:')}
    />
  );
}
