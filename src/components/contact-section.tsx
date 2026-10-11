import { CONTAINER, INDEX_COLUMNS } from './container';
import { STUDIO } from '@/lib/site';
import { cn } from '@/lib/utils';

const label = 'mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground';
const value = 'font-display text-xl md:text-2xl leading-snug';

export function ContactSection() {
  const address = [STUDIO.address, STUDIO.city].filter(Boolean);

  return (
    <section id="contatti" className="scroll-mt-16 border-t">
      <div className={cn(CONTAINER, 'py-20 md:py-28')}>
        <h2 className="font-display text-5xl font-medium tracking-tight md:text-7xl">Contatti</h2>
        {/* Same columns as the project index: email under "Progetto", studio under "Luogo",
            links aligned to the right edge like "Cat.". */}
        <div className={cn('mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2', INDEX_COLUMNS)}>
          {(STUDIO.email || STUDIO.phone) && (
            <div className="space-y-10 md:col-span-3 md:col-start-1">
              {STUDIO.email && (
                <div>
                  <p className={label}>Email</p>
                  <a href={`mailto:${STUDIO.email}`} className={cn(value, 'underline-offset-4 [overflow-wrap:anywhere] hover:underline')}>{STUDIO.email}</a>
                </div>
              )}
              {STUDIO.phone && (
                <div>
                  <p className={label}>Telefono</p>
                  <a href={`tel:${STUDIO.phone.replace(/\s+/g, '')}`} className={cn(value, 'underline-offset-4 hover:underline')}>{STUDIO.phone}</a>
                </div>
              )}
            </div>
          )}
          {address.length > 0 && (
            <div className="md:col-start-4">
              <p className={label}>Studio</p>
              <p className={value}>{address.map((line) => <span key={line} className="block">{line}</span>)}</p>
            </div>
          )}
          {STUDIO.links.length > 0 && (
            <div className="md:col-span-2 md:col-start-5 md:text-right">
              <p className={label}>Link</p>
              <ul className={value}>
                {STUDIO.links.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                      {link.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
