import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "../globals.css";
import QueryProviders from "../providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import LanguageSwitcher from "@/components/language-switcher";
import { AuthProvider } from "@/lib/auth-context";

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
  description: "Manage your freight and logistics operations",
};

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // 👈 params is a Promise now
}) {
  // ✅ Await params before destructuring
  const { children } = props;
  const { locale } = await props.params;

  // ✅ Get messages safely
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <QueryProviders>
              <LanguageSwitcher locale={locale} />
              {children}
              <Toaster
                position="top-right"
                expand={false}
                richColors
                closeButton
                duration={4000}
              />
            </QueryProviders>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
