// pages/about.tsx
import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-white py-16 px-6 md:px-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          About FreightFlow
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto">
          Revolutionizing global logistics through{" "}
          <span className="font-semibold text-blue-600">decentralization</span>
          and the power of{" "}
          <span className="font-semibold text-purple-600">Starknet</span>.
        </p>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 md:px-20 bg-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg leading-relaxed">
            At FreightFlow, our mission is to empower businesses and individuals
            with a logistics network that is transparent, efficient, and fully
            decentralized. We harness blockchain technology, powered by
            Starknet, to streamline freight operations while ensuring security,
            traceability, and cost-effectiveness.
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-6 md:px-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
          <p className="text-lg leading-relaxed">
            We envision a future where global trade is frictionless,
            sustainable, and accessible to all. FreightFlow aims to be the
            backbone of a decentralized logistics ecosystem, eliminating
            inefficiencies and creating value for every participant in the
            supply chain.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6 md:px-20 bg-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: "John Doe", role: "CEO & Founder" },
              { name: "Jane Smith", role: "Blockchain Lead" },
              { name: "Alex Johnson", role: "Operations Manager" },
            ].map((member, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center"
              >
                <Image
                  src="/team-placeholder.jpg"
                  alt={member.name}
                  width={120}
                  height={120}
                  className="rounded-full mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} FreightFlow. All rights reserved.
      </footer>
    </div>
  );
}
