import Link from 'next/link';
import { GDAStudioLogo } from './icons';
import { CONTAINER } from './container';
import { STUDIO } from '@/lib/site';
import { cn } from '@/lib/utils';

const navLink = 'text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className={cn(CONTAINER, 'flex h-16 items-center justify-between')}>
        <Link href="/" className="flex items-center gap-3" aria-label={`${STUDIO.name} — home`}>
          <GDAStudioLogo className="h-8 w-8" />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.18em]">{STUDIO.name}</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/#progetti" className={navLink}>Progetti</Link>
          <Link href="/#contatti" className={navLink}>Contatti</Link>
        </nav>
      </div>
    </header>
  );
}
