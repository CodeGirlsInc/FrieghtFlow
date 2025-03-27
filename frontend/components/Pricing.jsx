import PricingCard from "./PricingCard";

const pricingPlans = [
  {
    title: "Free Tier",
    description: "Basic Features",
    price: 0,
    features: [
      "place holder",
      "place holder",
      "place holder",
      "place place holder",
    ],
    featured: false,
  },
  {
    title: "Pay-Per-Use Model",
    description: "For small business",
    price: 29,
    features: [
      "place holder",
      "place holder",
      "place holder",
      "place place holder",
    ],
    featured: true,
  },
  {
    title: "Subscription Plans",
    description: "Monthly/Yearly",
    price: 49,
    features: [
      "place holder",
      "place holder",
      "place holder",
      "place place holder",
    ],
    featured: false,
  },
  {
    title: "Enterprise Custom Solution",
    description: "For enterprise",
    price: 49,
    features: ["place holder", "place holder", "place holder"],
    featured: false,
  },
];

function Pricing() {
  return (
    <div className=" w-full flex flex-col items-center justify-center min-h-screen bg-[#F4EBDA] py-3 space-y-5">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-semibold text-[#313435] uppercase">
          Pricing Plans
        </h1>
        <p className="font-light text-[#0C1421] text-lg">
          Get personalized recommendations based on your location
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center items-center mt-3">
        {pricingPlans.map((plan, index) => (
          <PricingCard key={index} {...plan} />
        ))}
      </div>
    </div>
  );
}

export default Pricing;
