import PolicySection from "@/components/PolicySection";

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-600 mb-10">
        At FreightFlow, your privacy is important to us. This Privacy Policy
        explains how we collect, use, and protect your personal data in
        compliance with relevant laws such as the GDPR.
      </p>

      <PolicySection title="1. Information We Collect">
        <p>
          We may collect personal information including, but not limited to,
          your name, email address, phone number, wallet address, shipment
          details, and any other data you provide when using our platform.
        </p>
      </PolicySection>

      <PolicySection title="2. How We Use Your Information">
        <p>
          Your data is used to facilitate freight operations, process payments,
          verify transactions, provide customer support, and improve our
          services. We may also use aggregated and anonymized data for
          analytics.
        </p>
      </PolicySection>

      <PolicySection title="3. Data Sharing & Disclosure">
        <p>
          We do not sell your personal information. However, we may share it
          with trusted third parties, including logistics partners, payment
          processors, and blockchain networks, when necessary for service
          delivery or legal compliance.
        </p>
      </PolicySection>

      <PolicySection title="4. Blockchain Data">
        <p>
          Please note that transactions recorded on the Stellar blockchain are
          public and immutable. We cannot delete or alter blockchain records
          once they are confirmed.
        </p>
      </PolicySection>

      <PolicySection title="5. Your Rights Under GDPR">
        <p>
          If you are located in the European Economic Area, you have the right
          to access, correct, or request deletion of your personal data. You may
          also object to certain processing activities or request data
          portability.
        </p>
      </PolicySection>

      <PolicySection title="6. Data Security">
        <p>
          We implement strong security measures to protect your data, but we
          cannot guarantee complete protection against all cyber threats or
          unauthorized access.
        </p>
      </PolicySection>

      <PolicySection title="7. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Any changes will
          be reflected on this page with a revised effective date.
        </p>
      </PolicySection>

      <PolicySection title="8. Contact Us">
        <p>
          If you have questions or concerns about this Privacy Policy, please
          contact our support team at{" "}
          <a
            href="mailto:privacy@freightflow.com"
            className="text-blue-600 underline"
          >
            privacy@freightflow.com
          </a>
          .
        </p>
      </PolicySection>
    </main>
  );
}
