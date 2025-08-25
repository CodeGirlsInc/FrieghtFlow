import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SupportHero } from '@/components/support/SupportHero';
import { FAQSection } from '@/components/support/FAQSection';
import { ContactSupportForm } from '@/components/support/ContactSupportForm';
import { QuickLinks } from '@/components/support/QuickLinks';

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (fn) => fn,
    reset: jest.fn(),
    formState: { errors: {} }
  })
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('SupportHero', () => {
  it('renders hero section with search functionality', () => {
    render(<SupportHero />);
    
    expect(screen.getByText('How can we help you?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for help articles, FAQs, or topics...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('handles search form submission', () => {
    const mockScrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    
    render(<SupportHero />);
    
    const searchInput = screen.getByPlaceholderText('Search for help articles, FAQs, or topics...');
    const searchButton = screen.getByText('Search');
    
    fireEvent.change(searchInput, { target: { value: 'shipping' } });
    fireEvent.click(searchButton);
    
    expect(searchInput.value).toBe('shipping');
  });
});

describe('FAQSection', () => {
  it('renders FAQ section with categories', () => {
    render(<FAQSection />);
    
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Pricing & Payments')).toBeInTheDocument();
    expect(screen.getByText('Tracking & Delivery')).toBeInTheDocument();
    expect(screen.getByText('Technical Support')).toBeInTheDocument();
  });

  it('filters FAQs by search term', () => {
    render(<FAQSection />);
    
    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'shipment' } });
    
    expect(screen.getByText('How do I create my first shipment?')).toBeInTheDocument();
  });

  it('filters FAQs by category', () => {
    render(<FAQSection />);
    
    const pricingButton = screen.getByText('💰 Pricing & Payments');
    fireEvent.click(pricingButton);
    
    expect(screen.getByText('How is shipping cost calculated?')).toBeInTheDocument();
    expect(screen.queryByText('How do I create my first shipment?')).not.toBeInTheDocument();
  });

  it('expands and collapses FAQ items', () => {
    render(<FAQSection />);
    
    const firstQuestion = screen.getByText('How do I create my first shipment?');
    fireEvent.click(firstQuestion);
    
    expect(screen.getByText(/To create your first shipment/)).toBeInTheDocument();
    
    fireEvent.click(firstQuestion);
    expect(screen.queryByText(/To create your first shipment/)).not.toBeInTheDocument();
  });

  it('shows no results message when search has no matches', () => {
    render(<FAQSection />);
    
    const searchInput = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    expect(screen.getByText('No FAQs found matching your search.')).toBeInTheDocument();
  });
});

describe('ContactSupportForm', () => {
  it('renders contact form with all required fields', () => {
    render(<ContactSupportForm />);
    
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
    expect(screen.getByText('Send Message')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<ContactSupportForm />);
    
    const nameInput = screen.getByLabelText(/Full Name/);
    const emailInput = screen.getByLabelText(/Email Address/);
    const subjectSelect = screen.getByLabelText(/Subject/);
    const messageTextarea = screen.getByLabelText(/Message/);
    const submitButton = screen.getByText('Send Message');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(subjectSelect, { target: { value: 'technical-issue' } });
    fireEvent.change(messageTextarea, { target: { value: 'I need help with my account.' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Your message has been sent successfully/)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    render(<ContactSupportForm />);
    
    const nameInput = screen.getByLabelText(/Full Name/);
    const emailInput = screen.getByLabelText(/Email Address/);
    const subjectSelect = screen.getByLabelText(/Subject/);
    const messageTextarea = screen.getByLabelText(/Message/);
    const submitButton = screen.getByText('Send Message');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(subjectSelect, { target: { value: 'technical-issue' } });
    fireEvent.change(messageTextarea, { target: { value: 'I need help with my account.' } });
    
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Sending Message...')).toBeInTheDocument();
  });

  it('displays contact information', () => {
    render(<ContactSupportForm />);
    
    expect(screen.getByText('support@freightflow.com')).toBeInTheDocument();
    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('Within 24 hours')).toBeInTheDocument();
    expect(screen.getByText('Mon-Fri 9AM-6PM EST')).toBeInTheDocument();
  });
});

describe('QuickLinks', () => {
  it('renders policy pages section', () => {
    render(<QuickLinks />);
    
    expect(screen.getByText('Policy & Legal')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('renders helpful resources section', () => {
    render(<QuickLinks />);
    
    expect(screen.getByText('Helpful Resources')).toBeInTheDocument();
    expect(screen.getByText('API Documentation')).toBeInTheDocument();
    expect(screen.getByText('Shipping Calculator')).toBeInTheDocument();
    expect(screen.getByText('Track Shipment')).toBeInTheDocument();
  });

  it('renders support statistics', () => {
    render(<QuickLinks />);
    
    expect(screen.getByText('Support Statistics')).toBeInTheDocument();
    expect(screen.getByText('2.5 hours')).toBeInTheDocument();
    expect(screen.getByText('98%')).toBeInTheDocument();
    expect(screen.getByText('24/7')).toBeInTheDocument();
  });

  it('renders emergency contact information', () => {
    render(<QuickLinks />);
    
    expect(screen.getByText('Emergency Support')).toBeInTheDocument();
    expect(screen.getByText('+1 (555) 911-0000')).toBeInTheDocument();
    expect(screen.getByText('emergency@freightflow.com')).toBeInTheDocument();
  });

  it('has correct links for policy pages', () => {
    render(<QuickLinks />);
    
    const termsLink = screen.getByText('Terms of Service').closest('a');
    const privacyLink = screen.getByText('Privacy Policy').closest('a');
    const pricingLink = screen.getByText('Pricing').closest('a');
    
    expect(termsLink).toHaveAttribute('href', '/terms-of-service');
    expect(privacyLink).toHaveAttribute('href', '/policy');
    expect(pricingLink).toHaveAttribute('href', '/pricing');
  });

  it('has external links for resources', () => {
    render(<QuickLinks />);
    
    const apiDocLink = screen.getByText('API Documentation').closest('a');
    expect(apiDocLink).toHaveAttribute('href', 'https://docs.freightflow.com');
    expect(apiDocLink).toHaveAttribute('target', '_blank');
  });
});

// Integration test for the complete support page
describe('Support Page Integration', () => {
  it('renders all support components together', () => {
    render(
      <div>
        <SupportHero />
        <FAQSection />
        <ContactSupportForm />
        <QuickLinks />
      </div>
    );
    
    // Hero section
    expect(screen.getByText('How can we help you?')).toBeInTheDocument();
    
    // FAQ section
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    
    // Contact form
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
    
    // Quick links
    expect(screen.getByText('Policy & Legal')).toBeInTheDocument();
    expect(screen.getByText('Helpful Resources')).toBeInTheDocument();
  });
}); 