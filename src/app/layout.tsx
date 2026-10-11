import type {Metadata} from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { SITE_NAME, SITE_URL } from '@/lib/site';

const description = 'Portfolio dei progetti di architettura di GDAStudio.';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
// Display face for the public site's titles and numbers.
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description,
  openGraph: {
    title: SITE_NAME,
    description,
    siteName: SITE_NAME,
    locale: 'it_IT',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`light ${inter.variable} ${interTight.variable}`}>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
