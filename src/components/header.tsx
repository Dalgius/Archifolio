import Link from 'next/link';
import { ArchifolioLogo } from './icons';
import { Button } from './ui/button';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <ArchifolioLogo className="w-8 h-8" />
                    <span className="text-xl font-bold font-headline hidden sm:inline-block">Archifolio</span>
                </Link>
                <nav className="flex gap-2 items-center">
                    <Button variant="ghost" asChild>
                        <Link href="/#projects">Projects</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin">Admin Login</Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
}
