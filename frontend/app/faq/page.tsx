import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HelpCircle, Truck, Shield, Zap, Globe, Users, Mail } from "lucide-react"

export default function FAQPage() {
  const faqCategories = [
    {
      title: "FreightFlow Platform",
      icon: <Truck className="h-5 w-5" />,
      badge: "Platform",
      questions: [
        {
          question: "What is FreightFlow and how does it work?",
          answer:
            "FreightFlow is a revolutionary Web3 logistics platform that leverages blockchain technology to create transparent, efficient, and secure supply chain management. Our platform connects shippers, carriers, and logistics providers through smart contracts on the Starknet blockchain, enabling automated payments, real-time tracking, and trustless transactions.",
        },
        {
          question: "How does FreightFlow improve traditional logistics?",
          answer:
            "FreightFlow eliminates intermediaries, reduces costs by up to 30%, provides real-time transparency, automates payments through smart contracts, and creates an immutable record of all transactions. This results in faster settlements, reduced disputes, and enhanced trust between all parties in the supply chain.",
        },
      ],
    },
    {
      title: "Smart Contracts",
      icon: <Shield className="h-5 w-5" />,
      badge: "Technology",
      questions: [
        {
          question: "What are smart contracts and why are they important for logistics?",
          answer:
            "Smart contracts are self-executing contracts with terms directly written into code. In logistics, they automatically trigger payments when delivery conditions are met, enforce service level agreements, and eliminate the need for manual verification. This reduces human error, speeds up transactions, and ensures all parties fulfill their obligations.",
        },
        {
          question: "Are smart contracts secure and reliable?",
          answer:
            "Yes, our smart contracts are audited by leading blockchain security firms and deployed on Starknet, which provides enhanced security through zero-knowledge proofs. The contracts are immutable once deployed, meaning they cannot be altered, ensuring consistent and predictable execution of logistics agreements.",
        },
        {
          question: "What happens if there's a dispute with a smart contract?",
          answer:
            "FreightFlow includes built-in dispute resolution mechanisms within our smart contracts. We have oracle integrations for real-world data verification and a governance system where stakeholders can vote on dispute resolutions. Additionally, we maintain emergency pause functions for critical issues while preserving the integrity of the system.",
        },
      ],
    },{
      title: "Starknet Blockchain",
      icon: <Zap className="h-5 w-5" />,
      badge: "Blockchain",
      questions: [
        {
          question: "Why did FreightFlow choose Starknet over other blockchains?",
          answer:
            "Starknet offers superior scalability through zero-knowledge rollups, significantly lower transaction costs compared to Ethereum mainnet, and enhanced privacy features. These benefits are crucial for logistics operations that require high-frequency, low-cost transactions while maintaining data privacy and security.",
        },
        {
          question: "What are the benefits of zero-knowledge proofs in logistics?",
          answer:
            "Zero-knowledge proofs allow FreightFlow to verify transactions and data integrity without revealing sensitive business information. This means companies can prove compliance, delivery status, and payment completion while keeping proprietary logistics data private from competitors.",
        },
      ],
    },
    {
      title: "Web3 & Getting Started",
      icon: <Globe className="h-5 w-5" />,
      badge: "Web3",
      questions: [
        {
          question: "Do I need cryptocurrency knowledge to use FreightFlow?",
          answer:
            "No, FreightFlow is designed with a user-friendly interface that abstracts complex blockchain operations. While transactions occur on-chain, our platform handles wallet management, gas fees, and blockchain interactions seamlessly. Users can focus on their logistics operations without needing deep Web3 expertise.",
        },
        {
          question: "How do I get started with FreightFlow?",
          answer:
            "Getting started is simple: 1) Create your FreightFlow account, 2) Complete KYC verification for compliance, 3) Connect your existing logistics systems through our APIs, 4) Fund your account with supported cryptocurrencies or use our fiat on-ramp, and 5) Start creating smart contracts for your shipments.",
        },
        {
          question: "What are the costs associated with using FreightFlow?",
          answer:
            "FreightFlow charges a small platform fee (typically 1-2% of transaction value) plus minimal Starknet gas fees. This is significantly lower than traditional logistics platforms that charge 3-5% plus additional processing fees. The cost savings from eliminated intermediaries and automated processes typically result in net savings of 20-30%.",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
            </div>