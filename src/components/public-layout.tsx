
'use client';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import * as React from 'react';

export interface PublicLayoutProps {
  children?: React.ReactNode;
  typologies?: string[];
  selectedTypology?: string;
  setSelectedTypology?: (typology: string) => void;
}

export default function PublicLayout({ children, ...props }: PublicLayoutProps) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');

    if (isAdminPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header {...props} />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
        </div>
    )
}
