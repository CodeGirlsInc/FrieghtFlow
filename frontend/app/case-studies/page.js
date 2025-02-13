export const metadata = {
  title: "Case study",
  description: "FreightFlow case study",
  openGraph: {
    title: "Case study",
    description: "FreightFlow case study",
    images: [
      {
        url: "https://your-site.com/images/about-og.jpg",
        width: 1200,
        height: 630,
        alt: "FreightFlow case study",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Case study",
    description: "FreightFlow case study",
    //https://your-site.com/images/about-og.jpg
    images: [""],
  },
  other: {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "CaseStudyPage",
      name: "About FreightFlow",
      description: "FreightFlow case study",
      url: "https://your-site.com/about",
    },
  },
};

export default function CaseStudies() {
  return (
    <div>
      <h1>Case Studies</h1>
      <p>This is the Case Studies page.</p>
    </div>
  );
}
