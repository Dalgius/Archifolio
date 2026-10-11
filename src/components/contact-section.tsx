import { CONTAINER } from './container';
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
        {/* Wide screens: three equal columns, email left, studio centred, links right.
            Below xl the long email gets its own row so it never breaks mid-word. */}
        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {(STUDIO.email || STUDIO.phone) && (
            <div className="space-y-10 sm:col-span-2 xl:col-span-1">
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
            // The block sits in the centre of the column, its text stays left-aligned.
            <div className="xl:col-start-2 xl:flex xl:justify-center">
              <div>
                <p className={label}>Studio</p>
                <p className={value}>{address.map((line) => <span key={line} className="block">{line}</span>)}</p>
              </div>
            </div>
          )}
          {STUDIO.links.length > 0 && (
            // The block sits against the right edge, its text stays left-aligned.
            <div className="sm:flex sm:justify-end xl:col-start-3">
              <div>
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
