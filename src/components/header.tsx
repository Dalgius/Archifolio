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
        <Link href="/" className="flex items-center gap-3" aria-label={`${STUDIO.owner}, ${STUDIO.profession} — home`}>
          <GDAStudioLogo className="h-8 w-8 shrink-0" />
          <span className="whitespace-nowrap font-display uppercase leading-tight tracking-[0.12em] sm:tracking-[0.18em]">
            <span className="block text-xs font-semibold sm:text-sm">{STUDIO.owner}</span>
            <span className="block text-[10px] text-muted-foreground sm:text-[11px]">{STUDIO.profession}</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          {/* On small screens the logo already leads to the index. */}
          <Link href="/#progetti" className={cn(navLink, 'hidden sm:inline')}>Progetti</Link>
          <Link href="/#contatti" className={navLink}>Contatti</Link>
        </nav>
      </div>
    </header>
  );
}
