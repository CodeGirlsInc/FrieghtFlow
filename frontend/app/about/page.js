
export const metadata = {
  title: "About Us",
  description: "Learn about FreightFlow's mission, values, and team",
  openGraph: {
    title: "About FreightFlow",
    description: "Learn about FreightFlow's mission, values, and team",
    images: [
      {
        url: "https://your-site.com/images/about-og.jpg",
        width: 1200,
        height: 630,
        alt: "About FreightFlow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About FreightFlow",
    description: "Learn about FreightFlow's mission, values, and team",
    //https://your-site.com/images/about-og.jpg
    images: [""],
  },
  other: {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About FreightFlow",
      description: "Learn about FreightFlow's mission, values, and team",
      url: "https://your-site.com/about",
    },
  },
};

export default function About() {
  return (
    <div>
      <h1>About Us</h1>
      <p>This is the About page content.</p>
    </div>
  );
}