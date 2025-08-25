'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const faqData = [
  {
    category: 'Getting Started',
    icon: '🚀',
    items: [
      {
        question: 'How do I create my first shipment?',
        answer: 'To create your first shipment, log into your FreightFlow account and click on "New Shipment" in the dashboard. Fill in the required details including pickup and delivery locations, package information, and select your preferred shipping method.'
      },
      {
        question: 'What documents do I need to get started?',
        answer: 'You\'ll need a valid business license, insurance documentation, and vehicle registration if you\'re a shipper. For customers, you\'ll need a valid ID and payment method. All documents can be uploaded through our secure portal.'
      },
      {
        question: 'How long does account verification take?',
        answer: 'Account verification typically takes 1-3 business days. We review all submitted documents to ensure compliance with our security standards and regulatory requirements.'
      }
    ]
  },
  {
    category: 'Pricing & Payments',
    icon: '💰',
    items: [
      {
        question: 'How is shipping cost calculated?',
        answer: 'Shipping costs are calculated based on distance, package weight and dimensions, shipping speed, and current market rates. You can get an instant quote by entering your shipment details in our calculator.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, bank transfers, and cryptocurrency payments including Bitcoin and Ethereum. Payment is processed securely through our integrated payment system.'
      },
      {
        question: 'Are there any hidden fees?',
        answer: 'No hidden fees. All costs are clearly displayed upfront including base shipping, fuel surcharges, and any applicable taxes. You\'ll see the total cost before confirming your shipment.'
      }
    ]
  },
  {
    category: 'Tracking & Delivery',
    icon: '📦',
    items: [
      {
        question: 'How can I track my shipment?',
        answer: 'Track your shipment in real-time through your FreightFlow dashboard or by entering your tracking number on our website. You\'ll receive updates via email and SMS at key milestones.'
      },
      {
        question: 'What happens if my package is delayed?',
        answer: 'If your package is delayed, our system will automatically notify you and provide an updated delivery estimate. Our support team is available 24/7 to help resolve any delivery issues.'
      },
      {
        question: 'Can I change the delivery address?',
        answer: 'Yes, you can change the delivery address up to 2 hours before the scheduled pickup. Changes may incur additional fees depending on the new location and timing.'
      }
    ]
  },
  {
    category: 'Technical Support',
    icon: '🔧',
    items: [
      {
        question: 'The app is not loading properly. What should I do?',
        answer: 'Try refreshing the page or clearing your browser cache. If the issue persists, check your internet connection or try accessing from a different browser. Contact support if problems continue.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click on "Forgot Password" on the login page and enter your email address. You\'ll receive a secure link to reset your password. The link expires after 1 hour for security.'
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes, we use enterprise-grade encryption and security measures to protect your data. All information is stored securely and we comply with industry standards for data protection.'
      }
    ]
  }
];

export function FAQSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFAQs = useMemo(() => {
    let filtered = faqData;
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(category => 
        category.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.items.length > 0);
    }
    
    return filtered;
  }, [searchTerm, activeCategory]);

  const toggleItem = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📋' },
    ...faqData.map(cat => ({ id: cat.category.toLowerCase(), name: cat.category, icon: cat.icon }))
  ];

  return (
    <section id="faq-section" className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-6">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No FAQs found matching your search.</p>
          </div>
        ) : (
          filteredFAQs.map((category, categoryIndex) => (
            <div key={category.category} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="mr-2">{category.icon}</span>
                {category.category}
              </h3>
              
              {category.items.map((item, itemIndex) => {
                const key = `${categoryIndex}-${itemIndex}`;
                const isExpanded = expandedItems.has(key);
                
                return (
                  <Card key={key} className="border border-gray-200">
                    <CardHeader 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleItem(categoryIndex, itemIndex)}
                    >
                      <CardTitle className="text-base font-medium flex items-center justify-between">
                        {item.question}
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="pt-0">
                        <p className="text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          ))
        )}
      </div>
    </section>
  );
} 