
export const metadata = {
  title: "Careers in FrieghtFlow",
  description: "Explore job opportunities and join our team!",
  openGraph: {
    title: "Careers in FrieghtFlow",
    description: "Explore job opportunities and join our team!",
    images: [
      {
        url: "https://your-site.com/images/about-og.jpg",
        width: 1200,
        height: 630,
        alt: "Careers in FrieghtFlow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers in FrieghtFlow",
    description: "Explore job opportunities and join our team!",
    //https://your-site.com/images/about-og.jpg
    images: [""],
  },
  other: {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "careerPage",
      name: "Careers in FrieghtFlow",
      description: "Explore job opportunities and join our team!",
      url: "https://your-site.com/about",
    },
  },
};

export default function Careers() {
  return (
    <div>
      <h1>Careers</h1>
      <p>Explore job opportunities and join our team!</p>
    </div>
  );
}