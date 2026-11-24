import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "../providers/query-provider";
import ToastContainer from "../components/ui/ToastContainer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FreightFlow - Logistics Management",
  description: "Comprehensive freight and logistics management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to apply theme before first paint — prevents flash.
            `suppressHydrationWarning` on <html> above covers the class this
            script adds; the storage read is guarded because `localStorage`
            access throws in browsers where storage is blocked. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              var theme = null;
              try { theme = localStorage.getItem('theme'); } catch { theme = null; }
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (theme === 'dark' || (theme === null && prefersDark)) {
                document.documentElement.classList.add('dark');
              }
            })();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
