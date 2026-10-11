import Link from 'next/link';
import PublicLayout from '@/components/public-layout';
import { CONTAINER } from '@/components/container';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <PublicLayout>
      <div className={cn(CONTAINER, 'py-24 md:py-36')}>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Errore 404</p>
        <h1 className="mt-6 font-display text-5xl font-medium tracking-tight md:text-7xl">Pagina non trovata</h1>
        <Link href="/#progetti" className="mt-10 inline-block text-sm underline underline-offset-4 hover:text-muted-foreground">
          ← Torna all&apos;indice dei progetti
        </Link>
      </div>
    </PublicLayout>
  );
}
