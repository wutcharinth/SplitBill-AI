import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Space_Grotesk } from 'next/font/google'
import { UsageProvider } from '@/components/hooks/useUsageTracker';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
 
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'BillzAI - The Smartest Way to Split the Bill',
  description: 'Easily split bills and expenses with the power of AI. Snap a receipt and let us do the rest.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: 'https://placehold.co/180x180.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="theme-color" content="#4681f4" />
      </head>
      <body className="font-sans antialiased bg-slate-100">
        <UsageProvider>
          {children}
          <Toaster />
        </UsageProvider>
      </body>
    </html>
  );
}
