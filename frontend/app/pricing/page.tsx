import PricingCard from "@/components/PricingCard";
import PricingComparison from "@/components/PricingComparison";

export default function PricingPage() {
  const plans = [
    {
      title: "Small Businesses",
      price: "$49",
      description: "Perfect for small freight companies and startups.",
      features: [
        "Up to 100 shipments/month",
        "Basic analytics",
        "Email support",
      ],
      cta: "Get Started",
    },
    {
      title: "Enterprises",
      price: "$199",
      description: "Advanced tools for large-scale operations.",
      features: [
        "Unlimited shipments",
        "Advanced analytics",
        "24/7 priority support",
        "Custom integrations",
      ],
      cta: "Choose Plan",
    },
    {
      title: "Independent Shippers",
      price: "$99",
      description: "Flexible tools for solo or small team shippers.",
      features: [
        "Up to 500 shipments/month",
        "Basic analytics",
        "Phone & Email support",
      ],
      cta: "Start Now",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Pricing Plans</h1>
        <p className="text-gray-600">
          Choose the plan that best suits your freight business needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <PricingCard key={index} {...plan} />
        ))}
      </div>

      <PricingComparison />
    </section>
  );
}
