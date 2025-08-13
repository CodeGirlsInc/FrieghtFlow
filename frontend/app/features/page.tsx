import FeatureSection from "@/components/features/FeatureSection";
import UserTypeBenefits from "@/components/features/UserTypeBenefits";

export default function FeaturesPage() {
  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <h1 className="text-4xl font-bold mb-4">
          Discover FreightFlow"s Unique Features
        </h1>
        <p className="max-w-2xl mx-auto text-lg opacity-90">
          Powering modern freight operations with blockchain precision and
          real-time insights.
        </p>
      </section>

      {/* Features Grid */}
      <FeatureSection />

      {/* Benefits by User Type */}
      <UserTypeBenefits />

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-center text-white">
        <h2 className="text-2xl font-semibold mb-4">
          Ready to transform your freight management?
        </h2>
        <p className="mb-6 opacity-90">
          Experience blockchain-powered logistics today.
        </p>
        <a
          href="/signup"
          className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-200 transition"
        >
          Get Started
        </a>
      </section>
    </main>
  );
}
