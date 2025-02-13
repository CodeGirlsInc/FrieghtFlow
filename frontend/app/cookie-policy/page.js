
export const metadata = {
  title: "Cookie Policy",
  description:
    "Learn about how FreightFlow uses cookies and how we protect your data",
  openGraph: {
    title: "Cookie Policy | FreightFlow",
    description:
      "Learn about how FreightFlow uses cookies and how we protect your data",
    type: "website",
    images: [
      {
        url: "/images/legal-og.jpg",
        width: 1200,
        height: 630,
        alt: "FreightFlow Cookie Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Policy | FreightFlow",
    description:
      "Learn about how FreightFlow uses cookies and how we protect your data",
  },
  other: {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Cookie Policy",
      description:
        "Learn about how FreightFlow uses cookies and how we protect your data",
    },
  },
};

export default function CookiePolicy() {
  return (
    <div>
      <h1>Cookie Policy</h1>
      <p>This is the Cookie Policy page content.</p>
    </div>
  );
}