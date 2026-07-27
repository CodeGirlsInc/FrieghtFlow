import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'FreightFlow Terms of Service — the rules and guidelines for using our freight platform.',
  openGraph: {
    title: 'Terms of Service | FreightFlow',
    description: 'FreightFlow Terms of Service.',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-4xl font-black text-foreground tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Last updated: January 2026
        </p>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using FreightFlow, you agree to be bound by these Terms of Service.
              If you do not agree, do not use the platform.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground">2. Platform Description</h2>
            <p>
              FreightFlow is a freight marketplace connecting shippers and carriers. We facilitate
              shipment posting, carrier matching, blockchain-verified documentation, and escrow
              payment processing via the Stellar network.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground">3. Escrow and Payments</h2>
            <p>
              Funds are held in Stellar smart contract escrow until delivery is confirmed by the
              shipper. FreightFlow does not guarantee carrier performance and is not liable for
              cargo damage during transit.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground">4. Contact</h2>
            <p>
              For questions about these Terms, contact us at legal@freightflow.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
