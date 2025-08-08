import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Space_Grotesk } from 'next/font/google'

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
  title: 'SplitBill AI - The Smartest Way to Split the Bill',
  description: 'Easily split bills and expenses with the power of AI. Snap a receipt and let us do the rest.',
  manifest: '/manifest.json',
  icons: {
    icon: 'https://i.postimg.cc/TYXtwbKN/Chat-GPT-Image-Aug-8-2025-04-14-15-PM.png',
    apple: '/apple-touch-icon.png',
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
          {children}
          <Toaster />
      </body>
    </html>
  );
}
