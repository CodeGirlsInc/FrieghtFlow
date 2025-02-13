export const metadata = {
  title: "Terms and Conditions",
  description: "FreightFlow terms of service and conditions of use",
  openGraph: {
    title: "Terms and Conditions | FreightFlow",
    description: "FreightFlow terms of service and conditions of use",
    type: "website",
    images: [
      {
        url: "/images/legal-og.jpg",
        width: 1200,
        height: 630,
        alt: "FreightFlow Terms and Conditions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms and Conditions | FreightFlow",
    description: "FreightFlow terms of service and conditions of use",
  },
  other: {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Terms and Conditions",
      description: "FreightFlow terms of service and conditions of use",
      mainContentOfPage: {
        "@type": "WebPageElement",
        cssSelector: "main",
      },
      specialty: "Terms of Service",
    },
  },
};

export default function TermsAndConditions() {
  return (
    <div>
      <h1>Terms and Conditions</h1>
      <p>Your terms and conditions content goes here.</p>
    </div>
  );
}
