import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Space_Grotesk, Manrope } from 'next/font/google'

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

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  title: 'SplitBill AI - The Smartest Way to Split the Bill',
  description: 'Easily split bills and expenses with the power of AI. Snap a receipt and let us do the rest.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} ${manrope.variable}`}>
      <head>
      </head>
      <body className="font-sans antialiased bg-slate-100">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
