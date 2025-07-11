
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GDAStudioLogo } from './icons';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { PublicLayoutProps } from './public-layout';

interface HeaderProps extends PublicLayoutProps {}

export function Header({ typologies, selectedTypology, setSelectedTypology }: HeaderProps) {
    const pathname = usePathname();
    const isPublicMode = process.env.NEXT_PUBLIC_BUILD_MODE === 'public';
    const isHomePage = pathname === '/';

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto h-20 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <GDAStudioLogo className="w-10 h-10" />
                    </Link>
                </div>

                <nav className="flex gap-2 items-center justify-end">
                    {isHomePage && typologies && setSelectedTypology && typologies.length > 1 && (
                        <div className="hidden md:flex flex-wrap gap-1 items-center">
                            {typologies.map((typology) => (
                                <Button 
                                    key={typology}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedTypology(typology)}
                                    className={cn(
                                        "rounded-md transition-colors h-8 px-3 text-sm font-normal",
                                        selectedTypology === typology 
                                            ? "bg-muted text-foreground" 
                                            : "text-muted-foreground hover:text-foreground"
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
