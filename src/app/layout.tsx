import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Providers } from '@/components/providers';
import { serverApi } from '@/lib/api';
import { navItems, SITE_URL } from '@/lib/nav';
import type { Category, Settings } from '@/types';

// Server-rendered per request; the underlying API calls are cached for 60s via the Next data cache.
export const dynamic = 'force-dynamic';
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'DEE-LIGHT — Food, snacks, drinks, fabrics, shoes, perfumes & jewelry', template: '%s | DEE-LIGHT' },
  description: 'Shop meals, snacks, drinks, quality fabrics, shoes, perfumes and jewelry at DEE-LIGHT in Bauchi, Nigeria.',
  openGraph: { siteName: 'DEE-LIGHT', type: 'website', locale: 'en_NG' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [cats, settings] = await Promise.all([
    serverApi<Category[]>('/categories').catch(() => null),
    serverApi<Settings>('/settings').catch(() => null),
  ]);
  const items = navItems(cats);
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Header items={items} storeName={settings?.storeName ?? 'DEE-LIGHT'} />
          <main id="main" className="flex-1">{children}</main>
          <Footer items={items} settings={settings} />
        </Providers>
      </body>
    </html>
  );
}
