import React from 'react'

export const metadata = {
  title: "Privacy Policy",
  description:
    "Our commitment to protecting your privacy and securing your data",
  openGraph: {
    title: "Privacy Policy | FreightFlow",
    description:
      "Our commitment to protecting your privacy and securing your data",
    type: "website",
    images: [
      {
        url: "/images/legal-og.jpg",
        width: 1200,
        height: 630,
        alt: "FreightFlow Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | FreightFlow",
    description:
      "Our commitment to protecting your privacy and securing your data",
  },
  other: {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Privacy Policy",
      description:
        "Our commitment to protecting your privacy and securing your data",
    },
  },
};

export default function PrivacyPolicy() {
  return (
    <div>Privacy Policy</div>
  )
}
