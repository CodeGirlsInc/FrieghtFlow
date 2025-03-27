import localFont from "next/font/local";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export const metadata = {
   metadataBase: new URL("https://your-site.com"),
   title: {
      default: "FreightFlow",
      template: "%s | FreightFlow",
   },
   description: `A Web3-enabled logistics and supply chain platform built on the StarkNet ecosystem, designed to streamline freight and cargo operations for small businesses, large enterprises, and independent shippers.`,
   robots: {
      index: true,
      follow: true,
      googleBot: {
         index: true,
         follow: true,
         "max-video-preview": -1,
         "max-image-preview": "large",
         "max-snippet": -1,
      },
   },
   other: {
      "script:ld+json": {
         "@context": "https://schema.org",
         "@type": "Organization",
         name: "FreightFlow",
         description: "Efficient freight management and logistics solutions",
         url: "https://your-site.com",
      },
   },
};

export default function RootLayout({children}) {
   return (
      <html lang="en">
         <body>{
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
         {children}
      </GoogleOAuthProvider> }</body>
      </html>
   );
}