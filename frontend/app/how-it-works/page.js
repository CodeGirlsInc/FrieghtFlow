import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, FileSignature, Map, CreditCard } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      title: "Create Shipment",
      description:
        "Enter shipment details, pickup and delivery addresses, and preferred shipping options.",
      icon: Truck,
    },
    {
      title: "Smart Contract Signing",
      description:
        "Confirm your shipment by signing a Starknet smart contract, ensuring secure and tamper-proof agreements.",
      icon: FileSignature,
    },
    {
      title: "Track Shipment",
      description:
        "Track your package in real-time on the FreightFlow dashboard, powered by on-chain events.",
      icon: Map,
    },
    {
      title: "Payments",
      description:
        "Pay securely via Starknet, with automatic release upon successful delivery confirmation.",
      icon: CreditCard,
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          How FreightFlow Works
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          From shipment creation to payment and tracking—powered by Starknet for
          secure, decentralized logistics.
        </p>
      </section>

      {/* Steps */}
      <section className="grid gap-8 md:grid-cols-2">
        {steps.map((step, index) => (
          <Card
            key={index}
            className="flex flex-col items-center text-center p-6"
          >
            <CardHeader>
              <step.icon className="w-12 h-12 text-primary mb-4" />
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center mt-16">
        <Button size="lg">Start Shipping Now</Button>
      </section>
    </main>
  );
}
