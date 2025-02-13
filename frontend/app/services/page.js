import React from 'react'

export const metadata = {
  title: "Our Services",
  description:
    "Explore FreightFlow's comprehensive logistics and freight management services",
  openGraph: {
    title: "FreightFlow Services",
    description:
      "Explore FreightFlow's comprehensive logistics and freight management services",
    images: [
      {
        url: "https://your-site.com/images/services-og.jpg",
        width: 1200,
        height: 630,
        alt: "FreightFlow Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FreightFlow Services",
    description:
      "Explore FreightFlow's comprehensive logistics and freight management services",
    images: [""],
  },
  other: {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "FreightFlow Services",
      description:
        "Explore FreightFlow's comprehensive logistics and freight management services",
      url: "https://your-site.com/services",
      provider: {
        "@type": "Organization",
        name: "FreightFlow",
      },
    },
  },
};

export default function Service() {
  return (
    <div>Service</div>
  )
}
