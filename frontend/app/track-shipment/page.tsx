"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, MapPin, CheckCircle, Clock, Search } from "lucide-react"

interface TrackingStep {
  id: string
  title: string
  description: string
  timestamp: string
  status: "completed" | "current" | "pending"
  location?: string
}

interface ShipmentData {
  trackingId: string
  status: "in-transit" | "out-for-delivery" | "delivered"
  estimatedDelivery: string
  currentLocation: string
  steps: TrackingStep[]
}

// Mock data for demonstration
const mockShipmentData: ShipmentData = {
  trackingId: "TRK123456789",
  status: "out-for-delivery",
  estimatedDelivery: "Today by 6:00 PM",
  currentLocation: "Local Distribution Center",
  steps: [
    {
      id: "1",
      title: "Order Placed",
      description: "Your order has been confirmed and is being prepared",
      timestamp: "Dec 10, 2024 at 2:30 PM",
      status: "completed",
      location: "Warehouse - New York",
    },
    {
      id: "2",
      title: "In Transit",
      description: "Package is on its way to the destination",
      timestamp: "Dec 11, 2024 at 8:15 AM",
      status: "completed",
      location: "Distribution Center - Chicago",
    },{
      id: "3",
      title: "Out for Delivery",
      description: "Package is out for delivery and will arrive soon",
      timestamp: "Dec 12, 2024 at 9:00 AM",
      status: "current",
      location: "Local Distribution Center",
    },
    {
      id: "4",
      title: "Delivered",
      description: "Package has been successfully delivered",
      timestamp: "Expected today by 6:00 PM",
      status: "pending",
    },
  ],
}

export default function TrackShipmentPage() {
  const [trackingId, setTrackingId] = useState("")
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError("Please enter a tracking ID")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate API call
    setTimeout(() => {
      if (trackingId.toLowerCase().includes("trk")) {
        setShipmentData(mockShipmentData)
      } else {
        setError("Tracking ID not found. Please check and try again.")
        setShipmentData(null)
      }
      setIsLoading(false)
    }, 1000)
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-primary text-primary-foreground"
      case "out-for-delivery":
        return "bg-secondary text-secondary-foreground"
      case "in-transit":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStepIcon = (status: "completed" | "current" | "pending") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-primary" />
      case "current":
        return <Clock className="h-5 w-5 text-secondary" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">ShipTracker</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tracking Input Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-balance">Track Your Shipment</CardTitle>
              <CardDescription className="text-lg">
                Enter your tracking ID to get real-time updates on your package
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tracking ID (e.g., TRK123456789)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                  className="flex-1"
                />

