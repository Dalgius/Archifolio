import Link from 'next/link';
import { CONTAINER } from './container';
import { STUDIO } from '@/lib/site';
import { cn } from '@/lib/utils';

export function Footer() {
  const isPublicMode = process.env.NEXT_PUBLIC_BUILD_MODE === 'public';

  return (
    <footer className="border-t">
      <div className={cn(CONTAINER, 'flex flex-col gap-3 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between')}>
        <p>&copy; {new Date().getFullYear()} {STUDIO.name}</p>
        <p className="flex flex-wrap gap-x-6 gap-y-1">
          {STUDIO.email && <a href={`mailto:${STUDIO.email}`} className="hover:text-foreground">{STUDIO.email}</a>}
          {STUDIO.phone && <a href={`tel:${STUDIO.phone.replace(/\s+/g, '')}`} className="hover:text-foreground">{STUDIO.phone}</a>}
        </p>
        {!isPublicMode && (
          <Link href="/admin" className="hover:text-foreground">Area riservata</Link>
        )}
      </div>
    </footer>
  );
}
