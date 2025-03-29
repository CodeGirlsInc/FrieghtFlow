import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Coffee, Wifi, Globe, ArrowRight } from "lucide-react";

// Mock data for office locations
const officeLocations = [
  {
    id: "sf",
    name: "San Francisco",
    address: "123 Market Street, San Francisco, CA 94105",
    image: "/placeholder.svg?height=300&width=500",
    description:
      "Our global headquarters located in the heart of San Francisco's financial district.",
    employees: 250,
    amenities: [
      "Rooftop terrace",
      "Gym",
      "Game room",
      "Catered lunches",
      "Bike storage",
    ],
    teams: [
      "Engineering",
      "Product",
      "Design",
      "Marketing",
      "Sales",
      "Operations",
    ],
    mapUrl: "https://maps.google.com",
  },
  {
    id: "nyc",
    name: "New York",
    address: "456 Broadway, New York, NY 10013",
    image: "/placeholder.svg?height=300&width=500",
    description:
      "Our East Coast hub in the vibrant SoHo neighborhood of Manhattan.",
    employees: 150,
    amenities: [
      "Lounge area",
      "Catered lunches",
      "Phone booths",
      "Wellness room",
    ],
    teams: ["Sales", "Marketing", "Customer Success", "Engineering"],
    mapUrl: "https://maps.google.com",
  },
  {
    id: "london",
    name: "London",
    address: "78 Chancery Lane, London, WC2A 1AA, UK",
    image: "/placeholder.svg?height=300&width=500",
    description:
      "Our European headquarters in the heart of London's legal district.",
    employees: 100,
    amenities: ["Café", "Library", "Meditation room", "Bike storage"],
    teams: ["Engineering", "Sales", "Customer Success", "Legal"],
    mapUrl: "https://maps.google.com",
  },
  {
    id: "singapore",
    name: "Singapore",
    address: "1 Raffles Place, #20-01, Singapore 048616",
    image: "/placeholder.svg?height=300&width=500",
    description:
      "Our Asia-Pacific hub in the central business district of Singapore.",
    employees: 75,
    amenities: [
      "Panoramic views",
      "Gym access",
      "Catered lunches",
      "Prayer room",
    ],
    teams: ["Sales", "Customer Success", "Engineering", "Finance"],
    mapUrl: "https://maps.google.com",
  },
  {
    id: "sydney",
    name: "Sydney",
    address: "123 Pitt Street, Sydney, NSW 2000, Australia",
    image: "/placeholder.svg?height=300&width=500",
    description:
      "Our Australia and New Zealand headquarters in downtown Sydney.",
    employees: 50,
    amenities: ["Beachfront views", "Outdoor workspace", "Café", "Game room"],
    teams: ["Sales", "Customer Success", "Marketing"],
    mapUrl: "https://maps.google.com",
  },
  {
    id: "remote",
    name: "Remote",
    image: "/placeholder.svg?height=300&width=500",
    description:
      "Our distributed team works from all over the world, spanning every continent except Antarctica.",
    employees: 300,
    amenities: [
      "Home office stipend",
      "Co-working space allowance",
      "Regular team retreats",
      "Flexible hours",
    ],
    teams: [
      "Engineering",
      "Product",
      "Design",
      "Marketing",
      "Sales",
      "Customer Success",
      "Operations",
      "Finance",
      "Legal",
      "HR",
    ],
    isRemote: true,
  },
];

export default function OfficeLocations() {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Our Locations</h2>
        <p className="text-lg text-muted-foreground">
          We have offices around the world and a thriving remote culture.
          Whether you prefer to work in an office or remotely, we have
          opportunities for you.
        </p>
      </div>
    </div>
  );
}
