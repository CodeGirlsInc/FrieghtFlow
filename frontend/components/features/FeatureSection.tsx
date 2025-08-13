import { Wallet, Clock, Zap } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function FeatureSection() {
  const features = [
    {
      title: "Starknet Wallet Integration",
      description:
        "Seamless integration with Starknet wallets for secure, decentralized transactions.",
      icon: <Wallet />,
    },
    {
      title: "Smart Contract Automation",
      description:
        "Automate freight agreements with blockchain-based smart contracts.",
      icon: <Zap />,
    },
    {
      title: "Real-Time Shipment Tracking",
      description:
        "Track cargo live from origin to destination with immutable blockchain records.",
      icon: <Clock />,
    },
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center mb-12">
        Our Core Features
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <FeatureCard key={idx} {...feature} />
        ))}
      </div>
    </section>
  );
}
