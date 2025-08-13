import TermsSection from "@/components/TermsSection";

export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-gray-600 mb-10">
        Welcome to our Web3-enabled logistics platform built on the Stellar
        ecosystem. By using our services, you agree to the following terms and
        conditions.
      </p>

      <TermsSection title="1. Introduction">
        <p>
          These Terms of Service govern your use of our logistics and supply
          chain platform. The platform facilitates freight and cargo operations
          for small businesses, large enterprises, and independent shippers.
          This document outlines your rights, obligations, and responsibilities
          when using our services.
        </p>
      </TermsSection>

      <TermsSection title="2. Usage">
        <p>
          You agree to use the platform in compliance with all applicable laws
          and regulations. You shall not engage in fraudulent transactions,
          attempt to manipulate data, or misuse any blockchain features provided
          by the Stellar ecosystem integration.
        </p>
      </TermsSection>

      <TermsSection title="3. User Responsibilities">
        <p>
          Users are responsible for maintaining the confidentiality of their
          account credentials and wallet keys. You must ensure the accuracy of
          the shipment details you provide, including addresses, cargo
          descriptions, and payment information.
        </p>
      </TermsSection>

      <TermsSection title="4. Liability Disclaimer">
        <p>
          Our platform is provided on an &quot;as-is&quot; basis without
          warranties of any kind. We are not liable for losses due to shipment
          delays, blockchain transaction failures, or any indirect damages
          resulting from platform usage.
        </p>
      </TermsSection>

      <TermsSection title="5. Changes to Terms">
        <p>
          We reserve the right to modify these Terms of Service at any time.
          Updates will be posted on this page, and continued use of the platform
          indicates your acceptance of the updated terms.
        </p>
      </TermsSection>

      <TermsSection title="6. Contact Information">
        <p>
          For questions about these Terms of Service, please contact our support
          team at{" "}
          <a
            href="mailto:support@stellarlogistics.com"
            className="text-blue-600 underline"
          >
            support@stellarlogistics.com
          </a>
          .
        </p>
      </TermsSection>
    </main>
  );
}
