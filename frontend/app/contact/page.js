import { ContactForm } from "../../components/features/ContactForm";

export const metadata = {
  title: "Contact Us | FreightFlow",
  description: "Get in touch with the FreightFlow team for any questions or support.",
};

export default function ContactPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="max-w-2xl mx-auto text-lg opacity-90">
            Have questions? We're here to help. Reach out to our team for support or inquiries.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              {/* Contact Form */}
              <div className="w-full md:w-1/2 p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send us a message</h2>
                <ContactForm />
              </div>

              {/* Contact Info */}
              <div className="w-full md:w-1/2 bg-gray-50 p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Email</h3>
                      <p className="mt-1 text-gray-600">support@freightflow.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Office</h3>
                      <p className="mt-1 text-gray-600">
                        123 Logistics Way<br />
                        San Francisco, CA 94107<br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM (PST)<br />
                      Saturday: 10:00 AM - 4:00 PM (PST)<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
