import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FreightFlow — Move cargo, not paperwork',
  description:
    'Post a load, find a carrier, track every step — and pay only on delivery.',
  openGraph: {
    title: 'FreightFlow — Move cargo, not paperwork',
    description:
      'FreightFlow connects shippers and carriers on a transparent, blockchain-secured platform.',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-4xl font-black text-foreground tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Last updated: January 2026
        </p>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-foreground">1. Information We Collect</h2>
            <p>
              We collect information you provide directly, including account registration details
              (name, email, phone), shipment data (cargo type, routes, weights), and payment
              information processed through our Stellar blockchain escrow system.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground">2. How We Use Your Information</h2>
            <p>
              Your information is used to provide and improve our logistics platform, process
              shipments and payments, verify blockchain document hashes, and communicate with
              you about your shipments and account.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground">3. Data Security</h2>
            <p>
              We use industry-standard encryption and security practices. Document hashes are
              stored on the Stellar blockchain, ensuring tamper-proof integrity. Payment data
              is secured through smart contract escrow.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground">4. Contact Us</h2>
            <p>
              For questions about this Privacy Policy, contact us at privacy@freightflow.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
