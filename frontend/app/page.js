import { Button } from "../components/ui/button";
import BookShipmentForm from "../components/BookShipmentForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Truck,
  Shield,
  Globe,
  Zap,
  Users,
  BarChart3,
  Lock,
  ArrowRight,
  CheckCircle,
  Star,
  Package,
  Clock,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <Package className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">
            FreightFlow
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#benefits"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Benefits
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/support"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Support
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Contact
          </Link>
        </nav>
        <div className="ml-6 flex gap-2">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button size="sm">Get Started</Button>
        </div>
      </header>

      <main className="flex-1">
  {/* Hero Section */}
        {/* Shipment Booking Form Section */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <BookShipmentForm />
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit">
                    <Zap className="w-3 h-3 mr-1" />
                    Powered by Starknet
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Revolutionize Your{" "}
                    <span className="text-blue-600">Logistics</span> with{" "}
                    <span className="text-purple-600">Web3</span>
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    FreightFlow combines cutting-edge blockchain technology with
                    traditional logistics to create a transparent, secure, and
                    efficient supply chain platform for businesses of all sizes.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg">
                    Watch Demo
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>No setup fees</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  width={600}
                  height={400}
                  alt="FreightFlow Dashboard Preview"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline">Core Features</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Web3-Powered Logistics Solutions
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Experience the future of supply chain management with
                  blockchain transparency, smart contracts, and decentralized
                  tracking.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <CardTitle>Blockchain Security</CardTitle>
                  </div>
                  <CardDescription>
                    Immutable transaction records and smart contract automation
                    ensure complete transparency and security for all shipments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Tamper-proof records
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Smart contract payments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Automated compliance
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-8 w-8 text-purple-600" />
                    <CardTitle>Real-Time Tracking</CardTitle>
                  </div>
                  <CardDescription>
                    Track your shipments across the globe with IoT integration
                    and blockchain-verified location updates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      GPS tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Temperature monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Delivery notifications
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                    <CardTitle>Analytics Dashboard</CardTitle>
                  </div>
                  <CardDescription>
                    Comprehensive insights and analytics powered by blockchain
                    data to optimize your supply chain operations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Performance metrics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Cost optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Predictive analytics
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Starknet Integration Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Star className="w-3 h-3 mr-1" />
                  Starknet Integration
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Built on Starknet for{" "}
                  <span className="text-blue-600">Maximum Efficiency</span>
                </h2>
                <p className="max-w-[600px] text-gray-600 md:text-xl">
                  Leverage Starknet's zero-knowledge proofs and Layer 2 scaling
                  to achieve lightning-fast transactions with minimal fees while
                  maintaining Ethereum's security.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Ultra-Low Fees</h3>
                      <p className="text-sm text-gray-600">
                        99% lower transaction costs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <Lock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Zero-Knowledge Proofs</h3>
                      <p className="text-sm text-gray-600">
                        Privacy-preserving verification
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Instant Finality</h3>
                      <p className="text-sm text-gray-600">
                        Sub-second confirmations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Ethereum Security</h3>
                      <p className="text-sm text-gray-600">
                        Inherits L1 security guarantees
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=400&width=500"
                  width={500}
                  height={400}
                  alt="Starknet Integration Diagram"
                  className="mx-auto aspect-square overflow-hidden rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* User Benefits Section */}
        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline">For Every Business</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Tailored Solutions for Your Needs
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Whether you're a small business, large enterprise, or
                  independent shipper, FreightFlow adapts to your unique
                  logistics requirements.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-blue-600 mb-2" />
                  <CardTitle>Small Businesses</CardTitle>
                  <CardDescription>
                    Access enterprise-grade logistics tools without the
                    enterprise price tag.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Affordable pricing plans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Easy carrier integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">
                        Simple analytics dashboard
                      </span>
                    </div>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    Start Small Business Plan
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Globe className="h-12 w-12 text-purple-600 mb-2" />
                  <CardTitle>Large Enterprises</CardTitle>
                  <CardDescription>
                    Scale your operations globally with advanced blockchain
                    infrastructure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Enterprise security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Multi-tenant management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Advanced analytics & AI</span>
                    </div>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    Contact Enterprise Sales
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Truck className="h-12 w-12 text-green-600 mb-2" />
                  <CardTitle>Independent Shippers</CardTitle>
                  <CardDescription>
                    Connect directly with customers and manage your fleet
                    efficiently.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Global marketplace access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Transparent pricing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Instant payments</span>
                    </div>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    Join as Shipper
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Logistics?
                </h2>
                <p className="mx-auto max-w-[700px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of businesses already using FreightFlow to
                  streamline their supply chain operations.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  Schedule Demo
                </Button>
              </div>
              <p className="text-sm text-blue-100">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-gray-900">FreightFlow</span>
        </div>
        <p className="text-xs text-gray-600 sm:ml-4">
          © 2024 FreightFlow. All rights reserved. Powered by Starknet.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-gray-600"
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-gray-600"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-gray-600"
          >
            Documentation
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-gray-600"
          >
            Support
          </Link>
        </nav>
      </footer>
    </div>
  );
}
