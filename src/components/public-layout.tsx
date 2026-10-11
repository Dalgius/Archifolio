import * as React from 'react';
import { Header } from './header';
import { Footer } from './footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-public flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
