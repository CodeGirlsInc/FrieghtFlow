'use client';

import Link from 'next/link';
import { 
  FileText, 
  Shield, 
  CreditCard, 
  Truck, 
  Users, 
  Globe, 
  BookOpen,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const quickLinks = [
  {
    title: 'Terms of Service',
    description: 'Our terms and conditions of service',
    icon: FileText,
    href: '/terms-of-service',
    color: 'text-blue-600'
  },
  {
    title: 'Privacy Policy',
    description: 'How we protect your data and privacy',
    icon: Shield,
    href: '/policy',
    color: 'text-green-600'
  },
  {
    title: 'Pricing',
    description: 'Transparent pricing for all services',
    icon: CreditCard,
    href: '/pricing',
    color: 'text-purple-600'
  },
  {
    title: 'How It Works',
    description: 'Learn about our logistics process',
    icon: Truck,
    href: '/how-it-works',
    color: 'text-orange-600'
  },
  {
    title: 'About Us',
    description: 'Learn more about FreightFlow',
    icon: Users,
    href: '/about',
    color: 'text-indigo-600'
  },
  {
    title: 'Contact',
    description: 'Get in touch with our team',
    icon: Globe,
    href: '/contact',
    color: 'text-red-600'
  }
];

const resources = [
  {
    title: 'API Documentation',
    description: 'Developer resources and API guides',
    icon: BookOpen,
    href: 'https://docs.freightflow.com',
    external: true,
    color: 'text-gray-600'
  },
  {
    title: 'Shipping Calculator',
    description: 'Calculate shipping costs instantly',
    icon: CreditCard,
    href: '/calculator',
    color: 'text-teal-600'
  },
  {
    title: 'Track Shipment',
    description: 'Track your packages in real-time',
    icon: Truck,
    href: '/track',
    color: 'text-blue-600'
  }
];

export function QuickLinks() {
  return (
    <div className="space-y-6">
      {/* Policy Pages */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Policy & Legal
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Important documents and legal information
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quickLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.title}
                  href={link.href}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors`}>
                    <IconComponent className={`h-5 w-5 ${link.color}`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {link.title}
                    </h4>
                    <p className="text-xs text-gray-500">{link.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Helpful Resources */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Helpful Resources
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Tools and resources to help you succeed
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resources.map((resource) => {
              const IconComponent = resource.icon;
              return (
                <Link
                  key={resource.title}
                  href={resource.href}
                  target={resource.external ? '_blank' : undefined}
                  rel={resource.external ? 'noopener noreferrer' : undefined}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors`}>
                    <IconComponent className={`h-5 w-5 ${resource.color}`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors flex items-center">
                      {resource.title}
                      {resource.external && (
                        <ExternalLink className="h-3 w-3 ml-1" />
                      )}
                    </h4>
                    <p className="text-xs text-gray-500">{resource.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Support Stats */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Support Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Average Response Time</span>
              <span className="font-semibold">2.5 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Customer Satisfaction</span>
              <span className="font-semibold">98%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Support Available</span>
              <span className="font-semibold">24/7</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Emergency Support
          </h3>
          <p className="text-sm text-red-700 mb-4">
            For urgent shipment issues or system outages
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700">Phone:</span>
              <span className="font-semibold text-red-900">+1 (555) 911-0000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700">Email:</span>
              <span className="font-semibold text-red-900">emergency@freightflow.com</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 