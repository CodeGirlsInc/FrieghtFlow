
export const metadata = {
  title: "Contact Us",
  description: "Get in touch with FreightFlow - We're here to help",
  openGraph: {
    title: "Contact FreightFlow",
    description: "Get in touch with FreightFlow - We're here to help",
    images: [
      {
        url: "https://your-site.com/images/contact-og.jpg",
        width: 1200,
        height: 630,
        alt: "Contact FreightFlow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact FreightFlow",
    description: "Get in touch with FreightFlow - We're here to help",
    images: [""],
  },
  other: {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact FreightFlow",
      description: "Get in touch with FreightFlow - We're here to help",
      url: "https://your-site.com/contact",
    },
  },
};

export default function ContactUs() {
  return (
    <div>
      <h1>Contact Us</h1>
      <p>If you have any questions, feel free to reach out!</p>
    </div>
  );
}