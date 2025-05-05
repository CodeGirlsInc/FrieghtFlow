import Button from "@/components/ui/Button";
import Image from "next/image";


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
    <section className="w-full bg-cover bg-center py-16 px-4 sm:px-8 md:px-16 lg:px-32" style={{ backgroundImage: "url('/images/contact-og.jpg')" }}>
      <div className="max-w-[1196px] w-full mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        
        {/* Header Section */}
        <div className="text-center py-8 bg-gray-500 text-white" style={{ backgroundImage: "url('/images/contact-og.jpg')" }}>
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="text-lg text-gray-300">Any questions or remarks? Just write us a message!</p>
        </div>
        
        <div className="grid md:grid-cols-2">
          {/* Left Side - Contact Information */}
          <div className="bg-gray-900 text-white p-8 flex flex-col justify-between">
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p className="text-gray-300">Say something to start a live chat!</p>
            <div className="mt-6 space-y-12">
              <p className="flex items-center gap-2">
<Image src="/icons/bxs_phone-call.png" width={24} height={24}/>  <span>+1012 3456 789</span>
              </p>
              <p className="flex items-center gap-2">
<Image src="/icons/message.png" width={24} height={24}/> <span>demo@gmail.com</span>
              </p>
              <p className="flex items-center gap-2">
<Image src="/icons/location.png" width={24} height={24}/> <span>234 Dartmouth Street, Boston, MA 02156, USA</span>
              </p>
            </div>
            <div className="mt-6 flex space-x-4">
            <a href="#">
                <Image 
                src="/icons/twitter.png" 
                width={30}
                height={30} 
                />
              </a>
              <a href="#">
                <Image 
                src="/icons/instagram.png" 
                width={30}
                height={30} 
                />
              </a>
              <a href="#">
                <Image 
                src="/icons/discord.png" 
                width={30}
                height={30} 
                />
              </a>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium">First Name</label>
                  <input type="text" className="border-b-2 border-gray-400 p-2 outline-none w-full" />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium">Last Name</label>
                  <input type="text" className="border-b-2 border-gray-400 p-2 outline-none w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium">Email</label>
                  <input type="email" className="border-b-2 border-gray-400 p-2 outline-none w-full" />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium">Phone Number</label>
                  <input type="text" className="border-b-2 border-gray-400 p-2 outline-none w-full" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-lg">Select Subject</label>
                <div className="flex  gap-2 mt-2">
              <label className="flex items-center">
                  <input type="radio" name="subject" className="mr-2" /> General Inquiry
                </label>
                <label className="flex items-center">
                  <input type="radio" name="subject" className="mr-2" /> General Inquiry
                </label>
                <label className="flex items-center">
                  <input type="radio" name="subject" className="mr-2" /> General Inquiry
                </label>
                <label className="flex items-center">
                  <input type="radio" name="subject" className="mr-2" /> General Inquiry
                </label>
              </div>
              </div>
              <div>
                <label className="block font-semibold text-lg">Message</label>
                <textarea placeholder="Write your message..." className="border border-gray-400 p-4 rounded-lg w-full h-32 focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
              </div>
              <Button text="Send Message" className="w-full bg-yellow-500 text-white py-3 rounded-lg text-lg font-semibold" />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
