import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { QueryProvider } from '../providers/query-provider';
import ToastContainer from '../components/ui/ToastContainer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://freightflow.app';

export const metadata: Metadata = {
  title: {
    default: 'FreightFlow — Move cargo, not paperwork',
    template: '%s | FreightFlow',
  },
  description:
    'FreightFlow connects shippers and carriers on a transparent, blockchain-secured platform. Post a load, find a carrier, track every step — and pay only on delivery.',
  keywords: [
    'freight',
    'logistics',
    'shipping',
    'carrier',
    'blockchain',
    'Stellar',
    'escrow',
    'cargo',
    'supply chain',
  ],
  authors: [{ name: 'FreightFlow' }],
  creator: 'FreightFlow',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'FreightFlow',
    title: 'FreightFlow — Move cargo, not paperwork',
    description:
      'Post a load, find a carrier, track every step — and pay only on delivery.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'FreightFlow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreightFlow — Move cargo, not paperwork',
    description:
      'Post a load, find a carrier, track every step — and pay only on delivery.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s===null&&d)){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
          <ToastContainer />
        </QueryProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});}`,
          }}
        />
      </body>
    </html>
  );
}
