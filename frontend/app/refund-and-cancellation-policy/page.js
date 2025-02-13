
export const metadata = {
  title: "Refund Policy",
  description: "Understanding FreightFlow's refund process and policies",
  openGraph: {
    title: "Refund Policy | FreightFlow",
    description: "Understanding FreightFlow's refund process and policies",
    type: "website",
    images: [
      {
        url: "/images/legal-og.jpg",
        width: 1200,
        height: 630,
        alt: "FreightFlow Refund Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refund Policy | FreightFlow",
    description: "Understanding FreightFlow's refund process and policies",
  },
  other: {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Refund Policy",
      description: "Understanding FreightFlow's refund process and policies",
    },
  },
};

export default function RefundAndCancellationPolicy() {
  return (
    <div>
      <h1>Refund and Cancellation Policy</h1>
      <p>This is the Refund and Cancellation Policy page.</p>
    </div>
  );
}