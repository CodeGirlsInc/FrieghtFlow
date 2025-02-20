import React from 'react'

export const metadata = {
  title: "Pricing",
  description:
    "Transparent pricing plans for FreightFlow services - Choose the perfect plan for your business",
  openGraph: {
    title: "FreightFlow Pricing Plans",
    description:
      "Transparent pricing plans for FreightFlow services - Choose the perfect plan for your business",
    type: "website",
    images: [
      {
        url: "/images/pricing-og.jpg",
        width: 1200,
        height: 630,
        alt: "FreightFlow Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FreightFlow Pricing Plans",
    description:
      "Transparent pricing plans for FreightFlow services - Choose the perfect plan for your business",
  },
  other: {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "PriceSpecification",
      name: "FreightFlow Pricing Plans",
      description: "Transparent pricing plans for FreightFlow services",
    },
  },
};

export default function Pricing() {
  return (
    <div>Pricing</div>
  )
}
