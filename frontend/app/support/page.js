import { Metadata } from 'next';
import { SupportHero } from '@/components/support/SupportHero';
import { FAQSection } from '@/components/support/FAQSection';
import { ContactSupportForm } from '@/components/support/ContactSupportForm';
import { QuickLinks } from '@/components/support/QuickLinks';

export const metadata = {
  title: 'Support & Help Center',
  description: 'Get help and support for FreightFlow. Find answers to frequently asked questions, contact our support team, and access important policy information.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SupportHero />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <FAQSection />
            <ContactSupportForm />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <QuickLinks />
          </div>
        </div>
      </div>
    </div>
  );
} 