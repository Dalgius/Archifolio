
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArchifolioLogo } from './icons';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { PublicLayoutProps } from './public-layout';

interface HeaderProps extends PublicLayoutProps {}

export function Header({ typologies, selectedTypology, setSelectedTypology }: HeaderProps) {
    const pathname = usePathname();
    const isPublicMode = process.env.NEXT_PUBLIC_BUILD_MODE === 'public';
    const isHomePage = pathname === '/';

    const getPageTitle = () => {
        if (pathname === '/') return 'Progetti';
        if (pathname.startsWith('/projects/')) return 'Dettaglio Progetto';
        return 'Archifolio';
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container h-14 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                    <Link href="/" className="flex items-center gap-2">
                        <ArchifolioLogo className="w-8 h-8" />
                        <span className="text-xl font-bold font-headline hidden sm:inline-block">Archifolio</span>
                    </Link>
                </div>

                <div className="flex-1 text-center font-semibold text-muted-foreground hidden md:block">
                   {getPageTitle()}
                </div>

                <nav className="flex gap-2 items-center justify-end flex-1">
                    {isHomePage && typologies && setSelectedTypology && (
                         <div className="flex flex-wrap gap-2 items-center">
                            {typologies.map((typology) => (
                                <Button 
                                    key={typology}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedTypology(typology)}
                                    className={cn(
                                        "rounded-full transition-colors h-8 px-3 text-xs",
                                        selectedTypology === typology 
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                                            : "hover:bg-accent"
                                    )}
                                >
                                    {typology}
                                </Button>
                            ))}
                        </div>
                    )}
                     {!isPublicMode && (
                        <Button asChild>
                            <Link href="/admin">Accesso Admin</Link>
                        </Button>
                    )}
                </nav>
            </div>
        </header>
    );
}
