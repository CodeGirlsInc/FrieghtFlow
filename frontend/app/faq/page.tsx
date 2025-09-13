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
    },