
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArchifolioLogo } from './icons';
import { Button } from './ui/button';

export function Header() {
    const pathname = usePathname();

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (pathname === '/') {
            e.preventDefault();
            const projectsSection = document.getElementById('projects');
            if (projectsSection) {
                projectsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <ArchifolioLogo className="w-8 h-8" />
                    <span className="text-xl font-bold font-headline hidden sm:inline-block">Archifolio</span>
                </Link>
                <nav className="flex gap-2 items-center">
                    <Button variant="ghost" asChild>
                        <Link href="/#projects" onClick={handleScroll}>Progetti</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin">Accesso Admin</Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
}
