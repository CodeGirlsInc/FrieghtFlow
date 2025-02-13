
export const metadata = {
  title: "FrieghtFlow Blogs",
  description:
    "Welcome to the blog page. Here you will find our latest articles and updates.",
  openGraph: {
    title: "FrieghtFlow Blogs",
    description:
      "Welcome to the blog page. Here you will find our latest articles and updates.",
    images: [
      {
        url: "https://your-site.com/images/about-og.jpg",
        width: 1200,
        height: 630,
        alt: "FrieghtFlow Blogs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FrieghtFlow Blogs",
    description: "Learn about FreightFlow's mission, values, and team",
    //https://your-site.com/images/about-og.jpg
    images: [""],
  },
  other: {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "BlogsPage",
      name: "FrieghtFlow Blogs",
      description:
        "Welcome to the blog page. Here you will find our latest articles and updates.",
      url: "https://your-site.com/about",
    },
  },
};

export default function Blog() {
  return (
    <div>
      <h1>Blog</h1>
      <p>Welcome to the blog page. Here you will find our latest articles and updates.</p>
    </div>
  );
}