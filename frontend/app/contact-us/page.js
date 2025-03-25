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
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/contact-us-bg.png')" }}
    >
      <div className="flex flex-col">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-white text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-white">
            Any question or remarks? Just write us a message!
          </p>
        </div>

        <div className="flex mt-10 bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl w-full min-h-[70vh]">
          <div
            className="flex flex-col justify-between rounded-lg text-white m-6 p-6 bg-cover"
            style={{ backgroundImage: "url('/contact-information-bg.png')" }}
          >
            <div>
              <h2 className="pt-6 text-xl font-semibold mb-2">
                Contact Information
              </h2>
              <p className="text-gray-300 mb-4">
                Say something to start a live chat!
              </p>
              <div className="flex flex-col pt-10">
                <p className="flex items-center gap-2">📞 +1012 3456 789</p>
                <p className="flex items-center gap-2">✉️ demo@gmail.com</p>
                <p className="flex items-center gap-2">
                  📍 234 Dartmouth Street, Boston, MA 02156, USA
                </p>
              </div>
            </div>
            <div className="flex space-x-4 mt-4">
              <img
                src="/x-logo.svg"
                alt="X (Twitter)"
                className="w-10 h-10 rounded-full cursor-pointer"
              />

              <img
                src="/instagram-logo.svg"
                alt="Instagram"
                className="w-10 h-10 rounded-full cursor-pointer"
              />

              <img
                src="/discord-logo.svg"
                alt="Discord"
                className="w-10 h-10 rounded-full cursor-pointer"
              />
            </div>
          </div>

          <div className="p-6">
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="border p-2 rounded"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="border p-2 rounded"
                />
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 mb-1">
                  Select Subject:
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="subject"
                      className="text-indigo-500"
                    />{" "}
                    General Inquiry
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="subject"
                      className="text-indigo-500"
                    />{" "}
                    Support
                  </label>
                </div>
              </div>
              <textarea
                placeholder="Write your message.."
                className="border w-full p-2 rounded mt-4"
                rows={4}
              ></textarea>
              <button
                type="submit"
                className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
